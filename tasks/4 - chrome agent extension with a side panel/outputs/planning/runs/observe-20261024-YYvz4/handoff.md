# Observe selected tab — implementation/verifier handoff

## Current disposition

**Ready for focused runtime verification; not verified fixed.** The owner made no product-code changes, did not install/load the extension, did not run CLI tests, and did not call OpenRouter. Do not label the user report baseline RED/green from this packet alone: the source contract failure is proven, while the report-specific Chrome permission/tab failure is still unproven.

## Handoff to implementer (after runtime evidence)

Use the delivered 0.2.0 extension as the baseline and keep the five-model picker work separate.

1. Implement only the proven read-admission correction in `extension/core/admission.js`: a non-empty same-origin rendered snapshot is admissible for read-only observation even when `targets` is empty. Do not remove action-time target checks in `extension/core/policy.js` or `extension/core/engine.js`.
2. Do not edit `manifest.json`, add `all_urls`, add `debugger`, change host access, or bypass Chrome's denied page capability.
3. Do not add a model/key/catalog prerequisite to `START`. The initial observation must remain provider-free.
4. Wait for the clean T3/T4 runtime evidence before changing `extension/worker.js` or `extension/panel.js` for tab binding or capability errors. If the evidence shows the queried tab is not the intended current tab, make the smallest explicit-tab change possible while preserving user-invoked current-tab scope. If the evidence shows only a denied `executeScript`, improve the typed error path rather than fabricating a snapshot.
5. If and only if a runtime test proves the two `executeScript` calls cannot see the same bridge state, investigate `bridge.js`/`worker.js` as a separate bridge contract defect. Do not change execution world speculatively.

## Handoff to independent verifier

Run the same driver/profile/viewport on baseline and candidate. Record:

- exact panel `#status` text and timeline entries;
- the worker/API error text, if any;
- selected tab ID, active window ID, URL/origin, and whether it changed between toolbar invocation and Observe click;
- success/failure of each `chrome.scripting.executeScript` call;
- whether `sender.tab` was present (expected to be absent for an extension Side Panel message);
- whether an OpenRouter request occurred (it must not occur for Observe-only checks).

### Required checks

- **V-1 targetless read:** readable ordinary HTTP(S) article with no enumerated controls. Baseline must show the admission rejection; candidate must reach `PLANNING` with text retained and `targets: []` accepted.
- **V-2 controls regression:** ordinary HTTP(S) page with one visible public control. Both baseline/candidate must observe and retain target metadata.
- **V-3 no-AI observe:** no key, catalog, or selected model. Observe must not be blocked by model setup; only a later Advance may require setup.
- **V-4 sender/tab capability:** Side Panel message from extension page, toolbar-opened panel, then tab switch before Observe. Confirm whether the worker queries the actual clicked/current tab and whether temporary activeTab access follows that user invocation. A raw Chrome denial is evidence; a mock sender object is not.
- **V-5 restricted page:** `chrome://` or another non-HTTP(S) tab must fail closed with the existing URL/capability message and must not claim read success.
- **V-6 picker isolation:** the five-model worktree must not be used as evidence for V-1–V-5 unless its own build/package provenance is recorded; picker/catalog changes are a separate slice.

## Evidence that would resolve the runtime question

The following single capture distinguishes the remaining hypotheses:

`START` message received → `sender.tab` value → `tabs.query` result `{tabId,url,windowId}` → first `executeScript` result/error → second `executeScript` result/error → admission result/reason → panel status text.

Interpretation:

- `targets: []` with readable text and no injection error proves the admission guard (already source-proven).
- `sender.tab` absent, queried tab differs from the user's intended tab, or queried tab has no temporary grant proves a selected-tab/capability boundary issue.
- First/second injection failure with matching tab and ordinary URL proves a permission/runtime bridge failure, not an AI setup problem.
- Successful bridge result followed by rejection reason proves admission, not page access.

## Parent decision/request

Please provide the exact panel status/error string and the selected tab's URL/domain from the failing attempt (redacting query strings and secrets). Without those two runtime values, the worker/permission branch must remain conditional and no exact user cause should be asserted.
