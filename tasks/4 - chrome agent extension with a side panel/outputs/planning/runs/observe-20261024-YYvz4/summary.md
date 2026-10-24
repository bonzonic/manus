# Observe selected tab — source review summary

## Result

The frozen contract is amended for the reporter's “it does nothing” symptom. The source review proves two separate issues:

- **Proven admission defect:** `core/admission.js:9-10` rejects a readable same-origin snapshot when `targets` is empty, even though read-only article observation is valid.
- **Proven feedback gap:** `panel.js:16` awaits `START` without first showing a busy state; `send()` has no timeout, accepts an undefined reply as non-error, and the current response state contains no bounded snapshot/read-only summary. A real runtime denial, transport failure, or wrong-tab condition is not proven from this packet.

The amended handoff requires immediate `Reading this tab…` feedback, busy/duplicate-click protection, typed permission/unsupported-URL/transport-error/transport-timeout outcomes, a bounded actual read-only summary explicitly showing “no eligible controls” for `targets: []`, and a real click-to-`chrome.runtime.sendMessage({type:'START'})` event test.

## Exact files reviewed

1. `outputs/planning/runs/observe-20261024-YYvz4/plan.md`
2. `outputs/planning/runs/observe-20261024-YYvz4/handoff.md`
3. `outputs/planning/coordination/observe-20261024-YYvz4/user-feedback.md`
4. `.work/worktrees/models-five-20261024-YYvz4/extension/panel.html`
5. `.work/worktrees/models-five-20261024-YYvz4/extension/panel.js`
6. `.work/worktrees/models-five-20261024-YYvz4/extension/worker.js`
7. `.work/worktrees/models-five-20261024-YYvz4/extension/core/admission.js`

## Checks recorded for the parent

- **Panel markup:** `#status` is a visible `role=status`; `#origin`, `#progress`, `#outcome`, and `#timeline` are available for safe status/result rendering.
- **Handler registration:** click handlers are registered synchronously at `panel.js:14-20` before initial async `GET_STATE` at line 21; however, a top-level import/DOM/binding exception can abort registration without a visible bootstrap error.
- **Observe path:** `panel.js:16` calls `send('START')`; no synchronous busy/status mutation occurs before the await.
- **Async failure handling:** rejected worker responses are caught by the main handlers, but there is no deadline; undefined/malformed replies can be treated as success; no explicit transport classifier exists.
- **Worker boundary:** `worker.js:54-63` does not require model/key/catalog for `START`; `sender.tab` absence is expected for a Side Panel; `tabs.query` fallback and two `executeScript` calls require real Chrome evidence before changing.
- **Read summary:** `responseState()` exposes phase/log/result but not bounded snapshot text, target count, or an explicit targetless read-only outcome.
- **Safety:** preserve ordinary HTTP(S), fresh origin, current-tab/activeTab+scripting, visible-target, approval, and sensitive-action boundaries. Do not add broad permissions or claim success after denied access.

## Required runtime/event checks (not executed here)

1. Real panel `#start` click with deferred runtime response: assert status `Reading this tab…` and busy state occur before `START` resolves; assert exactly one real `START` message and duplicate-click suppression.
2. Readable ordinary HTTP(S) article with no controls: assert actual snapshot is admitted, `targets: []` is visible as a bounded read-only summary, no eligible mutation/approval is enabled, and no provider request occurs.
3. Readable ordinary HTTP(S) page with a visible control: assert target metadata remains available and action-time policy is unchanged.
4. Real permission/injection denial: assert typed capability status, no fabricated snapshot, and no raw Chrome/page data in UI/logs.
5. Restricted/non-HTTP(S) tab: assert typed unsupported-page status and no injection attempt.
6. Rejected or unresolved runtime message: assert distinct transport-error and bounded-timeout states, button recovery, and no unhandled Promise.
7. Side Panel left open across a tab switch: record `sender.tab`, queried tab ID/URL/window, injection results, and final status; accept only explicit current-tab success or typed mismatch/denial.
8. No key/catalog/model: assert Observe is provider-free; only later `ADVANCE` may require setup.

## Scope and non-claims

Only the two planning artifacts named below were written. No source code was changed. No CLI, browser, extension install/load, native runtime, permission, provider, or OpenRouter test was run. Therefore this packet contains no native PASS/FAIL claim and does not prove the reporter's exact tab/domain/permission cause.
