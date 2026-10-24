export const PROTOCOL_VERSION = 1;
export const BOARD_WIDTH = 40;
export const BOARD_HEIGHT = 24;
export const TICK_RATE = 60;
export const BASE_RATE = 6;
export const BOOST_RATE = 9;
export const BOOST_TICKS = 240;
export const TIMEOUT_TICKS = 120 * TICK_RATE;
export const MAX_TURN_QUEUE = 2;
export const MAX_MESSAGE_BYTES = 4096;
export const MAX_SNAPSHOT_BYTES = 32 * 1024;
export const MAX_OUTPUT_QUEUE_BYTES = 64 * 1024;
export const MAX_OUTPUT_BYTES = MAX_OUTPUT_QUEUE_BYTES;
export const MAX_QUEUE = MAX_TURN_QUEUE;
export const DIRECTIONS = Object.freeze(['UP', 'RIGHT', 'DOWN', 'LEFT']);
export const DELTAS = Object.freeze({ UP: [0, -1], RIGHT: [1, 0], DOWN: [0, 1], LEFT: [-1, 0] });
export const PHASES = Object.freeze(['LOBBY', 'COUNTDOWN', 'PLAYING', 'PAUSED', 'RESUMING', 'RESULTS', 'ABANDONED']);

export function oppositeDirection(dir) {
  return { UP: 'DOWN', RIGHT: 'LEFT', DOWN: 'UP', LEFT: 'RIGHT' }[dir] ?? null;
}
