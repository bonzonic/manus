const DIRECTIONS = new Set(['UP', 'RIGHT', 'DOWN', 'LEFT']);
const clone = value => value == null ? value : structuredClone(value);

export function createClientModel() {
  return { roomId: null, roomCode: null, seat: null, credential: null, epoch: 0, roundId: null, phase: 'LOBBY', serverTick: 0, players: [], authoritative: null, pendingTurns: [], nextSeq: 1, result: null, error: null, effects: [], connection: 'DISCONNECTED', latencyMs: null, presentationIntent: null };
}
function sameRound(model, message) { return !model.roundId || !message.roundId || model.roundId === message.roundId; }
export function applyWelcome(model, message) {
  if (!message || message.v !== 1 || message.type !== 'welcome') return model;
  return { ...model, roomId: message.roomId, roomCode: message.roomCode, seat: message.seat, credential: message.credential ?? model.credential, epoch: message.epoch, roundId: message.roundId, phase: message.phase, serverTick: message.serverTick ?? 0, rules: clone(message.rules), players: clone(message.players ?? model.players), connection: 'CONNECTED', error: null };
}
export function applySnapshot(model, message) {
  if (!message || message.v !== 1 || message.type !== 'snapshot' || !sameRound(model, message)) return model;
  return { ...model, roundId: message.roundId, phase: message.phase, serverTick: message.serverTick, players: message.players ? clone(message.players) : model.players, authoritative: clone(message), result: message.outcome ? clone(message.outcome) : model.result, error: null };
}
export function applyInputAck(model, message) {
  if (!message || message.v !== 1 || message.type !== 'inputAck' || !sameRound(model, message)) return model;
  const accepted = message.disposition === 'ACCEPTED';
  const cutoff = accepted ? (message.lastAcceptedSeq ?? message.seq) : null;
  const pendingTurns = cutoff == null ? model.pendingTurns : model.pendingTurns.filter(turn => turn.seq > cutoff);
  return { ...model, pendingTurns, nextSeq: Math.max(model.nextSeq, (message.lastAcceptedSeq ?? 0) + 1), lastAcceptedSeq: message.lastAcceptedSeq ?? model.lastAcceptedSeq ?? 0, lastAppliedSeq: message.lastAppliedSeq ?? model.lastAppliedSeq ?? 0, lastAck: clone(message) };
}
export function applyEffect(model, message) {
  if (!message || message.v !== 1 || message.type !== 'effect' || !sameRound(model, message)) return model;
  return { ...model, effects: [...model.effects.slice(-31), clone(message)] };
}
export function applyResult(model, message) {
  if (!message || message.v !== 1 || message.type !== 'result' || !sameRound(model, message)) return model;
  return { ...model, phase: 'RESULTS', result: clone(message), pendingTurns: [], presentationIntent: null };
}
export function applyError(model, message) {
  if (!message || message.v !== 1 || message.type !== 'error') return model;
  return { ...model, error: clone(message), connection: message.code === 'SERVER_UNAVAILABLE' ? 'ERROR' : model.connection };
}
export function queueTurn(model, dir, nowMs = Date.now()) {
  if (!DIRECTIONS.has(dir) || model.phase === 'RESULTS') return model;
  const seq = model.nextSeq;
  return { ...model, nextSeq: seq + 1, pendingTurns: [...model.pendingTurns, { seq, dir, atMs: nowMs }].slice(-2), presentationIntent: { dir, atMs: nowMs } };
}
export function resetPresentationIntent(model) { return { ...model, presentationIntent: null }; }
export function getPresentationState(model, nowMs = Date.now()) {
  const intent = model.presentationIntent && nowMs - model.presentationIntent.atMs <= 150 ? model.presentationIntent.dir : null;
  return { intent, dir: intent, pendingTurns: model.pendingTurns.map(turn => turn.dir) };
}
