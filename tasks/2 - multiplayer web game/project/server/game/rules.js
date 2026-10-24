import { BASE_RATE, BOARD_HEIGHT, BOARD_WIDTH, BOOST_RATE, BOOST_TICKS, DELTAS, DIRECTIONS, MAX_TURN_QUEUE, TIMEOUT_TICKS, oppositeDirection } from '../../shared/constants.js';
import { cellKey, containsCell, createArenaPolicy, isBoardFull, legalFoodCells } from './arena.js';

const SEATS = ['P1', 'P2'];
const clone = value => structuredClone(value);
const sameCell = (a, b) => a?.[0] === b?.[0] && a?.[1] === b?.[1];

function randomValue(source) {
  if (typeof source === 'function') return source();
  if (source && typeof source.next === 'function') return source.next();
  return Math.random();
}

function chooseFood(state, count, prefix, randomSource, existing) {
  const result = [];
  const used = new Set(existing);
  for (const cell of legalFoodCells({ ...state, food: { apples: [], mushrooms: [] } })) {
    if (result.length >= count) break;
    const key = cellKey(cell);
    if (!used.has(key)) {
      result.push({ id: `${prefix}-${result.length + 1}`, cell });
      used.add(key);
    }
  }
  if (result.length < count) {
    const candidates = legalFoodCells({ ...state, food: { apples: [], mushrooms: [] } }).filter(c => !used.has(cellKey(c)));
    while (result.length < count && candidates.length) {
      const index = Math.min(candidates.length - 1, Math.floor(randomValue(randomSource) * candidates.length));
      const cell = candidates.splice(index, 1)[0];
      result.push({ id: `${prefix}-${result.length + 1}`, cell });
      used.add(cellKey(cell));
    }
  }
  return result;
}

export function createRound(config = {}, randomSource = Math.random) {
  const board = { w: config.width ?? config.board?.w ?? BOARD_WIDTH, h: config.height ?? config.board?.h ?? BOARD_HEIGHT };
  const snakes = {
    P1: { seat: 'P1', body: [[5, 10], [6, 10], [7, 10], [8, 10], [9, 10]], dir: 'RIGHT', queuedDirs: [], movementCredit: 0, lastAcceptedSeq: 0, lastAppliedSeq: 0, length: 5, apples: 0, boostUntilTick: null, alive: true, deathReason: null },
    P2: { seat: 'P2', body: [[34, 13], [33, 13], [32, 13], [31, 13], [30, 13]], dir: 'LEFT', queuedDirs: [], movementCredit: 0, lastAcceptedSeq: 0, lastAppliedSeq: 0, length: 5, apples: 0, boostUntilTick: null, alive: true, deathReason: null }
  };
  if (config.snakes) {
    for (const seat of SEATS) if (config.snakes[seat]) snakes[seat] = { ...snakes[seat], ...clone(config.snakes[seat]), seat, length: config.snakes[seat].body?.length ?? snakes[seat].length };
  }
  const base = { roundId: config.roundId ?? 'round-1', board, phase: config.phase ?? 'PLAYING', serverTick: config.serverTick ?? 0, activeTicks: config.activeTicks ?? 0, timeoutTicks: config.timeoutTicks ?? TIMEOUT_TICKS, snakes, food: { apples: [], mushrooms: [] }, outcome: null, foodTarget: { apples: config.appleCount ?? 4, mushrooms: config.mushroomCount ?? 2 } };
  const suppliedFood = (config.food ?? config.initialFood) ? clone(config.food ?? config.initialFood) : null;
  base.food = suppliedFood ?? { apples: [], mushrooms: [] };
  const blocked = new Set([...Object.values(snakes).flatMap(s => s.body).map(cellKey), ...base.food.apples.map(f => cellKey(f.cell)), ...base.food.mushrooms.map(f => cellKey(f.cell))]);
  if (!suppliedFood) {
    base.food.apples = chooseFood(base, base.foodTarget.apples, 'a', randomSource, blocked);
    for (const item of base.food.apples) blocked.add(cellKey(item.cell));
    base.food.mushrooms = chooseFood(base, base.foodTarget.mushrooms, 'm', randomSource, blocked);
  }
  return base;
}

