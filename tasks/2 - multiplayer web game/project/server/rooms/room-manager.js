import crypto from 'node:crypto';
import { buildWelcome } from '../authoritative-server.js';
import { createRound } from '../game/rules.js';

const ROOM_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function randomRoomCode() {
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, byte => ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length]).join('');
}
function credential() { return crypto.randomBytes(32).toString('base64url'); }
function error(code, requestId, message = code) { return { v: 1, type: 'error', code, message, retryable: false, ...(requestId ? { requestId } : {}) }; }
function currentConnection(room, connection) {
  return connection?.roomCode === room.roomCode
    && connection?.seat
    && room.seats[connection.seat]?.connection === connection
    && connection.epoch === room.seats[connection.seat].epoch
    && !connection.controlRevoked;
}
function syncPlayers(room) {
  room.players = ['P1', 'P2'].map(seat => {
    const s = room.seats[seat];
    return { seat, label: s.label, connected: Boolean(s.connection), ready: s.ready };
  });
}
function applyRound(room, round) {
  for (const key of ['roundId', 'board', 'phase', 'serverTick', 'activeTicks', 'timeoutTicks', 'snakes', 'food', 'outcome', 'foodTarget']) room[key] = round[key];
  room.revision = room.serverTick;
}
function finalScores(room) {
  return {
    P1: { length: room.snakes.P1.length, apples: room.snakes.P1.apples },
    P2: { length: room.snakes.P2.length, apples: room.snakes.P2.apples }
  };
}
function forfeit(room, winner) {
  if (room.outcome) return;
  room.phase = 'RESULTS';
  room.countdownUntil = null;
  room.outcome = { reason: 'FORFEIT_DISCONNECT', winner: winner ?? null, final: finalScores(room) };
}
function abandon(room) {
  if (room.outcome) return;
  room.phase = 'ABANDONED';
  room.countdownUntil = null;
  room.outcome = { reason: 'ABANDONED', winner: null, final: finalScores(room) };
}
function releaseExpiredSeat(seat) {
  seat.connection = null;
  seat.credential = null;
  seat.disconnectedAt = null;
  seat.disconnectedTicks = 0;
  seat.interruptionEpisodes = 0;
  seat.ready = false;
  seat.expired = true;
}
function disconnectedDuration(seat, nowTick) {
  return seat.disconnectedAt == null ? 0 : Math.max(0, nowTick - seat.disconnectedAt);
}
function seatExpired(manager, seat, nowTick) {
  if (seat.connection || seat.disconnectedAt == null) return false;
  const elapsed = disconnectedDuration(seat, nowTick);
  return elapsed > manager.graceTicks || seat.disconnectedTicks + elapsed > manager.graceTicks;
}
function assign(room, seat, connection) {
  const s = room.seats[seat];
  s.connection = connection;
  s.credential ??= credential();
  s.expired = false;
  connection.roomCode = room.roomCode;
  connection.seat = seat;
  connection.epoch = s.epoch;
  connection.controlRevoked = false;
  syncPlayers(room);
  return s;
}
function createInternalRoom(manager, code) {
  const room = {
    roomId: `room-${++manager.roomSequence}`,
    roomCode: code,
    roundId: `round-${++manager.roundSequence}`,
    phase: 'LOBBY',
    serverTick: 0,
    revision: 0,
    countdownUntil: null,
    graceTicks: manager.graceTicks,
    seats: {
      P1: { seat: 'P1', label: 'Player 1', connection: null, credential: null, epoch: 1, ready: false, disconnectedAt: null, disconnectedTicks: 0, interruptionEpisodes: 0, expired: false },
      P2: { seat: 'P2', label: 'Player 2', connection: null, credential: null, epoch: 1, ready: false, disconnectedAt: null, disconnectedTicks: 0, interruptionEpisodes: 0, expired: false }
    },
    rematch: { P1: false, P2: false }
  };
  applyRound(room, createRound({ ...manager.roundConfig, roundId: room.roundId, phase: 'LOBBY' }));
  room.phase = 'LOBBY';
  syncPlayers(room);
  manager.rooms.set(code, room);
  return room;
}

