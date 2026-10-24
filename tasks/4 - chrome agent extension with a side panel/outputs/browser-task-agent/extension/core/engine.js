import { validateAction, LIMITS } from './contracts.js';
import { evaluateAction, approvalDigest, evidenceMatchesCart } from './policy.js';
const terminal = new Set(['SUCCEEDED', 'PARTIAL', 'NEEDS_USER', 'FAILED', 'CANCELLED', 'INTERRUPTED']);
const copy = (run) => ({ ...run, log: Array.isArray(run.log) ? [...run.log] : [] });
const targetOf = (snapshot, action) => snapshot?.targets?.find((t) => t.targetId === action?.targetId) ?? null;
const safeUrlOrigin = (url) => { try { return new URL(url).origin; } catch { return null; } };
const hasText = (snapshot, value) => String(snapshot?.text ?? '').includes(String(value ?? ''));
const observedCondition = (expected, before, after, result, action) => {
  if (!expected || typeof expected !== 'object') return false;
  const key = Object.keys(expected)[0]; const value = expected[key];
  if (key === 'urlIs') return before?.url !== after?.url && after?.url === value;
  if (key === 'textAppears') return hasText(after, value) && (!hasText(before, value) || (action?.cartIntent && before?.cartEvidence?.fingerprint !== after?.cartEvidence?.fingerprint));
  if (key === 'valueIs') return result?.valueVerified === true && !!after;
  if (key === 'targetInViewport') return after?.targets?.some((t) => t.targetId === action?.targetId && t.inViewport === true) && !!after;
  if (key === 'scrollChanged') return result?.status === 'verified' && (result?.evidence ?? []).some((x) => /viewport changed|scroll/i.test(x));
  return false;
};
function verifyPostAction(action, before, after, result) {
  if (!after || !observedCondition(action.expected, before, after, result, action)) return { status: 'unknown', evidence: ['action sent; fresh post-action evidence did not satisfy the expected condition'] };
  if (action.cartIntent && !evidenceMatchesCart(action, after, { regionId: action.cartIntent.regionId })) return { status: 'unknown', evidence: ['cart action sent; current rendered cart intent evidence is not complete'] };
  return { status: 'verified', evidence: ['fresh post-action observation matched the expected condition'], evidenceRefs: [after.snapshotId] };
}
export function validateFinishEvidence(finish, context = {}) {
  const refs = Array.isArray(finish?.evidenceRefs) ? finish.evidenceRefs : [];
  const known = new Set([context.snapshotId, ...(Array.isArray(context.results) ? context.results.flatMap((r) => Array.isArray(r?.evidenceRefs) ? r.evidenceRefs : []) : [])].filter(Boolean));
  return { valid: refs.length > 0 && refs.every((ref) => known.has(ref)) };
}
export async function advanceRun(run, proposal, deps = {}) {
  const next = copy(run);
  if (terminal.has(next.phase) || next.phase === 'PAUSED') return next;
  if (!proposal || proposal.type !== 'act') return next;
  let action; try { action = validateAction(proposal.action); } catch (error) { next.phase = 'FAILED'; next.result = { status: 'failed', evidence: [error.message] }; return next; }
  const decision = evaluateAction(action, deps.snapshot ?? next.snapshot ?? {}, next);
  if (decision.decision === 'block') { next.phase = 'NEEDS_USER'; next.result = { status: 'blocked', evidence: [decision.reason] }; return next; }
  if (decision.decision === 'approve') {
    next.pendingAction = action; next.pendingReason = proposal.briefReason ?? ''; next.phase = 'AWAITING_APPROVAL'; next.approval = { approved: false, digest: await approvalDigest(next, action, deps.snapshot ?? next.snapshot ?? {}) }; return next;
  }
  return dispatchAction(next, action, deps);
}
export async function approvePending(run, digest) { if (run.phase !== 'AWAITING_APPROVAL' || !run.pendingAction || run.approval?.digest !== digest) return { ...run, phase: 'NEEDS_USER', pendingAction: null, approval: null, result: { status: 'blocked', evidence: ['approval digest did not match; stale action discarded'] } }; return { ...run, phase: 'RUNNING', approval: { ...run.approval, approved: true }, dispatchState: 'READY' }; }
async function dispatchAction(run, action, deps) {
  if (run.dispatchState === 'DISPATCHING' || run.dispatchState === 'INTERRUPTED') return { ...run, phase: 'INTERRUPTED', result: { status: 'unknown', evidence: ['dispatch outcome is unknown; no replay'] } };
  const before = run.snapshot ?? {};
  const next = { ...run, dispatchState: 'DISPATCHING', pendingAction: action };
  if (deps.save) await deps.save(next);
  let sent; try { sent = await deps.execute(action); } catch { sent = { status: 'unknown', evidence: ['action outcome is unknown'] }; }
  let after = null; try { after = await (deps.observeAfter ?? deps.observe)?.(); } catch { after = null; }
  if (after) next.snapshot = after;
  const result = sent?.status === 'blocked' ? sent : verifyPostAction(action, before, after, sent);
  next.dispatchState = 'DONE'; next.result = result;
  if (result?.status === 'verified') next.phase = 'RUNNING'; else if (result?.status === 'unknown') next.phase = 'PARTIAL'; else next.phase = result?.status === 'blocked' ? 'NEEDS_USER' : 'FAILED';
  next.results = [...(Array.isArray(next.results) ? next.results : []), result].slice(-LIMITS.maxActions);
  next.pendingAction = null; next.approval = null; next.stepIndex = (next.stepIndex ?? 0) + 1;
  if ((next.stepIndex ?? 0) >= LIMITS.maxActions && next.phase === 'RUNNING') next.phase = 'PARTIAL';
  return next;
}
async function freshApprovalCheck(run, action, deps) {
  if (typeof deps.observe !== 'function') return { ok: false, reason: 'fresh page observation is unavailable; request new approval' };
  let fresh; try { fresh = await deps.observe(); } catch { return { ok: false, reason: 'fresh page observation failed; request new approval' }; }
  if (!fresh || safeUrlOrigin(fresh.url) !== run.origin) return { ok: false, reason: 'origin changed; request a new approval on the explicit Malaysia origin' };
  const oldTarget = targetOf(run.snapshot, action); const freshTarget = targetOf(fresh, action);
  if (action.type !== 'observe' && action.type !== 'scroll' && (!oldTarget || !freshTarget || oldTarget.fingerprint !== freshTarget.fingerprint)) return { ok: false, reason: 'current target changed; request a new approval' };
  const decision = evaluateAction(action, fresh, run);
  if (decision.decision === 'block') return { ok: false, reason: decision.reason };
  if (action.cartIntent && !evidenceMatchesCart(action, fresh, run)) return { ok: false, reason: 'cart evidence changed or is ambiguous; request a new approval' };
  if (!run.approval?.digest || run.approval.digest !== await approvalDigest(run, action, fresh)) return { ok: false, reason: 'document or snapshot identity changed; request a new approval' };
  return { ok: true, snapshot: fresh };
}
export async function dispatchApproved(run, deps = {}) {
  if (!run.approval?.approved || !run.pendingAction) return { ...run, phase: run.phase ?? 'NEEDS_USER' };
  const checked = await freshApprovalCheck(run, run.pendingAction, deps);
  if (!checked.ok) return { ...run, phase: 'NEEDS_USER', dispatchState: 'READY', pendingAction: null, approval: null, result: { status: 'blocked', evidence: [checked.reason] } };
  return dispatchAction({ ...run, phase: 'RUNNING', snapshot: checked.snapshot }, run.pendingAction, deps);
}
export function pauseRun(run) { return terminal.has(run.phase) ? run : { ...run, phase: 'PAUSED', generation: (run.generation ?? 0) + 1 }; }
export function cancelRun(run) { return terminal.has(run.phase) ? run : { ...run, phase: 'CANCELLED', generation: (run.generation ?? 0) + 1, pendingAction: null, approval: null, result: { status: 'cancelled', evidence: ['cancelled by user'] } }; }
