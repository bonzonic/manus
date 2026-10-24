# Native CFT startup baseline — 2026-10-24

**Work item:** `browser-startup-20261024-YYvz4`  
**Verdict:** **BLOCKED / NOT RUN** for native toolbar and native Side Panel behavior. This run is not a PASS and does not provide a RED behavioral result.  
**Owner scope:** startup/service-worker/native Side Panel only; no production files changed.

## Exact QA invocation

The saved QA script is:

`C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\tools\puppeteer-startup\native-cft-startup-baseline.mjs`

The final invocation was:

```powershell
$env:PUPPETEER_CACHE_DIR = (Resolve-Path '.work\tools\puppeteer-cache').Path
node '.work\tools\puppeteer-startup\native-cft-startup-baseline.mjs' `
  '.work\worktrees\toolbar-20261024-YYvz4\extension' `
  '.work\profiles\toolbar-startup-cft-20261024-YYvz4-headless' `
  '.work\qa-evidence\native-baseline-evidence-headless.json'
```

The canonical evidence copy is [`native-baseline-evidence.json`](./native-baseline-evidence.json). The raw tool output was retained at `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\qa-evidence\native-baseline-evidence-headless.json`.

## Runtime identity

- Puppeteer: `24.26.1`, loaded only after `PUPPETEER_CACHE_DIR` was set.
- Bundled Chrome for Testing: `141.0.7390.122`.
- Executable: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\tools\puppeteer-cache\chrome\win64-141.0.7390.122\chrome-win64\chrome.exe`.
- Version source: `...\.work\tools\puppeteer-cache\chrome\win64-141.0.7390.122\141.0.7390.122.manifest`.
- Extension under test: untouched `...\.work\worktrees\toolbar-20261024-YYvz4\extension`.
- Profile: disposable synthetic profile under `...\.work\profiles\toolbar-startup-cft-20261024-YYvz4-headless`.
- Launch flags were QA-only: `--no-sandbox`, `--disable-gpu`, `--disable-crash-reporter`, and `--disable-breakpad`.

## API capability inspection

The installed Puppeteer package was inspected before browser use. Its public exports/types expose extension loading/unloading and an experimental `ExtensionTransport`, but no documented `extension.action`, `triggerAction`, or native browser-toolbar click capability. Export and constructor-prototype scans returned no action/toolbar driver. No unsupported CDP method was guessed or invoked.

Therefore `nativeToolbarClick = NOT_RUN`. New-headless mode can establish extension targets if the browser connection succeeds, but it cannot prove native toolbar rendering. An ordinary `chrome-extension://.../panel.html` tab would not count as native evidence and was not used as a substitute.

## Observed result

CFT emitted a DevTools listening endpoint, but Puppeteer failed to obtain the browser connection and surfaced its Windows profile-lock guard before exposing any extension service-worker target. The evidence consequently has no target URL, manifest, `sidePanel.getOptions()` state, `getPanelBehavior()` state, worker diagnostics, or panel observation. Earlier headful attempts also recorded sandbox executable access denied and GPU-process failures; the final run used new-headless mode only to remove those UI/device dependencies, not to claim native success.

This is a **driver/device capability blocker**. It does not prove that the extension worker bootstraps or that the baseline toolbar behavior is RED. The native behavior must remain unrun until a permitted native-toolbar-capable route is available.

## Required checks and status

| Check | Status | Evidence rule |
|---|---|---|
| Fresh synthetic CFT cold start | **BLOCKED** | CFT launch began, but browser connection failed before target exposure. |
| MV3 service-worker target/bootstrap | **NOT RUN** | No service-worker target was available to inspect. |
| Manifest and Side Panel API state | **NOT RUN** | No worker evaluation occurred. |
| Native toolbar action | **NOT RUN** | No documented Puppeteer action driver exists. |
| Native Chrome Side Panel visible | **NOT RUN** | No native UI route and no panel-tab substitute. |
| Generic Browser Task Agent fixture behavior | **NOT RUN** | Owned by the generic feature contract/implementer. |
| Provider/account/cart/checkout/payment activity | **NOT RUN** | Prohibited by the task boundary. |

Post-run process inspection found no CFT process carrying the synthetic profile and no task-owned browser process remaining. `processesExited=true` for this stage.

## Preserved root cause and next action

The prior static root cause remains unchanged: `extension/worker.js` registers `chrome.action.onClicked` but awaits `chrome.sidePanel.setOptions(...)` before `chrome.sidePanel.open(...)`, then suppresses the exception. The frozen implementation direction remains the official `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})` route or a direct user-gesture `open()` with no awaited extension API before it. The implementer must make the minimal product change in the prepared worktree and obtain independent native verification later; this owner did not author that diff.