export function createRoom(config = {}) {
  return {
    rooms: new Map(),
    codeSource: config.codeSource ?? randomRoomCode,
    nowTick: config.nowTick ?? 0,
    roomSequence: 0,
    roundSequence: 0,
    countdownTicks: config.countdownTicks ?? 180,
    graceTicks: config.graceTicks ?? 900,
    maxInterruptions: config.maxInterruptions ?? 2,
    roundConfig: config.roundConfig ?? {}
  };
}

function roomFor(manager, code) { return manager.rooms.get(code); }

export function joinRoom(manager, roomCode, connection) {
  const room = roomFor(manager, roomCode);
  if (!room || room.phase === 'ABANDONED') return { ok: false, message: error('ROOM_INVALID') };
  const seat = room.seats.P1.connection ? (room.seats.P2.connection ? null : 'P2') : 'P1';
  if (!seat) return { ok: false, message: error('ROOM_FULL') };
  assign(room, seat, connection);
  return { ok: true, room, seat, credential: room.seats[seat].credential };
}

export function handleHello(manager, connection, message) {
  let room;
  let seat;
  let freshCredential = false;
  if (message.mode === 'CREATE') {
    let code = String(manager.codeSource()).toUpperCase();
    while (manager.rooms.has(code)) code = String(manager.codeSource()).toUpperCase();
    room = createInternalRoom(manager, code);
    seat = 'P1';
    assign(room, seat, connection);
    room.seats.P1.ready = false;
    freshCredential = true;
  } else if (message.mode === 'JOIN') {
    const joined = joinRoom(manager, message.roomCode, connection);
    if (!joined.ok) return [joined.message];
    room = joined.room; seat = joined.seat; freshCredential = true;
  } else if (message.mode === 'RESUME') {
    for (const candidate of manager.rooms.values()) {
      const found = ['P1', 'P2'].find(value => candidate.seats[value].credential === message.credential && candidate.seats[value].epoch === message.epoch);
      if (found) { room = candidate; seat = found; break; }
    }
    if (!room) return [error('CREDENTIAL_INVALID', message.requestId)];
    const s = room.seats[seat];
    if (s.connection && s.connection !== connection) return [error('CREDENTIAL_INVALID', message.requestId)];
    if (s.disconnectedAt == null || seatExpired(manager, s, manager.nowTick) || s.interruptionEpisodes > manager.maxInterruptions) return [error('CREDENTIAL_INVALID', message.requestId)];
    const elapsed = disconnectedDuration(s, manager.nowTick);
    if (s.disconnectedTicks + elapsed > manager.graceTicks) return [error('CREDENTIAL_INVALID', message.requestId)];
    if (s.connection && s.connection !== connection) s.connection.controlRevoked = true;
    s.disconnectedTicks += elapsed;
    s.disconnectedAt = null;
    s.epoch += 1;
    assign(room, seat, connection);
    if (room.phase === 'PAUSED') {
      room.phase = 'RESUMING';
      room.countdownUntil = manager.nowTick + manager.countdownTicks;
    }
  } else return [error('BAD_MESSAGE', message.requestId)];
  syncPlayers(room);
  const welcome = buildWelcome(room, seat, freshCredential ? room.seats[seat].credential : undefined);
  welcome.epoch = room.seats[seat].epoch;
  welcome.players = room.players;
  return [welcome];
}

function validateSeatMessage(manager, connection, message) {
  const room = connection?.roomCode ? manager.rooms.get(connection.roomCode) : null;
  if (!room || !currentConnection(room, connection)) return { room: null, error: error('NOT_MEMBER', message.requestId) };
  if (message.roundId !== room.roundId) return { room, error: error('STALE_ROUND', message.requestId) };
  if (message.epoch !== room.seats[connection.seat].epoch) return { room, error: error('STALE_EPOCH', message.requestId) };
  return { room };
}

export function handleReady(manager, connection, message) {
  const checked = validateSeatMessage(manager, connection, message);
  if (checked.error) return [checked.error];
  const room = checked.room;
  const seat = room.seats[connection.seat];
  seat.ready = true;
  if (room.phase === 'LOBBY' && room.seats.P1.ready && room.seats.P2.ready && room.seats.P1.connection && room.seats.P2.connection) {
    room.phase = 'COUNTDOWN';
    room.countdownUntil = manager.nowTick + manager.countdownTicks;
  }
  syncPlayers(room);
  return [];
}