export function acceptTurn(inputState, seat, command) {
  const state = clone(inputState);
  const snake = state.snakes?.[seat];
  if (!snake) return { state, disposition: 'REJECTED', reasonCode: 'BAD_MESSAGE', lastAcceptedSeq: 0 };
  if (!Number.isInteger(command?.seq) || command.seq <= snake.lastAcceptedSeq) return { state, disposition: 'REJECTED', reasonCode: 'BAD_SEQUENCE', lastAcceptedSeq: snake.lastAcceptedSeq };
  if (!DIRECTIONS.includes(command?.dir)) return { state, disposition: 'REJECTED', reasonCode: 'BAD_DIRECTION', lastAcceptedSeq: snake.lastAcceptedSeq };
  const comparison = snake.queuedDirs.at(-1)?.dir ?? snake.dir;
  if (oppositeDirection(comparison) === command.dir) return { state, disposition: 'REJECTED', reasonCode: 'BAD_DIRECTION', lastAcceptedSeq: snake.lastAcceptedSeq };
  if (snake.queuedDirs.length >= MAX_TURN_QUEUE) return { state, disposition: 'REJECTED', reasonCode: 'QUEUE_FULL', lastAcceptedSeq: snake.lastAcceptedSeq };
  snake.queuedDirs.push({ dir: command.dir, seq: command.seq });
  snake.lastAcceptedSeq = command.seq;
  return { state, disposition: 'ACCEPTED', reasonCode: null, lastAcceptedSeq: snake.lastAcceptedSeq };
}

function proposedHead(snake) {
  const head = snake.body.at(-1);
  const delta = DELTAS[snake.dir];
  return [head[0] + delta[0], head[1] + delta[1]];
}

function collectOutcome(state, reason) {
  const alive = SEATS.filter(seat => state.snakes[seat].alive);
  let winner = null;
  if (reason === 'TIMEOUT_LENGTH') winner = state.snakes.P1.length === state.snakes.P2.length ? null : (state.snakes.P1.length > state.snakes.P2.length ? 'P1' : 'P2');
  else if (alive.length === 1) winner = alive[0];
  return { reason, winner, final: { P1: { length: state.snakes.P1.length, apples: state.snakes.P1.apples }, P2: { length: state.snakes.P2.length, apples: state.snakes.P2.apples } } };
}

