import test from 'node:test';
import assert from 'node:assert/strict';
async function moduleOrNull(path) { try { return await import(path); } catch { return null; } }
function requireModule(mod, name) { assert.ok(mod, `${name} implementation is not present yet`); return mod; }
// Synthetic adapter fixture metadata: mutation controls are intentionally rendered in-viewport and enabled.
const snapshot = { tabId: 4, documentNonce: 'doc-a', snapshotId: 'snap-a', url: 'https://shopee.sg/search', targets: [{ targetId: 'cart', role: 'button', label: 'Add to cart', fingerprint: 'fp-1', actionable: true, enabled: true, inViewport: true }, { targetId: 'search', role: 'textbox', label: 'Search', inputType: 'search', fingerprint: 'fp-search', actionable: true, enabled: true, inViewport: true }] };
const run = { runId: 'run-1', stepIndex: 2, tabId: 4, origin: 'https://shopee.sg', phase: 'RUNNING', regionId: 'sg' };

test('manifestHasOnlyScopedPermissions', async () => {
  const fs = await import('node:fs/promises');
  const manifest = JSON.parse(await fs.readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(new Set(manifest.permissions), new Set(['sidePanel', 'activeTab', 'scripting', 'storage']));
  assert.deepEqual(manifest.host_permissions, ['https://openrouter.ai/*']);
  assert.equal(manifest.permissions.includes('tabs'), false);
  assert.equal(manifest.permissions.includes('debugger'), false);
});

test('clickAndFillRequireExactApproval', async () => {
  const mod = requireModule(await moduleOrNull('../core/policy.js'), 'policy');
  assert.equal(mod.evaluateAction({ type: 'click', targetId: 'cart', expected: { textAppears: 'Added' } }, snapshot, run).decision, 'block');
  assert.equal(mod.evaluateAction({ type: 'fill', targetId: 'search', value: 'backpack', expected: { valueIs: 'backpack' } }, snapshot, run).decision, 'approve');
});

test('changedFingerprintInvalidatesApproval', async () => {
  const mod = requireModule(await moduleOrNull('../core/policy.js'), 'policy');
  const first = await mod.approvalDigest(run, { type: 'click', targetId: 'cart', expected: { textAppears: 'Added' } }, snapshot);
  const changed = await mod.approvalDigest(run, { type: 'click', targetId: 'cart', expected: { textAppears: 'Added' } }, { ...snapshot, targets: [{ ...snapshot.targets[0], fingerprint: 'changed' }] });
  assert.notEqual(first, changed);
});

test('blockedActionCannotBeApproved', async () => {
  const mod = requireModule(await moduleOrNull('../core/policy.js'), 'policy');
  const decision = mod.evaluateAction({ type: 'click', targetId: 'pay', expected: { textAppears: 'Paid' } }, { ...snapshot, targets: [{ targetId: 'pay', role: 'button', label: 'Pay now', fingerprint: 'pay', actionable: true }] }, run);
  assert.equal(decision.decision, 'block');
});

test('untrustedProposalCannotExpandCapabilities', async () => {
  const mod = requireModule(await moduleOrNull('../core/contracts.js'), 'contracts');
  assert.throws(() => mod.validateProposal({ type: 'act', action: { type: 'executeScript', code: 'alert(1)' } }));
  assert.throws(() => mod.validateProposal({ type: 'act', action: { type: 'click', targetId: 'x', expected: { arbitrary: 'code' } } }));
});

test('oversizedProposalIsRejected', async () => {
  const mod = requireModule(await moduleOrNull('../core/contracts.js'), 'contracts');
  assert.throws(() => mod.validateProposal({ type: 'plan', steps: ['x'.repeat(17000)] }));
});

test('checkoutPaymentLoginCaptchaAreBlocked', async () => {
  const mod = requireModule(await moduleOrNull('../core/policy.js'), 'policy');
  for (const label of ['Checkout', 'Buy now', 'Payment', 'Login', 'CAPTCHA', 'Submit order']) {
    const decision = mod.evaluateAction({ type: 'click', targetId: 'x', expected: { textAppears: 'x' } }, { ...snapshot, targets: [{ targetId: 'x', role: 'button', label, fingerprint: label, actionable: true }] }, run);
    assert.equal(decision.decision, 'block', label);
  }
});
