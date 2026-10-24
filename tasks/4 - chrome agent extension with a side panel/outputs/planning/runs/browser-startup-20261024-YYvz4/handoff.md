# Implementer handoff — toolbar cannot open native Side Panel

**Work item:** `browser-startup-20261024-YYvz4`  
**Owner result:** investigation complete; no production files changed; ready for a separate implementer, with native-browser runtime evidence blocked by Puppeteer installation policy.

## Exact defect mechanism

Target file: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4\extension\worker.js`.

At lines 87–88, the worker registers an action click handler but awaits `chrome.sidePanel.setOptions(...)` before calling `chrome.sidePanel.open(...)`, then catches and discards every exception. The manifest at lines 2, 6, 8–10 already declares MV3, `sidePanel`, an action without a popup, `side_panel.default_path: "panel.html"`, and a module worker. Static checks show the listener exists, `setPanelBehavior` is absent, and the open failure is hidden.

Chrome’s official Side Panel reference says `sidePanel.open()` may only be called in response to a user action and documents `setPanelBehavior({ openPanelOnActionClick: true })` as the toolbar-click route; behavior defaults to false. Therefore the frozen implementation direction is to use the official toolbar behavior API during worker initialization/installation, or to call `open()` directly in the click callback without awaiting another API first. Keep the fix minimal and explain the chosen route. Do not open `panel.html` as a normal tab as a substitute.

## Baseline identity

- Worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4`
- Extension: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4\extension`
- Baseline HEAD: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`, detached copied package.
- Baseline file count: 23; prior tree fingerprint: `51DF73DC2F5FEFFC946472F9A208AF976E40E20FAB3B188187A52C8BFC166E65`.
- Key baseline hashes: `manifest.json` `17AD950A787490AB8BA67BD9AD078DCB984842BBC572F6846DC7E6CBEC091FD5`; `worker.js` `5EA0F7BD92C00E7E475F86491270C37CB43CF5A73339E0C34F83F2849FE0E48C`; `panel.html` `2F6DB36C7BAA157DC9C23D3EB0BDE567014C4DFE9A23FF765F05D3036474F1B2`; `panel.js` `C8BE0821C5FC771BD37B087BC1201CDF16A6859108441ECDAA5054CB8CC21BEF`.
- Runtime: Node `22.12.0`, npm `10.9.0`, Chrome `155.0.8059.84` at `C:\Program Files\Google\Chrome\Application\chrome.exe`.

## Implementer files and allowed scope

Planned product file: `extension/worker.js` only, unless the implementer’s minimal chosen official API path requires an explicitly justified manifest-only change. Do not touch provider/model, Shopee/general-origin, panel business, bridge, storage, or permission scope for this defect. Do not add debugger/CDP permission, wildcard hosts, popup, remote code, or a browser-profile workaround.

Required checks:

1. Load the candidate unpacked extension in a fresh synthetic profile.
2. Confirm the MV3 module service worker target starts and has no import/bootstrap exception.
3. Confirm the official Side Panel behavior or direct click handler is registered.
4. Perform a real toolbar action click using a supported native-toolbar driver. Baseline must be **RED**: no native extension panel opens; candidate must **PASS**: the native Side Panel opens and renders the packaged heading `Supervised Shopee helper`.
5. Preserve the existing manifest/default path and run repository-defined unit tests separately. Report provider/network/account actions as not run.

A source-level assertion that `panel.html` can be loaded as an extension tab is not a pass. A call to `sidePanel.open()` from an ordinary extension page without a user action is not a pass.

## Reusable QA script and actual tool paths

- Probe source: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\tools\puppeteer-startup\toolbar-startup-baseline.mjs`
- Intended dependency directory: `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\tools\puppeteer-startup`
- Intended synthetic profile location: any disposable child under `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\profiles\`.
- Intended invocation after dependency availability:

```powershell
node "C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\tools\puppeteer-startup\toolbar-startup-baseline.mjs" `
  "C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\toolbar-20261024-YYvz4\extension" `
  "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  "C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\profiles\toolbar-startup-baseline" `
  "C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\outputs\planning\runs\browser-startup-20261024-YYvz4\evidence-baseline.json"
```

The script records driver/package/browser versions, service-worker target, manifest, `sidePanel.getOptions()` and `getPanelBehavior()` state, worker/page errors, and a safe `GET_STATE` health message. It explicitly marks native toolbar clicking `NOT_RUN` because Puppeteer alone has no supported browser-toolbar click driver in this environment; it never claims an ordinary panel tab is native success.

## Browser-stage blocker and process release

The requested install command was run only under `.work\tools\puppeteer-startup`:

```text
npm install --prefix <task>\.work\tools\puppeteer-startup puppeteer@24.26.1 --no-fund --no-audit
```

It failed with exit code 1: npm could not connect to `https://registry.npmjs.org/puppeteer` and returned `EACCES` for `104.16.6.34:443`. Local npm cache and workspace/global resolution had neither `puppeteer` nor `puppeteer-core`. No Chrome-for-Testing binary was downloaded. No browser was launched, no real Chrome profile or CDP attachment was used, and no task-owned browser/test PID remains. The failed npm process exited; `processesExited=true` for this stage. Keep the `.work\tools` location for the successor rather than globally installing anything.

One attempted Node module-import diagnostic used a malformed `file://` path and failed as a command-construction error; it must not be interpreted as an extension import failure. `node --check worker.js` and `node --check panel.js` passed. The imported core modules were inspected directly and no top-level network/provider startup action or syntax issue was found.

## Official evidence

[1]: https://developer.chrome.com/docs/extensions/reference/api/sidePanel "Chrome Side Panel API reference"
[2]: https://developer.chrome.com/docs/extensions/reference/api/action "Chrome Action API reference"

Chrome [1] states that `sidePanel.open()` is user-action-only and documents `setPanelBehavior({openPanelOnActionClick:true})`; Chrome [2] states that `action.onClicked` fires for an action without a popup. These facts support the source-order root cause and the frozen fix contract, while the actual runtime rejection remains unobserved until a permitted native browser driver is available.
