export const LIMITS = Object.freeze({ maxActions: 8, maxActiveMs: 90_000, maxPageText: 16_000, maxTargets: 80, maxRunBytes: 128 * 1024, maxProposalBytes: 24 * 1024 });
const actionTypes = new Set(['observe', 'scroll', 'click', 'fill']);
const expectedKeys = new Set(['urlIs', 'textAppears', 'targetInViewport', 'valueIs', 'scrollChanged']);
const string = (v, max = 4096) => typeof v === 'string' && v.length <= max;
export class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }
function plain(value) { return value && typeof value === 'object' && !Array.isArray(value); }
export function validateExpected(expected) {
  if (!plain(expected) || Object.keys(expected).length !== 1) throw new ValidationError('Expected condition is invalid');
  const key = Object.keys(expected)[0];
  if (!expectedKeys.has(key) || !string(expected[key], 1000)) throw new ValidationError('Expected condition is invalid');
  return { [key]: expected[key] };
}
export function validateAction(action) {
  if (!plain(action) || !actionTypes.has(action.type)) throw new ValidationError('Action type is not allowed');
  const forbidden = ['selector', 'css', 'xpath', 'script', 'code', 'coordinates', 'url', 'endpoint'];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(action, key))) throw new ValidationError('Unsupported execution field is not allowed');
  if (action.type === 'observe') return { type: 'observe' };
  if (action.type === 'scroll') {
    const pixels = action.pixels === undefined ? 500 : action.pixels;
    if (!['up', 'down'].includes(action.direction) || !Number.isInteger(pixels) || pixels < 1 || pixels > 1000) throw new ValidationError('Scroll is bounded');
    return { type: 'scroll', direction: action.direction, pixels, ...(action.targetId ? { targetId: String(action.targetId).slice(0, 120) } : {}), expected: validateExpected(action.expected) };
  }
  if (!string(action.targetId, 120)) throw new ValidationError('Target is required');
  if (action.type === 'fill') {
    if (!string(action.value, 500)) throw new ValidationError('Fill value is invalid');
    return { type: 'fill', targetId: action.targetId, value: action.value, expected: validateExpected(action.expected) };
  }
  const out = { type: 'click', targetId: action.targetId, expected: validateExpected(action.expected) };
  if (action.cartIntent !== undefined) {
    if (!plain(action.cartIntent)) throw new ValidationError('Cart intent is invalid');
    out.cartIntent = action.cartIntent;
  }
  return out;
}
export function validateProposal(value) {
  if (!plain(value) || JSON.stringify(value).length > LIMITS.maxProposalBytes || !string(value.type, 20)) throw new ValidationError('Proposal is invalid');
  if (value.type === 'plan') {
    if (!Array.isArray(value.steps) || value.steps.length > 8 || value.steps.some((x) => !string(x, 500))) throw new ValidationError('Plan is invalid');
    return { type: 'plan', steps: [...value.steps] };
  }
  if (value.type === 'act') return { type: 'act', action: validateAction(value.action), briefReason: string(value.briefReason ?? '', 500) ? value.briefReason ?? '' : '' };
  if (value.type === 'ask') { if (!string(value.question, 1000)) throw new ValidationError('Question is invalid'); return { type: 'ask', question: value.question }; }
  if (value.type === 'finish') {
    if (!string(value.summary, 2000) || !Array.isArray(value.evidenceRefs) || value.evidenceRefs.some((x) => !string(x, 120))) throw new ValidationError('Finish is invalid');
    return { type: 'finish', summary: value.summary, evidenceRefs: [...value.evidenceRefs] };
  }
  throw new ValidationError('Proposal type is not allowed');
}
export function validateSnapshot(snapshot) {
  if (!plain(snapshot) || !string(snapshot.url, 2048) || !string(snapshot.documentNonce, 200) || !string(snapshot.snapshotId, 200)) throw new ValidationError('Snapshot is invalid');
  return snapshot;
}
