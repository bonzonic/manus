import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const snapshot = {
  tabId: 9,
  documentNonce: 'doc',
  snapshotId: 'snap',
  url: 'https://docs.example/search',
  targets: [
    // Synthetic fixture metadata: these controls are intentionally rendered in-viewport and enabled.
    { targetId: 'search', role: 'textbox', label: 'Search documentation', inputType: 'search', fingerprint: 'search-fp', actionable: true, enabled: true, inViewport: true, publicControl: true },
    { targetId: 'next', role: 'button', label: 'Next article', fingerprint: 'next-fp', actionable: true, enabled: true, inViewport: true, publicControl: true },
    { targetId: 'delete', role: 'button', label: 'Delete article', fingerprint: 'delete-fp', actionable: true, enabled: true, inViewport: true, publicControl: true },
    { targetId: 'external', role: 'link', label: 'External guide', href: 'https://other.example/guide', fingerprint: 'external-fp', actionable: true, enabled: true, inViewport: true, publicControl: true },
  ],
};
const run = { runId: 'run', stepIndex: 0, tabId: 9, origin: 'https://docs.example', phase: 'RUNNING' };

test('generic public text and same-origin click are approved while destructive and cross-origin controls stay blocked', async () => {
  const { evaluateAction } = await import('../core/policy.js');
  assert.equal(evaluateAction({ type: 'fill', targetId: 'search', value: 'cancellation', expected: { valueIs: 'cancellation' } }, snapshot, run).decision, 'approve');
  assert.equal(evaluateAction({ type: 'click', targetId: 'next', expected: { textAppears: 'Next' } }, snapshot, run).decision, 'approve');
  assert.equal(evaluateAction({ type: 'click', targetId: 'delete', expected: { textAppears: 'deleted' } }, snapshot, run).decision, 'block');
  assert.equal(evaluateAction({ type: 'click', targetId: 'external', expected: { urlIs: 'https://other.example/guide' } }, snapshot, run).decision, 'block');
});

test('unsupported selector script coordinate and endpoint fields fail closed', async () => {
  const { validateAction } = await import('../core/contracts.js');
  for (const field of ['selector', 'css', 'xpath', 'script', 'code', 'coordinates', 'url', 'endpoint']) {
    assert.throws(() => validateAction({ type: 'click', targetId: 'next', expected: { textAppears: 'Next' }, [field]: 'unsafe' }), field);
  }
});

test('startup configures official panel behavior and reports rejected initialization', async () => {
  const { installPanelStartup } = await import('../core/startup.js');
  const calls = [];
  const errors = [];
  const chrome = { sidePanel: { setPanelBehavior: (options) => { calls.push(options); return Promise.resolve(); } }, runtime: {}, action: { onClicked: { addListener: (listener) => { chrome.clicked = listener; } } } };
  installPanelStartup(chrome, (error) => errors.push(error.message));
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls, [{ openPanelOnActionClick: true }]);
  assert.equal(errors.length, 0);

  const rejected = { sidePanel: { setPanelBehavior: () => Promise.reject(new Error('startup failed')) }, runtime: {}, action: { onClicked: { addListener: () => {} } } };
  installPanelStartup(rejected, (error) => errors.push(error.message));
  await new Promise((resolve) => setImmediate(resolve));
  assert.ok(errors.includes('startup failed'));
});

test('empty, targetless, and cross-origin observations fail closed before model planning', async () => {
  const { admitSnapshot } = await import('../core/admission.js');
  const origin = 'https://docs.example';
  assert.equal(admitSnapshot({ url: origin + '/empty', text: '', targets: [] }, origin).ok, false);
  assert.equal(admitSnapshot({ url: origin + '/article', text: 'Readable article', targets: [] }, origin).ok, false);
  assert.equal(admitSnapshot({ url: 'https://other.example/article', text: 'Readable article', targets: [{ targetId: 'x' }] }, origin).ok, false);
  assert.equal(admitSnapshot({ url: origin + '/search', text: 'Search docs', targets: [{ targetId: 'search' }] }, origin).ok, true);
});

