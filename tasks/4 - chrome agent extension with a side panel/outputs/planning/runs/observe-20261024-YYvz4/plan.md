# Observe selected tab — root-cause plan

- **Work item:** `observe-20261024-YYvz4`
- **Baseline:** delivered 0.2.0 extension at `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\outputs\browser-task-agent\extension`
- **Candidate model worktree inspected:** `C:\Users\wongn\Documents\Interview\Manus\tasks\4 - chrome agent extension with a side panel\.work\worktrees\models-five-20261024-YYvz4\extension`
- **Provenance gap:** no commit SHA/build stamp was available in the inspected inputs; no live browser run was authorized for this READONLYLIGHT pass.
- **Verdict:** source-level contract defect proven; report-specific runtime root cause remains unproven.

## Root-cause statement

**Proven mechanism:** `bridge.js:43-45` permits a readable page snapshot with non-empty `text` and `targets: []`, but `core/admission.js:9-10` rejects every such snapshot before `worker.js:61-62` creates a run. This makes read-only article observation depend on the presence of an actionable-looking DOM target, contrary to the requirement that a native rendered target is optional for reading page text.

**Runtime-dependent mechanism requiring a clean Chrome check:** the Side Panel sends `START` from an extension page (`panel.js:16`), so `sender.tab` is not a dependable selected-tab source. `worker.js:55` falls back to a new `tabs.query` at button-click time, and `worker.js:30-34` then depends on temporary `activeTab`/`scripting` capability for that exact tab. Side Panel persistence or a tab switch can therefore produce a selected-tab/capability mismatch. This is a conditional mechanism, not a proven explanation for the user report until the exact status/error, queried tab ID/URL, and injection result are captured.

**Not a root cause of initial observe:** OpenRouter key/catalog/model setup is checked only by `ADVANCE` (`worker.js:66`) and `model.js:29-32`. `START` performs no AI setup check. The five-model candidate retains the same `START`/bridge/admission sequence; its shortlist logic is downstream and does not fix observation.

## Fixed specification

1. On a valid ordinary HTTP(S) tab, **Observe selected tab** must admit a fresh same-origin snapshot when `snapshot.text` is non-empty, even if `snapshot.targets` is absent or empty. A targetless article/read operation is valid.
2. Observation must not require an OpenRouter key, catalog refresh, selected model, or paid/provider call. AI setup remains required only for `ADVANCE`.
3. Page access remains scoped to the user-invoked current tab and existing `activeTab` + `scripting` permissions. Do not add `all_urls`, `debugger`, broad host permissions, profile reads, or a permission bypass.
4. If injection is denied or the tab is restricted/non-HTTP(S), the panel must show a typed capability/URL failure rather than reporting a fabricated successful observation. Preserve the existing fail-closed behavior.
5. If the panel remains open across tab changes, the implementation must either bind observation to the explicitly selected/current tab at the user click with a fresh capability check, or reject a changed/ungranted tab with a clear reason. It must not silently claim to observe the tab that opened the panel when it actually queried another tab.
6. Every successful observe must preserve URL/origin and rendered text provenance; no page text may grant execution permission.

## Minimal implementation scope for a separate implementer

### Required, source-proven contract fix

- **File:** `extension/core/admission.js`
- **Change:** retain object, same-origin, non-empty body-text, and snapshot-shape checks; remove only the unconditional positive-target requirements at lines 9-10 for the initial read-only admission. Keep target validation in action/policy paths for click/fill approval.
- **Do not change:** `manifest.json`, host permissions, bridge extraction, model setup, or approval policy as part of this fix.

### Conditional runtime follow-up, only if the clean Chrome check confirms it

- **Primary files:** `extension/worker.js` lines 30-36 and 53-63; `extension/panel.js` lines 3 and 16.
- **Goal:** make the tab identity/capability boundary explicit and render a categorized injection-denial failure. The change must preserve user invocation and current-tab scope; it must not return canned success.
- **No change yet:** Do not edit these files merely because `sender.tab` is absent. Absence is expected for an extension-page message; the clean test must establish whether the queried tab is wrong or lacks the grant.
- **Bridge contingency:** Inspect `extension/bridge.js` only if the two `executeScript` calls prove not to share the injected bridge state in the target Chrome runtime. Do not switch execution world or expose a page-global bridge speculatively.

### Candidate five-model worktree

Do not merge or rebase the candidate as an observe fix. Its `START` path remains equivalent. Keep model-picker changes separate from this defect contract.

## Minimal evidence/test handoff

A fresh verifier or approved browser fixture should run the following matrix with the same browser profile and viewport, recording exact status text, worker/runtime error, tab ID, URL, and whether the first/second `executeScript` call succeeded. No OpenRouter call is needed for T1–T5.

| ID | Fixture/action | Expected result | Baseline significance |
|---|---|---|---|
| T1 | Ordinary HTTP(S) article/body text, no link/button/input/ARIA target; enter intent; click Observe | Run reaches `PLANNING`; text is retained; zero targets is accepted | Must fail baseline at `admission.js:9`; change-defining regression |
| T2 | Ordinary HTTP(S) page with a visible public control | Observe reaches `PLANNING`; target metadata remains available | Guards against over-removing target extraction |
| T3 | Toolbar user gesture opens Side Panel; click Observe without key/catalog/model | Observation succeeds or shows a precise capability error; no provider request | Proves AI setup is not on START and tests action-grant boundary |
| T4 | Leave Side Panel open, switch between two ordinary tabs, click Observe; record queried tab ID/URL and grant state | The clicked/current tab is explicit and authorized, or a typed changed/ungranted-tab failure appears; no silent cross-tab claim | Tests `sender.tab` absent + `tabs.query` fallback + Side Panel persistence |
| T5 | Restricted `chrome://`/extension/internal page | Clear ordinary-HTTP(S)/restricted-page error; no injection attempt or fake success | Guards the existing fail-closed URL boundary |
| T6 | With a successful T1/T2 snapshot, press Run/Advance without key/catalog | Explicit setup error only at `ADVANCE`; initial observe remains successful | Confirms no unnecessary AI block |
| T7 | Repeat T1/T2 on the five-model candidate only after model-picker verification is separate | Same observe behavior as baseline | Prevents picker changes being mistaken for observe proof |

A baseline failure at T1 is enough to implement the required one-file admission fix. T3/T4 are needed before any worker/panel tab-grant change is accepted.

## Risks and non-goals

- Removing the target-count guard must not weaken click/fill policy; `core/policy.js:29-48` still requires a current actionable target for mutations.
- Do not treat a browser API error as proof that the user clicked the wrong domain without the exact URL/error. Do not treat a successful mock Chrome object as proof of real activeTab behavior.
- No live OpenRouter call, key inspection, permission expansion, extension installation, deployment, or checkout/account action is part of this handoff.
- No independent verifier result exists yet; status remains **ready for focused runtime verification, not baseline RED/green verified**.
