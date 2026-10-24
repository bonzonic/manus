import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWelcome, buildInputAck, buildSnapshot, buildEffect, buildResult, MAX_SNAPSHOT_BYTES } from '../../server/authoritative-server.js';

test('authoritative builders emit exact versioned envelopes without credentials outside welcome', () => {
  const room = {
    roomId: 'room-1', roomCode: 'AB12CD34', roundId: 'r-1', phase: 'PLAYING', serverTick: 12,
    board: { w: 40, h: 24 }, epoch: 4,
    players: [{ seat: 'P1', label: 'Player 1', connected: true, ready: true }, { seat: 'P2', label: 'Player 2', connected: true, ready: true }],
    snakes: {
      P1: { seat: 'P1', body: [[5, 10], [6, 10]], dir: 'RIGHT', queuedDirs: [], movementCredit: 0, lastAcceptedSeq: 2, lastAppliedSeq: 1, length: 2, apples: 1, boostUntilTick: null },
      P2: { seat: 'P2', body: [[34, 13], [33, 13]], dir: 'LEFT', queuedDirs: [], movementCredit: 0, lastAcceptedSeq: 1, lastAppliedSeq: 1, length: 2, apples: 0, boostUntilTick: null }
    },
    food: { apples: [{ id: 'a-1', cell: [20, 7] }], mushrooms: [{ id: 'm-1', cell: [22, 16] }] },
    outcome: null, activeTicks: 12, revision: 12
  };
  const welcome = buildWelcome(room, 'P1', 'credential-secret');
  assert.equal(welcome.v, 1);
  assert.equal(welcome.type, 'welcome');
  assert.equal(welcome.credential, 'credential-secret');
  const ack = buildInputAck(room, 'P1', { requestId: 't-1', seq: 2, disposition: 'ACCEPTED', reasonCode: null });
  assert.deepEqual(ack, { v: 1, type: 'inputAck', roomId: 'room-1', roundId: 'r-1', epoch: 4, requestId: 't-1', seq: 2, disposition: 'ACCEPTED', reasonCode: null, serverTick: 12, lastAcceptedSeq: 2, lastAppliedSeq: 1 });
  const snapshot = buildSnapshot(room);
  assert.equal(snapshot.type, 'snapshot');
  assert.equal(snapshot.snakes[0].length, 2);
  assert.equal(JSON.stringify(snapshot).includes('credential'), false);
  assert.ok(Buffer.byteLength(JSON.stringify(snapshot)) <= MAX_SNAPSHOT_BYTES);
});

test('effect and result builders carry only authoritative result fields', () => {
  const effect = buildEffect({ roomId: 'room-1', roundId: 'r-1', serverTick: 7 }, { kind: 'MUSHROOM_COLLECTED', seat: 'P1', foodId: 'm-1', cell: [4, 4], boostUntilTick: 247 });
  assert.deepEqual(effect, { v: 1, type: 'effect', roomId: 'room-1', roundId: 'r-1', serverTick: 7, effectId: effect.effectId, kind: 'MUSHROOM_COLLECTED', seat: 'P1', foodId: 'm-1', cell: [4, 4], boostUntilTick: 247 });
  assert.match(effect.effectId, /^[A-Za-z0-9_-]+$/);
  const result = buildResult({ roomId: 'room-1', roundId: 'r-1', outcome: { reason: 'HEAD_ON', winner: null, final: { P1: { length: 5, apples: 1 }, P2: { length: 5, apples: 1 } } }, rematch: { P1: false, P2: false } });
  assert.deepEqual(result, { v: 1, type: 'result', roomId: 'room-1', roundId: 'r-1', reason: 'HEAD_ON', winner: null, final: { P1: { length: 5, apples: 1 }, P2: { length: 5, apples: 1 } }, rematch: { P1: false, P2: false } });
});
