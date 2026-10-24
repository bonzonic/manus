# Observe selected tab — amended frozen handoff

## Disposition and authority

**Ready for parent implementation and focused runtime verification; not verified fixed.** This pass was readonly/source-only. It did not install or load the extension, use Chrome APIs, run CLI tests, call OpenRouter, inspect a live tab, or claim a native PASS. The source-level targetless-admission defect is proven. The exact Chrome tab/permission cause of the reporter's no-op remains unproven.

The user feedback is authoritative for this amendment: the visible symptom was “it does nothing” after pressing Observe, with no loading, error, or result. Do not ask again for the domain, invocation conditions, or exact error unless a material blocker arises. Do not infer a domain, toolbar invocation, or permission grant from the missing details.

The five-model picker worktree remains a separate slice. Do not merge it or use it as Observe evidence without its own package/build provenance.

## Proven source findings

1. `core/admission.js:8-10` requires non-empty text **and** a non-empty valid target list. This rejects a readable ordinary article with `targets: []` before a run is created. `bridge.js` can produce readable text with no targets, so the admission conflict is proven.
2. `worker.js:54-63` performs Observe without a key, catalog, selected model, or provider call. AI setup is not the initial Observe blocker and must stay out of `START`.
3. `worker.js:56` uses `sender.tab` or a fresh `tabs.query({active:true,currentWindow:true})`. For an extension Side Panel message, absent `sender.tab` is expected; whether the queried tab or temporary grant is wrong is conditional until captured in Chrome.
4. `worker.js:30-34` performs two `executeScript` calls. Their errors bubble to the message wrapper, but there is no typed capability/transport classification at the panel boundary.
5. `panel.js:16` calls `send('START', ...)` without first rendering a busy state. `send()` waits for `chrome.runtime.sendMessage`, has no timeout, and only renders after a reply. A rejected reply is caught by the click handler, but an undefined reply is treated as non-error and a hung transport has no visible deadline.
6. `panel.js:14-20` registers button handlers synchronously before the initial asynchronous `GET_STATE` at line 21, so the initial state request is not itself ordered ahead of Observe registration. However, a top-level import, missing DOM element, or other synchronous exception during lines 1-20 can abort registration before any click handler exists; the current panel does not surface that bootstrap failure.
7. `worker.js:16` exposes run phase/log/result but no bounded snapshot/read-only summary. The current panel therefore cannot show the actual bounded observed-text outcome or explicitly say that no eligible controls were found.
8. `panel.html:19` provides `#status` as a visible `role=status` surface. `#origin`, `#progress`, `#outcome`, and `#timeline` are additional visible surfaces; none may receive raw API keys or unbounded page values through errors/logs.

## Frozen contract amendment

### A. Immediate and asynchronous Observe feedback is mandatory

On the real `#start` click, before the first `await` or worker response, the panel must synchronously:

- set the visible status to exactly `Reading this tab…` (or an equally explicit localized equivalent fixed by the parent);
- mark the operation busy (`aria-busy` and/or a busy state) and prevent duplicate Observe clicks;
- retain the user intent only within the existing bounded intent rule; do not log or display secrets or unbounded page text;
- send exactly one real runtime `START` message containing the intent.

The first observable event must be the busy status, not a helper-only call or a post-response render. A late response must not overwrite a newer Observe attempt; use an operation token/generation or equivalent.

The operation must end in a visible, typed state, at minimum:

- **Readable success:** bounded read-only snapshot summary, origin/provenance, and whether eligible controls exist;
- **Permission/capability denied:** clear instruction to invoke on the user-invoked ordinary HTTP(S) tab; no fabricated success;
- **Unsupported URL:** clear ordinary-HTTP(S)-page instruction;
- **Transport error:** extension-worker/message-channel failure shown without raw Chrome/page data;
- **Transport timeout:** bounded timeout (parent may choose the exact limit, e.g. 8–10 seconds), with retry guidance and no false result.

Every failure path, including a worker `{error}` reply, rejected `sendMessage`, undefined/malformed reply, bootstrap error, and timeout, must leave the panel non-busy and visibly actionable. No silent catch and no indefinite “Reading…” state.

### B. Readable targetless pages are valid read-only observations

A fresh same-origin rendered snapshot with non-empty body text is admissible for initial read-only Observe when `targets` is absent or empty. Retain object, URL/origin, text, and snapshot-shape checks. Remove only the unconditional positive-target requirement from initial admission; do not weaken action-time checks in `core/policy.js`, `core/engine.js`, or approval dispatch.

For `targets: []`, show a bounded visible summary such as “Readable page observed — no eligible controls found — read-only observation.” The summary must be derived from the actual accepted snapshot, include fresh origin/provenance, and cap any text excerpt/character count. It must not claim controls, clicks, fills, or success that were not present. Do not enable unsupported click/fill/approval mutations merely because the run reached `PLANNING`; a targetless page may support read/scroll only under an explicit read-only path.

A page text value never grants execution permission. Preserve the existing fresh-origin, current-tab, activeTab/scripting, visible-target, approval, sensitive-action, and fail-closed safety boundaries. Do not add `all_urls`, `debugger`, broad host permissions, profile access, or a permission bypass. Preserve the five-model shortlist choices independently of this repair.

