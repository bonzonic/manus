import test from 'node:test';
import assert from 'node:assert/strict';
import { createArenaPolicy, containsCell, cellKey, occupiedCells, legalFoodCells, isBoardFull } from '../../server/game/arena.js';

test('arena exposes bounded cells and excludes occupied and food cells', () => {
  const policy = createArenaPolicy({ width: 3, height: 2 });
  assert.equal(containsCell(policy, [0, 0]), true);
  assert.equal(containsCell(policy, [2, 1]), true);
  assert.equal(containsCell(policy, [3, 1]), false);
  assert.equal(cellKey([2, 1]), '2,1');

  const state = {
    snakes: { P1: { body: [[0, 0], [1, 0]] }, P2: { body: [[2, 1]] } },
    food: { apples: [{ cell: [2, 0] }], mushrooms: [] },
    board: { w: 3, h: 2 }
  };
  assert.deepEqual([...occupiedCells(state)].sort(), ['0,0', '1,0', '2,1']);
  assert.deepEqual(legalFoodCells(state), [[0, 1], [1, 1]]);
  assert.equal(isBoardFull(state), false);

  const full = { ...state, food: { apples: [{ cell: [2, 0] }, { cell: [0, 1] }, { cell: [1, 1] }], mushrooms: [] } };
  assert.equal(isBoardFull(full), true);
});
