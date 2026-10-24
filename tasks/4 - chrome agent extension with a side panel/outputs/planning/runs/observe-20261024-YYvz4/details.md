# Observe selected tab — defect details

- **Task:** 4 — Chrome agent extension with a Side Panel
- **Work item:** `observe-20261024-YYvz4`
- **Owner mode:** READONLYLIGHT; source inspection only
- **Delivered baseline:** `outputs/browser-task-agent/extension`, manifest version 0.2.0
- **Investigation timestamp:** 2026-10-24
- **Status:** Root cause is **not proven in a live Chrome runtime**. The records below separate source-proven failure cases from runtime-dependent hypotheses.
- **User report:** “Observe selected tab doesn’t even work.”

## Scope and evidence limits

I inspected the delivered `worker.js`, `panel.js`, `panel.html`, `bridge.js`, `core/admission.js`, `core/store.js`, `core/engine.js`, `core/policy.js`, `core/contracts.js`, `core/model.js`, `core/model-catalog.js`, `core/startup.js`, `core/logger.js`, and `manifest.json`. I also inspected the candidate five-model `worker.js`; its observe path is materially unchanged. No extension was loaded, no browser interaction was performed, no CLI test was run, no new dependency was used, and no delivery/candidate file was edited. No baseline SHA or browser error log was available in the inspected workspace.

The canonical task architecture/plan explicitly require scoped user-opened access, visible typed failures, and a distinction between opening the Side Panel and gaining page-read capability. Those requirements are relevant to the findings below.

## Actual source trace

1. `panel.html:14` exposes **Observe selected tab** without a model/key prerequisite.
2. `panel.js:16` sends `{ type: 'START', intent }` from the Side Panel extension page. A Side Panel message is an extension-page message; the code does not attach a tab ID from the panel click.
3. `worker.js:53-59` handles `START`. It chooses `sender.tab` if present, otherwise calls `activeTab()` (`worker.js:36`) using `chrome.tabs.query({ active: true, currentWindow: true })`. It validates ordinary `http:`/`https:` and then calls `bridgeCall`.
4. `worker.js:30-34` performs two `chrome.scripting.executeScript` calls against that tab: first it injects `bridge.js`, then it invokes the bridge's `observe` function. Any injection/API error rejects `START`; there is no fallback read path.
5. `bridge.js:25-45` returns page URL/title/body text and a bounded target list. A readable article can legitimately produce non-empty `text` with `targets: []`.
6. `worker.js:59-62` passes the snapshot to `admitSnapshot`. `core/admission.js:8-10` requires non-empty text **and** at least one enumerated target. Therefore a readable targetless page is rejected before a run is created.
7. `worker.js:96` serializes errors into `{ error, ...responseState() }`. `panel.js:3` throws on `reply.error`, and `panel.js:16` catches the error and writes only the status text. The failure is not added to the timeline by `worker.js`; the user receives no structured injection-stage diagnostic in the timeline.
8. Model setup is not on the `START` path. `worker.js:66` gates `ADVANCE` on catalog/model/key, and `model.js:29-32` validates the key/model only when proposing an AI action. Thus a missing OpenRouter key should not prevent the initial read-only observe operation in this source baseline.

## Source-proven failure cases

### Failure case A — readable article with no supported target

**Precondition:** The selected ordinary HTTP(S) page has a readable non-empty body but no `a[href]`, `button`, `input`, `textarea`, or listed ARIA controls after bridge enumeration.

**Expected:** Read-only observation succeeds and returns page text; targets are optional for an article/read operation.

**Actual by source contract:** `bridge.js:43-45` can return `text` plus `targets: []`; `core/admission.js:9` throws the exact reason `The selected page has no supported rendered targets; open a page with a visible public control and invoke again`. This is a deterministic baseline contract mismatch with the stated read-article requirement, independent of OpenRouter setup.

### Failure case B — page injection/activeTab capability is unavailable

**Precondition:** The worker reaches `bridgeCall` for an ordinary HTTP(S) page but the current tab has no applicable temporary host capability at the time of the Side Panel's Start message, or Chrome rejects the `scripting.executeScript` call.

**Expected:** The UI identifies page-read capability denial separately from an empty page and tells the user to invoke from the intended tab through the permitted user gesture.

**Actual by source:** `worker.js:31-34` rejects the call. The `START` catch path returns the raw browser/API error string through `worker.js:96`; `panel.js:16` places it in `#status`, but no worker timeline entry records that the failure occurred before observation. This mechanism is conditional until a real Chrome error is captured.

### Failure case C — extension-page sender has no `sender.tab` and the Side Panel can persist across tabs

**Source fact:** The Start message originates at `panel.js:16`, so the worker cannot rely on a content-script sender tab. `worker.js:55` falls back to a fresh active-tab query. The code does not retain the tab/window that opened the Side Panel.

**Risk/mechanism:** If the Side Panel remains open while the user changes tabs, `START` observes whichever tab is active when the panel button is clicked, not a tab identity captured when the panel was opened. If that tab did not receive the applicable user-invocation capability, the next failure is the injection denial in case B. This is a source-level selection/capability risk, not a proven report-specific cause without runtime tab IDs and Chrome errors.

### Failure case D — unsupported/non-web tab

**Source fact and intended guard:** `worker.js:56-57` rejects missing/invalid/non-HTTP(S) URLs before injection with `Invoke on a valid ordinary HTTP(S) tab` or `Browser Task Agent supports ordinary HTTP(S) tabs only...`. This is expected fail-closed behavior, not evidence that observe is broken on ordinary pages.

## AI/setup distinction

- `START` does not require `config.catalog`, `config.modelId`, or `config.apiKey` (`worker.js:53-62`).
- `LOAD_CATALOG` and default model selection occur only in the `LOAD_CATALOG` branch (`worker.js:48-51`).
- `ADVANCE` requires all three setup values (`worker.js:66`), then `model.js` makes the OpenRouter call.
- `store.js:12-13` persists the session key/model settings, but this does not participate in initial DOM observation.
- The five-model candidate adds shortlist/catalog handling after observation; its `START` lines 54-63 retain the same tab selection, bridge, and admission sequence. It is not a demonstrated observe fix or regression.

## Privacy/permission boundaries preserved

The inspected source uses `activeTab` and `scripting` only; `manifest.json:6` does not request `all_urls` or `debugger`. No recommendation in this record expands host access, bypasses denied pages, reads profile data, or packages the user key. Any future capability test must remain a user-invoked, current-tab, ordinary HTTP(S) check.