export function handleRematch(manager, connection, message) {
  const checked = validateSeatMessage(manager, connection, message);
  if (checked.error) return [checked.error];
  const room = checked.room;
  if (room.phase !== 'RESULTS') return [error('PHASE_REJECTED', message.requestId)];
  room.rematch[connection.seat] = true;
  if (room.rematch.P1 && room.rematch.P2) {
    room.roundId = `round-${++manager.roundSequence}`;
    applyRound(room, createRound({ ...manager.roundConfig, roundId: room.roundId, phase: 'COUNTDOWN' }));
    room.phase = 'COUNTDOWN';
    room.countdownUntil = manager.nowTick + manager.countdownTicks;
    room.rematch = { P1: false, P2: false };
    for (const value of ['P1', 'P2']) room.seats[value].ready = false;
    syncPlayers(room);
  }
  return [];
}

export function handleLeave(manager, connection, message) {
  const checked = validateSeatMessage(manager, connection, message);
  if (checked.error) return [checked.error];
  const room = checked.room;
  const seat = room.seats[connection.seat];
  seat.connection = null;
  seat.disconnectedAt = manager.nowTick;
  if (room.phase === 'PLAYING' || room.phase === 'PAUSED' || room.phase === 'RESUMING') {
    const winner = room.seats.P1.connection ? 'P1' : room.seats.P2.connection ? 'P2' : null;
    if (winner) forfeit(room, winner); else abandon(room);
  }
  syncPlayers(room);
  return [];
}

export function disconnectSeat(manager, connection, nowTick = manager.nowTick) {
  const room = connection?.roomCode ? manager.rooms.get(connection.roomCode) : null;
  if (!room || !connection.seat) return [];
  const seat = room.seats[connection.seat];
  if (seat.connection !== connection) return [];
  manager.nowTick = Math.max(manager.nowTick, nowTick);
  seat.connection = null;
  seat.disconnectedAt = nowTick;
  seat.interruptionEpisodes += 1;
  if (seat.interruptionEpisodes > manager.maxInterruptions && (room.phase === 'PLAYING' || room.phase === 'PAUSED' || room.phase === 'RESUMING')) {
    const winner = room.seats.P1.connection ? 'P1' : room.seats.P2.connection ? 'P2' : null;
    if (winner) forfeit(room, winner); else abandon(room);
  } else if (room.phase === 'PLAYING' || room.phase === 'RESUMING') {
    room.phase = 'PAUSED';
    room.countdownUntil = null;
  }
  syncPlayers(room);
  return [];
}

export function tickRooms(manager, nowTick) {
  manager.nowTick = nowTick;
  const messages = [];
  for (const room of manager.rooms.values()) {
    if (room.phase === 'COUNTDOWN' && room.countdownUntil !== null && nowTick >= room.countdownUntil) {
      room.phase = 'PLAYING'; room.serverTick = 0; room.activeTicks = 0; room.countdownUntil = null;
    }
    if (room.phase === 'RESUMING' && room.countdownUntil !== null && nowTick >= room.countdownUntil) {
      room.phase = 'PLAYING'; room.countdownUntil = null;
    }
    const lifecyclePhase = ['PAUSED', 'LOBBY', 'COUNTDOWN', 'RESULTS'].includes(room.phase);
    if (lifecyclePhase) {
      const expiredSeats = ['P1', 'P2'].filter(seat => seatExpired(manager, room.seats[seat], nowTick));
      if (expiredSeats.length) {
        for (const seat of expiredSeats) releaseExpiredSeat(room.seats[seat]);
        if (room.phase === 'RESULTS') {
          // Finalized results are immutable; only retention is released.
        } else {
          const connected = ['P1', 'P2'].filter(seat => room.seats[seat].connection);
          if (!connected.length) abandon(room);
          else if (room.phase === 'PAUSED') forfeit(room, connected[0]);
          else {
            room.phase = 'LOBBY';
            room.countdownUntil = null;
            room.seats.P1.ready = false;
            room.seats.P2.ready = false;
          }
        }
      }
    }
    syncPlayers(room);
  }
  return messages;
}
