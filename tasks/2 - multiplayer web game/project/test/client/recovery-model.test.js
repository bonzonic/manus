import test from 'node:test';
import assert from 'node:assert/strict';
import { createClientModel, applyWelcome, applySnapshot, applyInputAck, applyEffect, applyResult, applyError, queueTurn, getPresentationState } from '../../public/client-model.js';

const welcome = { v: 1, type: 'welcome', roomId: 'room-1', roomCode: 'AB12CD34', seat: 'P1', epoch: 1, roundId: 'r-1', phase: 'PLAYING', serverTick: 0, board: { w: 40, h: 24 }, rules: { baseRate: 6, boostRate: 9, boostTicks: 240, maxQueue: 2, timeoutTicks: 7200 }, players: [] };
const snapshot = { v: 1, type: 'snapshot', roomId: 'room-1', roundId: 'r-1', phase: 'PLAYING', revision: 1, serverTick: 1, activeTicks: 1, board: { w: 40, h: 24 }, snakes: [{ seat: 'P1', body: [[5, 10], [6, 10]], dir: 'RIGHT', queuedDirs: [], movementCredit: 0, lastAcceptedSeq: 1, lastAppliedSeq: 0, length: 2, apples: 0, boostUntilTick: null }, { seat: 'P2', body: [[34, 13], [33, 13]], dir: 'LEFT', queuedDirs: [], movementCredit: 0, lastAcceptedSeq: 0, lastAppliedSeq: 0, length: 2, apples: 0, boostUntilTick: null }], food: { apples: [], mushrooms: [] }, outcome: null };

test('model accepts confirmed welcome/snapshot/ack/effect/result/error but never awards authoritative state locally', () => {
  const players = [{ seat: 'P1', label: 'Ada', connected: true, ready: true }, { seat: 'P2', label: 'Bea', connected: false, ready: false }];
  let model = applyWelcome(createClientModel(), { ...welcome, players: [] });
  model = applySnapshot(model, snapshot);
  model = applySnapshot(model, { ...snapshot, players, serverTick: 2, revision: 2 });
  assert.deepEqual(model.players, players);
  const stale = applySnapshot(model, { ...snapshot, roundId: 'old-round', players: [{ seat: 'P1', label: 'forged', connected: false, ready: false }] });
  assert.equal(stale.players[0].label, 'Ada');
  assert.deepEqual(model.authoritative.snakes[0].body, [[5, 10], [6, 10]]);
  const beforeApples = model.authoritative.snakes[0].apples;
  model = applyEffect(model, { v: 1, type: 'effect', roomId: 'room-1', roundId: 'r-1', serverTick: 1, effectId: 'e1', kind: 'APPLE_COLLECTED', seat: 'P1', foodId: 'a1', cell: [7, 10], boostUntilTick: null });
  assert.equal(model.authoritative.snakes[0].apples, beforeApples);
  model = applyInputAck(model, { v: 1, type: 'inputAck', roomId: 'room-1', roundId: 'r-1', epoch: 1, requestId: 't1', seq: 1, disposition: 'ACCEPTED', reasonCode: null, serverTick: 1, lastAcceptedSeq: 1, lastAppliedSeq: 0 });
  model = applyResult(model, { v: 1, type: 'result', roomId: 'room-1', roundId: 'r-1', reason: 'WALL', winner: 'P2', final: { P1: { length: 2, apples: 0 }, P2: { length: 2, apples: 0 } }, rematch: { P1: false, P2: false } });
  assert.equal(model.result.reason, 'WALL');
  model = applyError(model, { v: 1, type: 'error', code: 'RATE_LIMIT', message: 'Slow down.', retryable: true });
  assert.equal(model.error.code, 'RATE_LIMIT');
});

test('presentation intent is capped at 150ms and ack reconciliation removes only confirmed turns', () => {
  let model = applySnapshot(applyWelcome(createClientModel(), welcome), snapshot);
  model = queueTurn(model, 'UP', 1000);
  assert.equal(model.pendingTurns.length, 1);
  assert.deepEqual(getPresentationState(model, 1149).intent, 'UP');
  assert.equal(getPresentationState(model, 1151).intent, null);
  model = applyInputAck(model, { v: 1, type: 'inputAck', roomId: 'room-1', roundId: 'r-1', epoch: 1, requestId: 't1', seq: 1, disposition: 'ACCEPTED', reasonCode: null, serverTick: 2, lastAcceptedSeq: 1, lastAppliedSeq: 0 });
  assert.equal(model.pendingTurns.length, 0);
});
