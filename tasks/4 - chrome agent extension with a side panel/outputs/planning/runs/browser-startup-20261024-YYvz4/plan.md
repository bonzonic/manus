# Toolbar → native Side Panel startup defect plan

**Work item:** `browser-startup-20261024-YYvz4`  
**Status:** ready for separate implementation; owner made no production edit  
**Defect:** after Load unpacked, clicking the extension toolbar action does not open the native Chrome Side Panel.  
**Scope:** native MV3 service-worker startup, action-event registration, and actual native Side Panel opening only. General web-task naming/origin work belongs to the parallel feature owner and is intentionally not duplicated here.

## Immutable baseline and provenance

- Worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4`
- Extension source: `...\.work\worktrees\toolbar-20261024-YYvz4\extension`
- Baseline HEAD: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (detached; copied delivered package, not committed).
- Baseline record: `...\.work\worktrees\toolbar-20261024-YYvz4\toolbar-baseline.json`; 23 copied files; prior tree fingerprint `51DF73DC2F5FEFFC946472F9A208AF976E40E20FAB3B188187A52C8BFC166E65`.
- Relevant baseline hashes from the record: `manifest.json` `17AD950A787490AB8BA67BD9AD078DCB984842BBC572F6846DC7E6CBEC091FD5`; `worker.js` `5EA0F7BD92C00E7E475F86491270C37CB43CF5A73339E0C34F83F2849FE0E48C`; `panel.html` `2F6DB36C7BAA157DC9C23D3EB0BDE567014C4DFE9A23FF765F05D3036474F1B2`; `panel.js` `C8BE0821C5FC771BD37B087BC1201CDF16A6859108441ECDAA5054CB8CC21BEF`.
- Runtime: Node `v22.12.0`, npm `10.9.0`, branded Chrome `155.0.8059.84` at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- Production tree was not edited. The worktree’s existing untracked copied `extension/` and `toolbar-baseline.json` are inherited baseline artifacts, not changes made by this investigation.

## Root-cause finding

The first incorrect startup/opening decision is in `extension/worker.js:88`. The click listener is registered, but it performs two awaited extension API calls in sequence:

```js
chrome?.action?.onClicked?.addListener(async (tab) => {
  try {
    await chrome.sidePanel.setOptions({ tabId: tab.id, path: 'panel.html', enabled: true });
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch { /* user can open the panel manually */ }
});
```

The manifest already contains the required MV3/action/Side Panel configuration (`manifest.json:2,6,8-10`): `"sidePanel"` permission, an action with no popup, `side_panel.default_path: "panel.html"`, and a module service worker. The static source scan found the action listener (`true`), no `setPanelBehavior` call (`false`), an awaited `setOptions` before an awaited `open` (`true`), and a catch that suppresses the error (`true`). `node --check worker.js` and `node --check panel.js` passed.

Chrome’s official Side Panel API documentation states that `sidePanel.open()` “may only be called in response to a user action”; it also documents the supported toolbar path as `sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`, whose behavior defaults to false. The documentation’s toolbar example uses the behavior API, while the programmatic `open()` path requires a user gesture. The most direct causal explanation is that the first awaited `setOptions()` call causes the later `open()` call to lose the toolbar user-action context; Chrome rejects `open()`, and the empty catch makes the failure appear as a dead toolbar. `setOptions()` is unnecessary for the already-global manifest `default_path` path. This mechanism is supported by the source ordering and official API contract; a live rejection string was not captured because the authorized Puppeteer installation was blocked before a browser could be launched (see limitations).

The service-worker import graph was read end-to-end for `worker.js`: `shopee.js`, `model-catalog.js`, `model.js`, `store.js`, `logger.js`, and `engine.js` all use valid ES-module syntax and have no top-level network/provider action. No import/bootstrap parse failure was found in static inspection. The action has no manifest popup, so the official `action.onClicked` suppression rule for popup actions does not apply.

## Frozen fix contract for the separate implementer

Only the prepared worktree may be changed by the implementer. This owner does not author the product diff.

1. **Native toolbar open:** From a cold Load unpacked install, clicking the extension action must open the actual Chrome native Side Panel showing the packaged `panel.html` UI. Opening `chrome-extension://.../panel.html` as an ordinary tab is not evidence.
2. **Supported API path:** Use the official toolbar path: configure `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` during extension initialization/installation, or otherwise call `sidePanel.open()` directly within the action user-gesture callback without an awaited API call before it. Do not depend on a swallowed rejection or a panel-tab workaround. The implementer must choose one minimal path and document why it preserves the global `default_path` behavior.
3. **Worker health:** The MV3 module worker must start without an import/registration exception; `chrome.action.onClicked`/the chosen official Side Panel behavior must be registered from the worker. Errors must be observable in worker diagnostics, not silently discarded.
4. **No scope expansion:** Do not change the manifest permissions/host permissions, OpenRouter/provider code, Shopee/general-origin policy, panel business flow, storage policy, or injected bridge for this defect. Do not add debugger/CDP permissions, broad hosts, remote code, or a popup.
5. **Regression guards:** Preserve `manifest.json` MV3, `sidePanel` permission, `side_panel.default_path: panel.html`, action declaration, module worker, and existing panel UI. Preserve startup reset/session behavior.

## RED proof and verification contract

The baseline change-defining check is a native browser check, not a source-only assertion:

- Launch Chrome `155.0.8059.84` with a fresh synthetic profile and only the unpacked extension loaded.
- Confirm an extension service-worker target exists and record its URL, manifest, and worker error/console events.
- Exercise the real toolbar action. The baseline must produce **RED**: the click does not result in an opened native extension Side Panel, and the worker diagnostics should show the rejected `open()` call if the driver exposes native UI/API errors. Do not count a `panel.html` tab as a pass.
- Candidate must produce **PASS**: the same fresh profile/Chrome/viewport and extension package show the actual native Side Panel open after the toolbar action, with visible first heading `Supervised Shopee helper` and no worker bootstrap error. Capture the native panel state/screenshot or an equivalent supported browser evidence artifact.
- Run the existing repository-defined tests separately if available; no provider request, real key, Shopee account/cart, CAPTCHA, checkout, or payment action is permitted.

The reusable probe is [`.work/tools/puppeteer-startup/toolbar-startup-baseline.mjs`](../../../.work/tools/puppeteer-startup/toolbar-startup-baseline.mjs). It launches a disposable profile, records Puppeteer/Chrome versions, observes the service-worker target, reads manifest and Side Panel options/behavior from the worker, and sends only `GET_STATE` from a temporary extension page for bootstrap health. It explicitly records native toolbar clicking as `NOT_RUN` because Puppeteer has no supported browser-toolbar click driver in this probe; implementer/verifier must use an approved native-toolbar-capable route or report that capability gap. The script never attaches to a real Chrome profile and never performs provider/account/cart actions.

## Limitations and rejected alternatives

- Puppeteer `24.26.1` installation was attempted only under `...\.work\tools\puppeteer-startup`, but npm failed with `EACCES` connecting to `https://registry.npmjs.org/puppeteer`; no dependency or Chrome-for-Testing binary was installed. Local npm cache and workspace/global resolution contained neither `puppeteer` nor `puppeteer-core`.
- No Chrome process was launched by this owner, so there are no task-owned browser PIDs to stop. The failed npm process exited with code 1. No real Chrome profile, CDP attachment, Manus browser control, credentials, or provider credit was used.
- The static module-import subcheck was attempted with a malformed `file://` path construction and failed as a diagnostic-command error; it is not evidence of a product import failure. The independent `node --check` syntax checks passed, and the imported modules were inspected directly. Re-run module imports with a correctly constructed absolute file URL during implementation/verifier setup.
- The official sources checked were Chrome’s Side Panel API reference and Action API reference: [1] and [2].

## References

[1]: https://developer.chrome.com/docs/extensions/reference/api/sidePanel "Chrome Side Panel API reference"
[2]: https://developer.chrome.com/docs/extensions/reference/api/action "Chrome Action API reference"
