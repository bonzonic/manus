import test from 'node:test';
import assert from 'node:assert/strict';

// Synthetic adapter fixture metadata: this control is intentionally rendered in-viewport and enabled.
const target = { targetId: 'cart', role: 'button', label: 'Add to cart', fingerprint: 'BUTTON||Add to cart|', actionable: true, enabled: true, inViewport: true, publicShoppingControl: true };
const card = { itemId: 'item-1', label: 'Rendered backpack', href: 'https://shopee.com.my/product/1', priceText: 'RM 10', currencyText: 'MYR', fingerprint: 'https://shopee.com.my/product/1|Rendered backpack|RM 10', variants: [{ id: 'black-m', label: 'Black / M', renderedEvidence: 'selected' }] };
const snapshot = { documentNonce: 'doc', snapshotId: 's1', url: 'https://shopee.com.my/product/1', title: 'Product', text: 'Rendered backpack Black / M', targets: [target], productCards: [card], selectedOptions: [{ id: 'black-m', label: 'Black / M' }], quantityEvidence: { value: 2 }, cartEvidence: { fingerprint: 'cart-before', messages: [] }, contentFingerprint: 'before' };
const run = { runId: 'run', stepIndex: 0, tabId: 1, origin: 'https://shopee.com.my', regionId: 'my', phase: 'RUNNING', snapshot, log: [] };
const intent = { regionId: 'my', itemId: 'item-1', itemLabel: 'Rendered backpack', href: card.href, variantId: 'black-m', variantLabel: 'Black / M', quantity: 2, expected: 'Added to cart', fingerprint: card.fingerprint, controlFingerprint: target.fingerprint };

async function policy() { return import('../core/policy.js'); }
async function engine() { return import('../core/engine.js'); }
async function approved(run, action) {
  const { approvalDigest } = await policy();
  return { ...run, pendingAction: action, approval: { approved: true, digest: await approvalDigest(run, action, run.snapshot) }, dispatchState: 'READY' };
}

test('cart-add-control-requires-rendered-exact-intent', async () => {
  const { evaluateAction } = await policy();
  assert.equal(evaluateAction({ type: 'click', targetId: 'cart', expected: { textAppears: 'Added to cart' } }, snapshot, run).decision, 'block');
  assert.equal(evaluateAction({ type: 'click', targetId: 'cart', cartIntent: intent, expected: { textAppears: 'Added to cart' } }, snapshot, run).decision, 'approve');
  assert.equal(evaluateAction({ type: 'click', targetId: 'cart', cartIntent: { ...intent, itemLabel: 'Model invented' }, expected: { textAppears: 'Added to cart' } }, snapshot, run).decision, 'block');
});

test('fresh-approval-recheck-stops-on-origin-or-target-change', async () => {
  const { dispatchApproved } = await engine();
  let executed = false;
  const changed = { ...snapshot, url: 'https://evil.example/checkout', snapshotId: 's2' };
  const action = { type: 'click', targetId: 'cart', cartIntent: intent, expected: { textAppears: 'Added to cart' } };
  const out = await dispatchApproved(await approved(run, action), { observe: async () => changed, execute: async () => { executed = true; return { status: 'unknown' }; } });
  assert.equal(executed, false);
  assert.equal(out.phase, 'NEEDS_USER');
});

test('same-target-replaced-document-and-snapshot-invalidates-approval', async () => {
  const { dispatchApproved } = await engine();
  let executed = false;
  const action = { type: 'click', targetId: 'cart', cartIntent: intent, expected: { textAppears: 'Added to cart' } };
  const replaced = { ...snapshot, documentNonce: 'replacement-document', snapshotId: 'replacement-snapshot' };
  const out = await dispatchApproved(await approved(run, action), { observe: async () => replaced, execute: async () => { executed = true; return { status: 'unknown' }; } });
  assert.equal(executed, false);
  assert.equal(out.phase, 'NEEDS_USER');
  assert.match(out.result.evidence[0], /document|snapshot/i);
});

test('unchanged-page-approval-remains-executable', async () => {
  const { dispatchApproved } = await engine();
  let executed = false;
  const action = { type: 'scroll', direction: 'down', pixels: 100, expected: { scrollChanged: 'yes' } };
  const out = await dispatchApproved(await approved(run, action), { observe: async () => snapshot, execute: async () => { executed = true; return { status: 'verified', evidence: ['viewport changed'] }; } });
  assert.equal(executed, true);
  assert.equal(out.result.status, 'verified');
});

test('post-action-success-requires-fresh-observed-delta', async () => {
  const { dispatchApproved } = await engine();
  const after = { ...snapshot, snapshotId: 's2', text: `${snapshot.text} Added to cart`, cartEvidence: { fingerprint: 'cart-after', messages: ['Added to cart'] }, contentFingerprint: 'after' };
  const action = { type: 'click', targetId: 'cart', cartIntent: intent, expected: { textAppears: 'Added to cart' } };
  const out = await dispatchApproved(await approved(run, action), { observe: async () => snapshot, execute: async () => ({ status: 'unknown', evidence: ['action sent'] }), observeAfter: async () => after });
  assert.equal(out.result.status, 'verified');
});

test('generic-proceed-and-address-controls-are-blocked', async () => {
  const { evaluateAction } = await policy();
  for (const label of ['Proceed', 'Continue', 'Confirm', 'Address', 'Phone number', 'One-time code']) {
    const decision = evaluateAction({ type: 'click', targetId: 'x', expected: { textAppears: 'x' } }, { ...snapshot, targets: [{ targetId: 'x', role: 'button', label, fingerprint: label, actionable: true, sensitiveContext: label !== 'Proceed' ? true : false }] }, run);
    assert.equal(decision.decision, 'block', label);
  }
});

test('finish-evidence-cannot-invent-reference', async () => {
  const { validateFinishEvidence } = await engine();
  assert.equal(validateFinishEvidence({ evidenceRefs: ['not-observed'] }, { snapshotId: 'fresh', results: [] }).valid, false);
  assert.equal(validateFinishEvidence({ evidenceRefs: ['fresh'] }, { snapshotId: 'fresh', results: [] }).valid, true);
});
