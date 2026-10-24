import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoom, handleHello, handleReady, handleRematch, disconnectSeat, tickRooms } from '../../server/rooms/room-manager.js';

test('disconnect pauses play, resume rotates epoch and old socket loses control within grace', () => {
  let nextCode = 0;
  const manager = createRoom({ codeSource: () => `CD34EF${String(++nextCode).padStart(2, '0')}`, nowTick: 0 });
  const oldSocket = { id: 'old' };
  const welcome = handleHello(manager, oldSocket, { v: 1, type: 'hello', requestId: 'h1', mode: 'CREATE' })[0];
  const room = manager.rooms.get(welcome.roomCode);
  room.phase = 'PLAYING';
  const oldEpoch = welcome.epoch;
  disconnectSeat(manager, oldSocket, 10);
  assert.equal(room.phase, 'PAUSED');
  const newSocket = { id: 'new' };
  const resumed = handleHello(manager, newSocket, { v: 1, type: 'hello', requestId: 'resume', mode: 'RESUME', credential: welcome.credential, epoch: oldEpoch });
  assert.equal(resumed[0].type, 'welcome');
  assert.equal(resumed[0].epoch, oldEpoch + 1);
  assert.equal(room.seats.P1.connection, newSocket);
  assert.notEqual(room.seats.P1.connection, oldSocket);
  assert.equal(handleReady(manager, oldSocket, { requestId: 'stale', roundId: room.roundId, epoch: oldEpoch })[0].code, 'NOT_MEMBER');
  assert.equal(handleHello(manager, { id: 'takeover' }, { v: 1, type: 'hello', requestId: 'takeover', mode: 'RESUME', credential: welcome.credential, epoch: resumed[0].epoch })[0].code, 'CREDENTIAL_INVALID');
  assert.equal(handleHello(manager, { id: 'wrong-epoch' }, { v: 1, type: 'hello', requestId: 'wrong-epoch', mode: 'RESUME', credential: welcome.credential, epoch: oldEpoch })[0].code, 'CREDENTIAL_INVALID');
});

test('resume keeps the room frozen through a three-second RESUMING countdown', () => {
  const manager = createRoom({ codeSource: () => 'RS12UV34', nowTick: 0, countdownTicks: 3, graceTicks: 20 });
  const oldSocket = { id: 'old' };
  const welcome = handleHello(manager, oldSocket, { v: 1, type: 'hello', requestId: 'h', mode: 'CREATE' })[0];
  const room = manager.rooms.get(welcome.roomCode);
  room.phase = 'PLAYING'; room.serverTick = 44; room.activeTicks = 44; room.snakes.P1.boostUntilTick = 100;
  disconnectSeat(manager, oldSocket, 10);
  tickRooms(manager, 12);
  const resumed = handleHello(manager, { id: 'new' }, { v: 1, type: 'hello', requestId: 'resume', mode: 'RESUME', credential: welcome.credential, epoch: welcome.epoch });
  assert.equal(resumed[0].type, 'welcome');
  assert.equal(room.phase, 'RESUMING');
  assert.equal(room.serverTick, 44);
  assert.equal(room.snakes.P1.boostUntilTick, 100);
  tickRooms(manager, 14);
  assert.equal(room.phase, 'RESUMING');
  tickRooms(manager, 15);
  assert.equal(room.phase, 'PLAYING');
});

