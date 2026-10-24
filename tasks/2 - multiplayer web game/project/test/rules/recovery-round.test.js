import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound } from '../../server/game/rules.js';

test('createRound builds a deterministic 40 by 24 mirrored five-cell round', () => {
  const first = createRound({ roundId: 'r-fixed' }, () => 0.25);
  const second = createRound({ roundId: 'r-fixed' }, () => 0.25);

  assert.deepEqual(first, second);
  assert.deepEqual(first.board, { w: 40, h: 24 });
  assert.deepEqual(first.snakes.P1.body, [[5, 10], [6, 10], [7, 10], [8, 10], [9, 10]]);
  assert.deepEqual(first.snakes.P2.body, [[34, 13], [33, 13], [32, 13], [31, 13], [30, 13]]);
  assert.equal(first.snakes.P1.length, 5);
  assert.equal(first.snakes.P2.length, 5);
  assert.equal(first.food.apples.length, 4);
  assert.equal(first.food.mushrooms.length, 2);
  assert.equal(first.phase, 'PLAYING');
});
