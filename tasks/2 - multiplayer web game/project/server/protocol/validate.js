import { DIRECTIONS, MAX_MESSAGE_BYTES, PHASES, PROTOCOL_VERSION } from '../../shared/constants.js';

const types = new Set(['hello', 'turn', 'ready', 'rematch', 'leave']);
const scalarId = /^[A-Za-z0-9_-]{1,64}$/;
const allowedKeys = {
  hello: new Set(['v', 'type', 'requestId', 'mode', 'roomCode', 'credential', 'epoch']),
  turn: new Set(['v', 'type', 'requestId', 'roundId', 'epoch', 'seq', 'dir']),
  ready: new Set(['v', 'type', 'requestId', 'roundId', 'epoch']),
  rematch: new Set(['v', 'type', 'requestId', 'roundId', 'epoch']),
  leave: new Set(['v', 'type', 'requestId', 'roundId', 'epoch'])
};

export function validateRequestId(requestId) {
  return typeof requestId === 'string' && scalarId.test(requestId);
}

export function parseClientMessage(raw, limits = {}) {
  const max = limits.maxMessageBytes ?? MAX_MESSAGE_BYTES;
  if (typeof raw !== 'string' && !Buffer.isBuffer(raw)) return 'BAD_JSON';
  const text = String(raw);
  if (Buffer.byteLength(text) > max) return 'MESSAGE_TOO_LARGE';
  let message;
  try { message = JSON.parse(text); } catch { return 'BAD_JSON'; }
  if (!message || typeof message !== 'object' || Array.isArray(message) || message.v !== PROTOCOL_VERSION || typeof message.type !== 'string' || !types.has(message.type)) return 'BAD_MESSAGE';
  const keys = allowedKeys[message.type];
  if ([...Object.keys(message)].some(key => !keys.has(key))) return 'BAD_MESSAGE';
  if (!validateRequestId(message.requestId)) return 'BAD_MESSAGE';
  if (message.type === 'turn' && (!scalarId.test(message.roundId ?? '') || !Number.isInteger(message.epoch) || !Number.isInteger(message.seq) || !DIRECTIONS.includes(message.dir))) return 'BAD_MESSAGE';
  if (['ready', 'rematch', 'leave'].includes(message.type) && (!scalarId.test(message.roundId ?? '') || !Number.isInteger(message.epoch))) return 'BAD_MESSAGE';
  if (message.type === 'hello' && (!['CREATE', 'JOIN', 'RESUME'].includes(message.mode) || (message.mode === 'JOIN' && !/^[A-Z0-9]{8}$/.test(message.roomCode ?? '')) || (message.mode === 'RESUME' && (typeof message.credential !== 'string' || !Number.isInteger(message.epoch))))) return 'BAD_MESSAGE';
  return message;
}

export function validateOrigin(origin, allowedOrigins = []) {
  return typeof origin === 'string' && (allowedOrigins instanceof Set ? allowedOrigins.has(origin) : allowedOrigins.includes(origin));
}

export function validateTurn(message, roomState) {
  if (message.roundId !== roomState.roundId) return { ok: false, reasonCode: 'STALE_ROUND' };
  if (message.epoch !== roomState.epoch) return { ok: false, reasonCode: 'STALE_EPOCH' };
  if (roomState.phase !== 'PLAYING') return { ok: false, reasonCode: 'PHASE_REJECTED' };
  const current = roomState.snakes?.[message.seat]?.lastAcceptedSeq ?? roomState.snakes?.P1?.lastAcceptedSeq ?? 0;
  if (message.seq <= current) return { ok: false, reasonCode: 'BAD_SEQUENCE' };
  if (!DIRECTIONS.includes(message.dir)) return { ok: false, reasonCode: 'BAD_DIRECTION' };
  return { ok: true };
}