### C. AI setup remains downstream

`START`/initial Observe must not require an OpenRouter key, live catalog, selected model, or provider call. Setup errors belong to `ADVANCE` only. A successful targetless read must not be relabeled as a model/configuration failure.

### D. Tab identity and capability remain conditional until Chrome evidence

Do not change `worker.js`/`panel.js` tab binding solely because `sender.tab` is absent; that absence is expected for a Side Panel message. If runtime evidence shows the selected/current tab differs or lacks the temporary grant, make the smallest explicit-tab/capability correction while preserving user-invoked current-tab scope. If runtime evidence shows only `executeScript` denial, improve typed error handling rather than returning a canned snapshot. Investigate `bridge.js` execution-world/state sharing only if the two real `executeScript` calls prove not to share bridge state.

## Required real event/runtime verification

This must test the actual panel page and actual `#start` click-to-runtime boundary, not merely call a helper or assert that a handler function exists. Use the same profile/viewport for baseline and candidate. Browser/native execution is required and was **not run in this pass**.

For every case, capture a single ordered trace:

`real #start click → synchronous #status busy mutation → busy/duplicate-click guard → Chrome START message {type, bounded intent} → worker reply/rejection/timeout → final status → visible bounded summary/timeline`

Also capture `sender.tab`, `tabs.query` result `{tabId,url,windowId}`, first and second `executeScript` success/error, admission reason, and whether any OpenRouter request occurred. Redact query strings, secrets, and page values from the test record.

| ID | Real panel/runtime check | Required result |
|---|---|---|
| E1 | Dispatch/click the actual `#start` button with a deferred `chrome.runtime.sendMessage`; inspect DOM/status before resolving the promise | `Reading this tab…` is visible and busy before `START` resolves; one `START` message is emitted; duplicate click is blocked; no helper-only pass claim |
| E2 | Ordinary HTTP(S) article with readable text and no controls; real Observe through bridge and admission | Readable success; `targets: []` accepted; bounded actual read-only summary explicitly says no eligible controls; no click/fill/approval enabled; no provider request |
| E3 | Ordinary HTTP(S) page with a visible public control | Readable success with target metadata; existing action-time policy and approval remain intact |
| E4 | Real worker/capability denial (or controlled Chrome denial fixture) on the invoked tab | Typed permission/capability status and retry instruction; non-busy final state; no fabricated snapshot; raw Chrome error/page value not exposed |
| E5 | `chrome://`, extension-internal, or other non-HTTP(S) page | Typed unsupported-page status; no injection attempt or fake success |
| E6 | Reject `sendMessage` / simulate unavailable receiver, then leave it unresolved past the bounded deadline | Transport error and transport-timeout states are distinct and visible; button recovers; no unhandled Promise and no indefinite busy state |
| E7 | Leave Side Panel open, switch between two ordinary tabs, then perform a real Observe click | Trace proves clicked/current tab identity and grant, or shows a typed changed/ungranted-tab failure; no silent cross-tab claim |
| E8 | No key/catalog/model, then Observe followed by Run/Advance only where a valid read-only path permits it | Observe is not blocked by AI setup; any later `ADVANCE` setup error is explicit and downstream |
| E9 | Repeat E2–E3 against the five-model candidate only after picker/package provenance is recorded | Observe behavior matches the fixed contract; picker changes are not used as admission evidence |

A native pass/fail verdict must be supplied only after E1–E8 are actually run. This handoff itself is not a native test result.

## Implementation boundaries for the parent

1. First apply the one-file admission contract change in `core/admission.js`.
2. Separately repair panel/worker feedback and bounded read-summary transport as needed: immediate busy state, safe error categorization, timeout, malformed/undefined reply handling, bootstrap visibility, and targetless read-only gating.
3. Do not alter manifest permissions, provider setup, picker choices, or bridge execution world as part of the unproven runtime branch.
4. Keep raw API keys and page values out of errors, logs, and exported timeline fields. A bounded user-facing snapshot excerpt is allowed only in the intentional read-only result surface, with explicit size/provenance limits.
5. Re-run the real event/runtime matrix on baseline and candidate before declaring the reporter's no-op fixed.

## Exact reviewed file list

- `outputs/planning/runs/observe-20261024-YYvz4/plan.md`
- `outputs/planning/runs/observe-20261024-YYvz4/handoff.md`
- `outputs/planning/coordination/observe-20261024-YYvz4/user-feedback.md`
- `.work/worktrees/models-five-20261024-YYvz4/extension/panel.html`
- `.work/worktrees/models-five-20261024-YYvz4/extension/panel.js`
- `.work/worktrees/models-five-20261024-YYvz4/extension/worker.js`
- `.work/worktrees/models-five-20261024-YYvz4/extension/core/admission.js`

## Explicit non-claims

No browser run, Chrome permission result, exact domain, invocation event, worker runtime trace, CLI test, install/load test, OpenRouter call, native PASS, or native FAIL was observed in this source-only pass. The proven admission conflict and the panel's missing immediate/timeout/error-summary behavior are source findings; the report-specific tab/permission mechanism remains conditional.
