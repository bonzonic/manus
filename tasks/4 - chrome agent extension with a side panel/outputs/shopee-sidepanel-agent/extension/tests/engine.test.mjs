import test from 'node:test';
import assert from 'node:assert/strict';
async function moduleOrNull(path) { try { return await import(path); } catch { return null; } }
function requireModule(mod, name) { assert.ok(mod, `${name} implementation is not present yet`); return mod; }
const baseSnapshot = { documentNonce: 'doc', snapshotId: 's1', url: 'https://shopee.com.my/search', text: '', targets: [{ targetId: 'scroll-target', fingerprint: 'scroll-fp', actionable: true }] };
const baseRun = { schemaVersion: 1, runId: 'r1', tabId: 1, origin: 'https://shopee.com.my', phase: 'RUNNING', stepIndex: 0, generation: 1, activeElapsedMs: 0, snapshot: baseSnapshot, log: [] };

test('pauseStopsNextDispatch', async () => {
  const mod = requireModule(await moduleOrNull('../core/engine.js'), 'engine');
  const paused = await mod.advanceRun({ ...baseRun, phase: 'PAUSED' }, { type: 'act', action: { type: 'observe' } }, { observe: async () => ({ text: '' }), execute: async () => { throw new Error('must not run'); } });
  assert.equal(paused.phase, 'PAUSED');
});

test('cancelledRunIgnoresLateProposal', async () => {
  const mod = requireModule(await moduleOrNull('../core/engine.js'), 'engine');
  const cancelled = await mod.advanceRun({ ...baseRun, phase: 'CANCELLED' }, { type: 'act', action: { type: 'observe' } }, {});
  assert.equal(cancelled.phase, 'CANCELLED');
});

test('duplicateAdvanceDoesNotDispatchTwice', async () => {
  const mod = requireModule(await moduleOrNull('../core/engine.js'), 'engine');
  let calls = 0;
  const action = { type: 'scroll', direction: 'down', pixels: 100, expected: { scrollChanged: 'yes' } };
  const { approvalDigest } = await import('../core/policy.js');
  const digest = await approvalDigest(baseRun, action, baseSnapshot);
  const next = await mod.dispatchApproved({ ...baseRun, pendingAction: action, approval: { approved: true, digest }, dispatchState: 'READY' }, { execute: async () => { calls++; return { status: 'verified', evidence: ['viewport changed'] }; }, observe: async () => baseSnapshot });
  assert.equal(calls, 1);
  assert.equal(next.result.status, 'verified');
});

test('cartNoopIsUnknownNotSucceeded', async () => {
  const mod = requireModule(await moduleOrNull('../core/engine.js'), 'engine');
  const next = await mod.dispatchApproved({ ...baseRun, pendingAction: { type: 'click', cartIntent: { itemId: '1', variantId: 'v', quantity: 1 }, expected: { textAppears: 'Added' } }, approval: { approved: true }, dispatchState: 'READY' }, { execute: async () => ({ status: 'unknown', evidence: ['action sent; outcome unverified'] }), observe: async () => ({ text: 'same' }) });
  assert.equal(next.result.status, 'blocked');
  assert.notEqual(next.phase, 'SUCCEEDED');
});