test('third interruption or exhausted cumulative grace forfeits or abandons', () => {
  const manager = createRoom({ codeSource: () => 'WX56YZ78', nowTick: 0, graceTicks: 5, maxInterruptions: 2 });
  const p1 = { id: 'p1' }; const p2 = { id: 'p2' };
  const w1 = handleHello(manager, p1, { v: 1, type: 'hello', requestId: 'h1', mode: 'CREATE' })[0];
  const w2 = handleHello(manager, p2, { v: 1, type: 'hello', requestId: 'h2', mode: 'JOIN', roomCode: w1.roomCode })[0];
  const room = manager.rooms.get(w1.roomCode); room.phase = 'PLAYING';
  disconnectSeat(manager, p1, 0);
  const r1 = handleHello(manager, { id: 'r1' }, { v: 1, type: 'hello', requestId: 'r1', mode: 'RESUME', credential: w1.credential, epoch: w1.epoch })[0];
  assert.equal(r1.type, 'welcome'); room.phase = 'PLAYING';
  disconnectSeat(manager, room.seats.P1.connection, 1);
  const r2 = handleHello(manager, { id: 'r2' }, { v: 1, type: 'hello', requestId: 'r2', mode: 'RESUME', credential: w1.credential, epoch: r1.epoch })[0];
  assert.equal(r2.type, 'welcome'); room.phase = 'PLAYING';
  const third = room.seats.P1.connection;
  disconnectSeat(manager, third, 2);
  assert.equal(room.phase, 'RESULTS');
  assert.equal(room.outcome.winner, 'P2');
  assert.equal(room.seats.P2.connection, p2);
  assert.equal(w2.seat, 'P2');
});

test('both result-seat rematch opt-ins create a fresh round identity and countdown', () => {
  const manager = createRoom({ codeSource: () => 'EF56GH78', nowTick: 0 });
  const p1 = { id: 'r1' };
  const p2 = { id: 'r2' };
  const one = handleHello(manager, p1, { v: 1, type: 'hello', requestId: 'h1', mode: 'CREATE' })[0];
  handleHello(manager, p2, { v: 1, type: 'hello', requestId: 'h2', mode: 'JOIN', roomCode: one.roomCode });
  const room = manager.rooms.get(one.roomCode);
  room.phase = 'RESULTS';
  room.outcome = { reason: 'WALL', winner: 'P2', final: { P1: { length: 5, apples: 0 }, P2: { length: 5, apples: 0 } } };
  const oldRound = room.roundId;
  handleRematch(manager, p1, { v: 1, type: 'rematch', requestId: 'm1', roundId: oldRound, epoch: 1 });
  assert.equal(room.phase, 'RESULTS');
  handleRematch(manager, p2, { v: 1, type: 'rematch', requestId: 'm2', roundId: oldRound, epoch: 1 });
  assert.notEqual(room.roundId, oldRound);
  assert.equal(room.phase, 'COUNTDOWN');
});

test('paused room expires into abandonment when both seats remain absent past grace', () => {
  const manager = createRoom({ codeSource: () => 'IJ90KL12', nowTick: 0, graceTicks: 900 });
  const p1 = { id: 'p1' };
  const welcome = handleHello(manager, p1, { v: 1, type: 'hello', requestId: 'h', mode: 'CREATE' })[0];
  const room = manager.rooms.get(welcome.roomCode);
  room.phase = 'PLAYING';
  disconnectSeat(manager, p1, 0);
  tickRooms(manager, 901);
  assert.equal(room.phase, 'ABANDONED');
  assert.equal(room.outcome.reason, 'ABANDONED');
});

test('lobby seat expiry returns the remaining member to lobby and result expiry preserves final result', () => {
  const manager = createRoom({ codeSource: () => 'LOBBY123', graceTicks: 3 });
  const p1 = { id: 'p1' }; const p2 = { id: 'p2' };
  const one = handleHello(manager, p1, { v: 1, type: 'hello', requestId: 'h1', mode: 'CREATE' })[0];
  handleHello(manager, p2, { v: 1, type: 'hello', requestId: 'h2', mode: 'JOIN', roomCode: one.roomCode });
  const room = manager.rooms.get(one.roomCode);
  disconnectSeat(manager, p2, 0); tickRooms(manager, 4);
  assert.equal(room.phase, 'LOBBY');
  assert.equal(room.seats.P1.connection, p1);
  assert.equal(room.seats.P2.credential, null);
  room.phase = 'RESULTS'; room.outcome = { reason: 'WALL', winner: 'P1', final: { P1: { length: 5, apples: 0 }, P2: { length: 4, apples: 0 } } };
  const final = structuredClone(room.outcome);
  disconnectSeat(manager, p1, 4); tickRooms(manager, 8);
  assert.equal(room.phase, 'RESULTS');
  assert.deepEqual(room.outcome, final);
  assert.equal(room.seats.P1.credential, null);
});