test('file controls are marked native-dialog and blocked by bridge and policy for fill and click', async () => {
  const { evaluateAction } = await import('../core/policy.js');
  const fileTarget = { targetId: 'upload', role: 'textbox', tag: 'INPUT', inputType: 'file', label: 'Upload document', fingerprint: 'file-fp', actionable: true, enabled: true, inViewport: true, publicControl: true };
  for (const type of ['fill', 'click']) assert.equal(evaluateAction({ type, targetId: 'upload', value: 'secret.txt', expected: { valueIs: 'secret.txt' } }, { ...snapshot, targets: [fileTarget] }, run).decision, 'block');

  const source = await fs.readFile(new URL('../bridge.js', import.meta.url), 'utf8');
  let clicked = false;
  const fileEl = {
    tagName: 'INPUT', type: 'file', disabled: false, isConnected: true, innerText: '', textContent: '', name: 'upload', id: 'upload',
    click() { clicked = true; }, dispatchEvent() {}, closest() { return null; }, getBoundingClientRect() { return { top: 10, bottom: 30, left: 10, right: 100, width: 90, height: 20 }; },
    getAttribute(name) { return name === 'type' ? 'file' : name === 'aria-label' ? 'Upload document' : ''; },
  };
  const context = { document: { title: 'Upload', body: { innerText: 'Upload document' }, querySelector: () => null, querySelectorAll: (selector) => selector.startsWith('a[href],button') ? [fileEl] : [] }, location: { href: 'https://docs.example/upload' }, innerHeight: 800, innerWidth: 1200, performance: { timeOrigin: 1 }, Event: class Event {} };
  vm.runInNewContext(source, context);
  const observed = context.__BROWSER_TASK_AGENT_BRIDGE__.observe();
  assert.equal(observed.targets[0].nativeDialog, true);
  assert.equal(observed.targets[0].publicControl, false);
  assert.equal(context.__BROWSER_TASK_AGENT_BRIDGE__.execute({ type: 'click', targetId: 't1' }).status, 'blocked');
  assert.equal(clicked, false);
});

test('offscreen or disabled mutation targets block, while a scroll-revealed target can be approved', async () => {
  const { advanceRun, dispatchApproved } = await import('../core/engine.js');
  const action = { type: 'click', targetId: 'next', expected: { textAppears: 'Next' } };
  const hidden = { ...snapshot, targets: [{ ...snapshot.targets[1], inViewport: false }] };
  const disabled = { ...snapshot, targets: [{ ...snapshot.targets[1], enabled: false, actionable: false }] };
  assert.equal((await advanceRun(run, { type: 'act', action }, { snapshot: hidden })).phase, 'NEEDS_USER');
  assert.equal((await advanceRun(run, { type: 'act', action }, { snapshot: disabled })).phase, 'NEEDS_USER');
  assert.equal((await advanceRun(run, { type: 'act', action }, { snapshot })).phase, 'AWAITING_APPROVAL');

  const { approvalDigest } = await import('../core/policy.js');
  const approved = { ...run, snapshot, phase: 'AWAITING_APPROVAL', pendingAction: action, approval: { approved: true, digest: await approvalDigest(run, action, snapshot) } };
  const freshHidden = { ...snapshot, snapshotId: 'fresh-hidden', targets: [{ ...snapshot.targets[1], inViewport: false }] };
  const result = await dispatchApproved(approved, { observe: async () => freshHidden, execute: async () => { throw new Error('must not dispatch'); } });
  assert.equal(result.phase, 'NEEDS_USER');
  assert.match(result.result.evidence[0], /visible|actionable|snapshot|approval|target/i);
});

test('fill approval preview includes an exact bounded non-sensitive value and redacts marked sensitive values', async () => {
  const { previewAction } = await import('../core/preview.js');
  const value = 'x'.repeat(200);
  const preview = previewAction({ type: 'fill', targetId: 'search', value, expected: { valueIs: value } }, 'https://docs.example');
  assert.match(preview, /VALUE: x{160}…/);
  assert.doesNotMatch(preview, /x{161}/);
  assert.doesNotMatch(previewAction({ type: 'fill', targetId: 'email', value: 'user@example.com', sensitive: true }, 'https://docs.example'), /user@example\.com/);
});
