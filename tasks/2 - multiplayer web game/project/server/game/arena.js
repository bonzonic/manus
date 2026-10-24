import { BOARD_HEIGHT, BOARD_WIDTH } from '../../shared/constants.js';

export function createArenaPolicy({ width = BOARD_WIDTH, height = BOARD_HEIGHT } = {}) {
  return { width, height };
}

export function containsCell(policy, cell) {
  return Array.isArray(cell) && cell.length === 2 && Number.isInteger(cell[0]) && Number.isInteger(cell[1]) && cell[0] >= 0 && cell[0] < policy.width && cell[1] >= 0 && cell[1] < policy.height;
}

export function cellKey(cell) {
  return `${cell[0]},${cell[1]}`;
}

export function occupiedCells(state) {
  const cells = new Set();
  for (const snake of Object.values(state.snakes ?? {})) {
    for (const cell of snake.body ?? []) cells.add(cellKey(cell));
  }
  return cells;
}

function foodCells(state) {
  const cells = new Set();
  for (const item of state.food?.apples ?? []) cells.add(cellKey(item.cell));
  for (const item of state.food?.mushrooms ?? []) cells.add(cellKey(item.cell));
  return cells;
}

export function legalFoodCells(state) {
  const policy = createArenaPolicy({ width: state.board?.w, height: state.board?.h });
  const blocked = occupiedCells(state);
  for (const key of foodCells(state)) blocked.add(key);
  const cells = [];
  for (let y = 0; y < policy.height; y += 1) {
    for (let x = 0; x < policy.width; x += 1) {
      if (!blocked.has(`${x},${y}`)) cells.push([x, y]);
    }
  }
  return cells;
}

export function isBoardFull(state) {
  return legalFoodCells(state).length === 0;
}