export function step(inputState, tick = inputState.serverTick + 1) {
  const state = clone(inputState);
  const events = [];
  if (state.phase !== 'PLAYING' || state.outcome) return { state, events };
  state.serverTick = tick;
  state.activeTicks += 1;
  const due = {};
  const heads = {};
  const oldHeads = {};
  for (const seat of SEATS) {
    const snake = state.snakes[seat];
    if (!snake.alive) continue;
    const rate = snake.boostUntilTick !== null && tick < snake.boostUntilTick ? BOOST_RATE : BASE_RATE;
    snake.movementCredit += rate;
    due[seat] = snake.movementCredit >= 60;
    if (due[seat]) {
      snake.movementCredit -= 60;
      if (snake.queuedDirs.length) {
        const command = snake.queuedDirs.shift();
        snake.dir = command.dir;
        snake.lastAppliedSeq = command.seq;
      }
      oldHeads[seat] = snake.body.at(-1);
      heads[seat] = proposedHead(snake);
    }
  }
  const dead = new Map();
  if (due.P1 && due.P2 && sameCell(heads.P1, heads.P2)) { dead.set('P1', 'HEAD_ON'); dead.set('P2', 'HEAD_ON'); }
  else if (due.P1 && due.P2 && sameCell(heads.P1, oldHeads.P2) && sameCell(heads.P2, oldHeads.P1)) { dead.set('P1', 'HEAD_SWAP'); dead.set('P2', 'HEAD_SWAP'); }
  for (const seat of SEATS) {
    if (!due[seat] || dead.has(seat)) continue;
    const head = heads[seat];
    if (!containsCell(createArenaPolicy({ width: state.board.w, height: state.board.h }), head)) dead.set(seat, 'WALL');
    else {
      for (const other of SEATS) {
        if (state.snakes[other].body.some(cell => sameCell(cell, head))) { dead.set(seat, 'BODY'); break; }
      }
    }
  }
  for (const [seat, reason] of dead) { state.snakes[seat].alive = false; state.snakes[seat].deathReason = reason; }
  const collision = dead.size > 0;
  for (const seat of SEATS) {
    const snake = state.snakes[seat];
    if (!due[seat] || !snake.alive) continue;
    const head = heads[seat];
    snake.body.push(head);
    const apple = state.food.apples.find(item => sameCell(item.cell, head));
    const mushroom = state.food.mushrooms.find(item => sameCell(item.cell, head));
    if (!collision && apple) {
      state.food.apples = state.food.apples.filter(item => item.id !== apple.id);
      snake.apples += 1;
      snake.length = snake.body.length;
      events.push({ kind: 'APPLE_COLLECTED', seat, foodId: apple.id, cell: apple.cell, boostUntilTick: null });
    } else if (!collision && mushroom) {
      state.food.mushrooms = state.food.mushrooms.filter(item => item.id !== mushroom.id);
      const hadBoost = snake.boostUntilTick !== null && snake.boostUntilTick > tick;
      snake.boostUntilTick = tick + BOOST_TICKS;
      snake.body.shift();
      snake.length = snake.body.length;
      events.push({ kind: hadBoost ? 'BOOST_REFRESHED' : 'MUSHROOM_COLLECTED', seat, foodId: mushroom.id, cell: mushroom.cell, boostUntilTick: snake.boostUntilTick });
    } else {
      snake.body.shift();
      snake.length = snake.body.length;
    }
  }
  if (!collision) {
    const used = new Set([...Object.values(state.snakes).flatMap(s => s.body).map(cellKey), ...state.food.apples.map(f => cellKey(f.cell)), ...state.food.mushrooms.map(f => cellKey(f.cell))]);
    const legal = legalFoodCells(state).filter(cell => !used.has(cellKey(cell)));
    const addFood = (items, target, prefix) => {
      while (items.length < target && legal.length) { const cell = legal.shift(); items.push({ id: `${prefix}-${state.serverTick}-${items.length + 1}`, cell }); used.add(cellKey(cell)); }
    };
    addFood(state.food.apples, state.foodTarget.apples, 'a');
    addFood(state.food.mushrooms, state.foodTarget.mushrooms, 'm');
  }
  if (collision) {
    const anyHeadOn = [...dead.values()].some(r => r === 'HEAD_ON');
    const anySwap = [...dead.values()].some(r => r === 'HEAD_SWAP');
    const bothDead = SEATS.every(seat => !state.snakes[seat].alive);
    const reason = anyHeadOn ? 'HEAD_ON' : anySwap ? 'HEAD_SWAP' : bothDead ? 'SIMULTANEOUS_DEATH' : 'BODY';
    state.outcome = collectOutcome(state, reason);
    state.phase = 'RESULTS';
  } else if (state.activeTicks >= state.timeoutTicks) {
    state.outcome = collectOutcome(state, state.snakes.P1.length === state.snakes.P2.length ? 'TIMEOUT_DRAW' : 'TIMEOUT_LENGTH');
    state.phase = 'RESULTS';
  } else if (isBoardFull(state)) {
    state.outcome = collectOutcome(state, 'BOARD_FULL');
    state.phase = 'RESULTS';
  }
  return { state, events };
}

export function resolveOutcome(state) {
  if (state.outcome) return clone(state.outcome);
  const dead = SEATS.filter(seat => !state.snakes?.[seat]?.alive);
  if (dead.length === 2) return collectOutcome(state, 'SIMULTANEOUS_DEATH');
  if (dead.length === 1) return collectOutcome(state, 'BODY');
  if (state.activeTicks >= state.timeoutTicks) return collectOutcome(state, state.snakes.P1.length === state.snakes.P2.length ? 'TIMEOUT_DRAW' : 'TIMEOUT_LENGTH');
  if (isBoardFull(state)) return collectOutcome(state, 'BOARD_FULL');
  return null;
}
