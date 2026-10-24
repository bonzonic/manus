# Amended implementer handoff — startup defect and neutral identity reconciliation

**Work item:** `browser-startup-20261024-YYvz4`  
**Owner result:** **Blocked for runtime/native verification; ready for a distinct implementer.** No production files were changed.  
**Prepared extension:** `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4\extension`

## Root cause retained

The first incorrect startup/opening decision remains in `extension/worker.js` at the action-click handler (the inherited record identifies lines 87–88). The handler awaits `chrome.sidePanel.setOptions({tabId, path: 'panel.html', enabled: true})` and only then awaits `chrome.sidePanel.open({windowId})`; its catch suppresses the failure. Chrome's Side Panel contract makes the later `open()` user-action-sensitive, so the preceding await can lose the toolbar gesture context. The manifest already has MV3, `sidePanel`, an action without a popup, `side_panel.default_path: "panel.html"`, and a module service worker.

The implementer must choose the smallest official path: configure `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})` during initialization/installation, or call `open()` directly within the action user-gesture callback without an awaited API first. Preserve the global `default_path` behavior and make any failure observable; do not retain a swallowed rejection or open `panel.html` as a normal tab.

## Frozen behavioral contract

1. From a fresh synthetic Load unpacked install, a real toolbar action must open the **actual native Chrome Side Panel** showing the packaged panel UI. A normal `chrome-extension://.../panel.html` tab is not evidence.
2. The MV3 module service worker must bootstrap without import/registration error, and the action/official Side Panel behavior must be registered.
3. The candidate must preserve the existing manifest/default path, panel flow, permissions, provider/model code, storage/privacy rules, Shopee adapter boundary, and startup reset/session behavior.
4. Only the prepared worktree may receive the product change; planned scope is `extension/worker.js` unless an explicitly justified minimal manifest-only change is required.

## Literal heading amendment only

The old startup-plan candidate check named the first visible heading **`Supervised Shopee helper`**. The generic owner/user-steering contract supersedes only that literal common-flow heading expectation with **`Browser Task Agent`**. This is a product-identity wording amendment, not a behavioral relaxation:

- The native criterion remains “toolbar action opens the native Side Panel,” not “a heading exists in a panel tab.”
- The panel heading must be checked in the actual native Side Panel after the toolbar action.
- The generic contract's neutral identity and optional Shopee adapter separation remain in force.
- The retained root cause, official API direction, manifest regression guards, and no-panel-tab-substitute rule are unchanged.

Do not reinterpret this amendment as permission to weaken the native check or to claim native success from fixture, source scan, or ordinary-tab loading.

## Runtime evidence and capability gap

The QA script and canonical report are:

- Script: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\tools\puppeteer-startup\native-cft-startup-baseline.mjs`
- Baseline report: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\outputs\planning\runs\browser-startup-20261024-YYvz4\native-baseline.md`
- Evidence: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\outputs\planning\runs\browser-startup-20261024-YYvz4\native-baseline-evidence.json`

Puppeteer `24.26.1` resolves to bundled CFT `141.0.7390.122`. Inspection found no documented `extension.action`, `triggerAction`, or native toolbar-click capability. The isolated CFT attempts failed before exposing a service-worker target because of device/runtime browser-connection and profile-lock behavior. Native toolbar, worker bootstrap, Side Panel API state, and the native heading are therefore **NOT RUN**, not PASS and not RED.

## Exact successor QA invocation

```powershell
$env:PUPPETEER_CACHE_DIR = (Resolve-Path '.work\tools\puppeteer-cache').Path
node '.work\tools\puppeteer-startup\native-cft-startup-baseline.mjs' `
  '.work\worktrees\toolbar-20261024-YYvz4\extension' `
  '.work\profiles\toolbar-startup-cft-20261024-YYvz4-headless' `
  '.work\qa-evidence\native-baseline-evidence-headless.json'
```

A verifier with an approved native-toolbar-capable driver must rerun both baseline and candidate on the same fresh synthetic profile conditions and record actual native Side Panel evidence. Until then, the implementer may proceed with the separate product contract but must not claim this owner supplied native runtime proof.

## Safety and release state

No real Chrome profile, Manus browser, account, credential, provider key, network account/cart, checkout, CAPTCHA, payment action, production restart, commit, merge, publish, or product-code edit occurred. No task-owned browser process remains. The next action is separate implementation followed by independent verification; this handoff is not a shipment approval.
