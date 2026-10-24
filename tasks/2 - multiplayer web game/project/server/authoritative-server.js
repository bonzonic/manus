import crypto from 'node:crypto';
import { BASE_RATE, BOOST_RATE, BOOST_TICKS, MAX_OUTPUT_QUEUE_BYTES, MAX_SNAPSHOT_BYTES, MAX_TURN_QUEUE, PROTOCOL_VERSION, TIMEOUT_TICKS } from '../shared/constants.js';

export { MAX_SNAPSHOT_BYTES };
export const MAX_OUTPUT_BYTES = MAX_OUTPUT_QUEUE_BYTES;

export function buildWelcome(room, seat, credential) {
  const players = room.players ?? Object.values(room.seats ?? {}).map(value => ({ seat: value.seat, label: value.label, connected: value.connected, ready: value.ready }));
  const message = { v: PROTOCOL_VERSION, type: 'welcome', roomId: room.roomId, roomCode: room.roomCode, seat, epoch: room.epoch ?? room.seats?.[seat]?.epoch ?? 1, roundId: room.roundId, phase: room.phase, serverTick: room.serverTick ?? 0, board: room.board ?? { w: 40, h: 24 }, rules: { baseRate: BASE_RATE, boostRate: BOOST_RATE, boostTicks: BOOST_TICKS, maxQueue: MAX_TURN_QUEUE, timeoutTicks: TIMEOUT_TICKS }, players };
  if (credential) message.credential = credential;
  return message;
}

export function buildInputAck(room, seat, input) {
  const snake = room.snakes?.[seat] ?? {};
  return { v: PROTOCOL_VERSION, type: 'inputAck', roomId: room.roomId, roundId: room.roundId, epoch: room.epoch ?? room.seats?.[seat]?.epoch ?? 1, requestId: input.requestId, seq: input.seq, disposition: input.disposition, reasonCode: input.reasonCode ?? null, serverTick: room.serverTick ?? 0, lastAcceptedSeq: snake.lastAcceptedSeq ?? input.seq, lastAppliedSeq: snake.lastAppliedSeq ?? 0 };
}

function publicSnake(snake) {
  return { seat: snake.seat, body: snake.body, dir: snake.dir, queuedDirs: (snake.queuedDirs ?? []).map(item => item.dir ?? item), movementCredit: snake.movementCredit ?? 0, lastAcceptedSeq: snake.lastAcceptedSeq ?? 0, lastAppliedSeq: snake.lastAppliedSeq ?? 0, length: snake.body.length, apples: snake.apples ?? 0, boostUntilTick: snake.boostUntilTick ?? null };
}

export function buildSnapshot(room) {
  const players = room.players ?? Object.values(room.seats ?? {}).map(player => ({ seat: player.seat, label: player.label, connected: Boolean(player.connection ?? player.connected), ready: Boolean(player.ready) }));
  return { v: PROTOCOL_VERSION, type: 'snapshot', roomId: room.roomId, roundId: room.roundId, phase: room.phase, revision: room.revision ?? room.serverTick ?? 0, serverTick: room.serverTick ?? 0, activeTicks: room.activeTicks ?? 0, board: room.board ?? { w: 40, h: 24 }, players: players.map(player => ({ seat: player.seat, label: player.label, connected: Boolean(player.connected), ready: Boolean(player.ready) })), snakes: Object.values(room.snakes ?? {}).map(publicSnake), food: { apples: room.food?.apples ?? [], mushrooms: room.food?.mushrooms ?? [] }, outcome: room.outcome ?? null };
}

export function buildEffect(room, event) {
  return { v: PROTOCOL_VERSION, type: 'effect', roomId: room.roomId, roundId: room.roundId, serverTick: room.serverTick ?? 0, effectId: crypto.randomUUID().replaceAll('-', ''), kind: event.kind, seat: event.seat, foodId: event.foodId, cell: event.cell, boostUntilTick: event.boostUntilTick ?? null };
}

export function buildResult(room) {
  return { v: PROTOCOL_VERSION, type: 'result', roomId: room.roomId, roundId: room.roundId, reason: room.outcome.reason, winner: room.outcome.winner ?? null, final: room.outcome.final, rematch: room.rematch ?? { P1: false, P2: false } };
}

export function createAuthoritativeServer(config = {}) {
  let runtime = null;
  return {
    get ready() { return Boolean(runtime?.ready); },
    address: () => runtime?.address(),
    start: async () => { const { createGameServer } = await import('./index.js'); runtime = createGameServer(config); await runtime.start(); return runtime; },
    close: async () => { if (runtime) await runtime.close(); }
  };
}
