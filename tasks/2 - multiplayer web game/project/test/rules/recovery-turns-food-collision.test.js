import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptTurn, createRound, step, resolveOutcome } from '../../server/game/rules.js';

function playable(overrides = {}) {
  return createRound({
    roundId: 'b-round',
    appleCount: 0,
    mushroomCount: 0,
    snakes: {
      P1: { body: [[9, 10], [10, 10], [11, 10], [12, 10], [13, 10]], dir: 'RIGHT', movementCredit: 54 },
      P2: { body: [[30, 13], [29, 13], [28, 13], [27, 13], [26, 13]], dir: 'LEFT', movementCredit: 0 }
    },
    ...overrides
  });
}

test('turns accept two future legal directions, reject reversal and a third queued command', () => {
  const state = playable();
  const one = acceptTurn(state, 'P1', { seq: 1, dir: 'UP' });
  const two = acceptTurn(one.state, 'P1', { seq: 2, dir: 'LEFT' });
  const reversal = acceptTurn(two.state, 'P1', { seq: 3, dir: 'RIGHT' });
  const third = acceptTurn(two.state, 'P1', { seq: 3, dir: 'DOWN' });
  assert.equal(one.disposition, 'ACCEPTED');
  assert.equal(two.disposition, 'ACCEPTED');
  assert.equal(reversal.reasonCode, 'BAD_DIRECTION');
  assert.equal(third.reasonCode, 'QUEUE_FULL');
});

test('fixed-step movement waits for integer 60 credit and apple growth is exactly one segment', () => {
  const state = playable({ food: { apples: [{ id: 'a-1', cell: [14, 10] }], mushrooms: [] } });
  const before = step({ ...state, snakes: { ...state.snakes, P1: { ...state.snakes.P1, movementCredit: 48 } } }, 1).state;
  assert.deepEqual(before.snakes.P1.body, state.snakes.P1.body);
  const moved = step({ ...state, snakes: { ...state.snakes, P1: { ...state.snakes.P1, movementCredit: 54 } } }, 1).state;
  assert.equal(moved.snakes.P1.body.length, 6);
  assert.equal(moved.snakes.P1.apples, 1);
  assert.equal(moved.food.apples.length, 0);
});

test('mushroom pickup refreshes a four-second boost without stacking and pause freezes it', () => {
  const first = playable({ food: { apples: [], mushrooms: [{ id: 'm-1', cell: [14, 10] }] } });
  const boosted = step(first, 10).state;
  assert.equal(boosted.snakes.P1.boostUntilTick, 250);
  const refreshedInput = { ...boosted, food: { apples: [], mushrooms: [{ id: 'm-2', cell: [15, 10] }] }, snakes: { ...boosted.snakes, P1: { ...boosted.snakes.P1, body: [[10, 10], [11, 10], [12, 10], [13, 10], [14, 10]], movementCredit: 54, dir: 'RIGHT' } } };
  const refreshed = step(refreshedInput, 11);
  assert.equal(refreshed.events[0].kind, 'BOOST_REFRESHED');
  assert.equal(refreshed.state.snakes.P1.boostUntilTick, 251);
  const paused = step({ ...refreshed.state, phase: 'PAUSED' }, 1000).state;
  assert.equal(paused.serverTick, refreshed.state.serverTick);
  assert.equal(paused.snakes.P1.boostUntilTick, 251);
});

test('terminal collision skips food pickup and resolves simultaneous death deterministically', () => {
  const state = createRound({
    roundId: 'collision', appleCount: 0, mushroomCount: 0,
    food: { apples: [{ id: 'a-collision', cell: [40, 10] }], mushrooms: [] },
    snakes: {
      P1: { body: [[37, 10], [38, 10], [39, 10]], dir: 'RIGHT', movementCredit: 54 },
      P2: { body: [[2, 2], [2, 3], [2, 4]], dir: 'UP', movementCredit: 54 }
    }
  });
  const result = step(state, 1);
  assert.equal(result.state.phase, 'RESULTS');
  assert.equal(result.state.outcome.reason, 'SIMULTANEOUS_DEATH');
  assert.equal(result.state.outcome.winner, null);
  assert.equal(result.state.snakes.P1.apples, 0);
  assert.equal(resolveOutcome(result.state).reason, 'SIMULTANEOUS_DEATH');
});
