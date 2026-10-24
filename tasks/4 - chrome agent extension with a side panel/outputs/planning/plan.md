# Chrome Side Panel Agent Implementation Plan

> **For implementation workers:** Use checkbox syntax for tracking. One distinct implementer executes this dependent slice in the prepared worktree; a fresh reviewer verifies the resulting package. Read the architecture before editing. Do not begin until the user approves it. Use current Manus workflow tool schemas at dispatch time; do not assume a model, unsupported messaging API, or external runtime.

**Goal:** Build and verify all six must-haves of a supervised, single-tab, live-model Chrome agent in a 20-minute development time box.

**Architecture:** A Side Panel presents plans and exact approvals. A service-worker engine is the sole action authority; an isolated top-frame DOM bridge executes a small validated tool set. Session checkpoints prevent blind replay, and one explicitly selected model adapter proposes actions without executing them.

**Tech Stack:** Chrome 116+ / Manifest V3, vanilla JavaScript ES modules with JSDoc, HTML/CSS, `chrome.*` APIs. Node 22.12.0 with built-in `node:test` is available. No runtime dependencies, bundler, npm installation, backend service, React, or database is proposed.

**Spec:** [Architecture and must-have scope](research.md).

## Global constraints

- User approval precedes scaffolding, product code, dependency installation, or browser/model integration.
- Preserve original repository changes. Work only in the prepared detached worktree; no commits, merges, pushes, or deployments without separate authorization.
- Product root: `extension/` in the worktree. All task documents must be under `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel`, as explicitly selected by the user. Planning/setup documents live in `outputs/planning/`, supporting evidence in `outputs/planning/evidence/`, and verifier-owned reports in a distinct subfolder under that same task root. This overrides the earlier document-destination default. Do not move source inputs just to match the output layout.
- Required permissions: `sidePanel`, `activeTab`, `scripting`, `storage`; only the chosen model HTTPS origin is optional host access. No broad page access, `tabs`, or `debugger` permission.
- Single authorized tab, top frame only. New tabs/cross-origin pages require reinvocation and a fresh run.
- Four tools: observe, scroll, click, fill. Every click/fill has an exact one-use approval; high-impact/sensitive operations remain manual.
- Maximum eight action decisions, 90 seconds active execution, 20 seconds per model request, 16,000 page-text characters, 80 targets, 128 KB stored run state, one stale-target re-observation. No click/fill replay after an uncertain result.
- Use trusted-context session storage; never ship a developer key, read existing input values, execute model HTML/JavaScript, or expose a page-supplied network endpoint.
- A live model connection and a real-page action sequence are completion gates. Fixtures alone are not sufficient.
- Twenty minutes is a target allocation, not a guarantee. Keep failed/blocked must-haves visible; stop and hand over honestly at the deadline.

## Review focus

1. Worker interruption after dispatch but before result: no replay; Task 2 `interruptedDispatchNeverReplays`.
2. Replaced element or changed destination after approval: re-preview or block; Tasks 1–2 `changedFingerprintInvalidatesApproval`.
3. Late provider output or duplicate messages after cancel/pause: no new action; Task 2 `cancelledRunIgnoresLateProposal` and `duplicateAdvanceDoesNotDispatchTwice`.
4. Page/model instructions request a secret, alternate endpoint, arbitrary selector/code, or sensitive submit: reject locally; Tasks 1–3 `untrustedProposalCannotExpandCapabilities` and sensitive-control fixture.
5. Model says finish or click receives no visible effect: outcome cannot become succeeded without evidence; Tasks 2–4 `finishNeedsObservedEvidence` and live no-op-click check.

## File map and interfaces

All code paths below are relative to the worktree. The implementer may combine tiny helper modules if doing so preserves these interfaces; do not introduce extra architectural layers to satisfy a folder diagram.

```text
extension/
  manifest.json              permissions, toolbar entry, packaged panel/worker
  panel.html                 semantic panel controls
  panel.css                  compact readable UI, focus styles
  panel.js                   safe UI rendering and intent/approval messages
  worker.js                  Chrome API boundary and message routing
  bridge.js                  injected private DOM registry and four tools
  core/
    contracts.js             message/proposal/state validation and limits
    policy.js                blocked actions, exact approval binding
    engine.js                run transitions, sequencing, evidence checks
    model.js                 one chosen provider -> internal Proposal
    store.js                 trusted-context session checkpoint wrapper
  tests/
    policy.test.mjs
    engine.test.mjs
    manifest.test.mjs
    fixtures/interaction.html
  package.json               type: module only; no installed dependencies
```

Public boundaries:

- `validateProposal(value) -> Proposal | ValidationError`; only the union from the architecture is accepted.
- `evaluateAction(action, snapshot, run) -> { decision: 'allow' | 'approve' | 'block', reason }`.
- `approvalDigest(run, action, snapshot) -> Promise<string>`; SHA-256 canonical binding.
- `advanceRun(run, proposal, dependencies) -> Promise<RunState>`; injected dependencies expose bridge observation/execution, store, clock, and model.
- `propose({ intent, plan, snapshot, results }, signal) -> Promise<Proposal>`; provider responses have no execution authority.
- `observe(tabId, { intent }) -> Promise<PageSnapshot>` and `execute(tabId, command) -> Promise<ActionResult>`; worker wrappers around the bridge. Intent keywords prioritize main-content targets before truncation. Command includes run/action ID, exact target reference, typed Expected condition from the architecture, and approved binding when necessary.
- `loadRun() -> Promise<RunState | null>` and `saveRun(run) -> Promise<void>`; invalid version/state fails closed.

Messages from the panel: `START`, `RUN_PLAN`, `ADVANCE`, `APPROVE`, `PAUSE`, `RESUME`, `CANCEL`, `GET_STATE`, `CLEAR_SESSION`, `CONFIGURE_MODEL`. `APPROVE` carries only the exact pending digest, never a replacement action. The worker generates run IDs and obtains target metadata from its bridge. Content-origin messages are limited to scoped bridge observations/results and cannot invoke the model or control the run.

## Task 1 — Pin the permission, contract, and approval boundary

**Allocation:** approximately 3 minutes. **Covers:** M1 and M5 foundation.

**Create:** `extension/package.json`, `extension/manifest.json`, `extension/core/contracts.js`, `extension/core/policy.js`, `extension/tests/policy.test.mjs`, `extension/tests/manifest.test.mjs`.

**Consumes:** approved architecture and selected model origin. **Produces:** exact allowed-action contract, manifest, `validateProposal`, `evaluateAction`, and `approvalDigest`.

- [ ] Write failing tests `manifestHasOnlyScopedPermissions`, `clickAndFillRequireExactApproval`, `changedFingerprintInvalidatesApproval`, `blockedActionCannotBeApproved`, `untrustedProposalCannotExpandCapabilities`, and `oversizedProposalIsRejected`.
- [ ] Run `node --test .\extension\tests\policy.test.mjs .\extension\tests\manifest.test.mjs` from the worktree. Confirm failures are caused by missing intended behavior, not a broken test command.
- [ ] Implement the smallest contract/policy. Known read/scroll actions are allowed; click/fill need approval. Sensitive controls and non-search submissions are blocked. Validate arguments and size bounds without executing generated code.
- [ ] Run the same command and require all tests to pass. The exact provider hostname must come from the user's selection, not a wildcard or page content.

## Task 2 — Build the DOM bridge and restart-safe run engine

**Allocation:** approximately 6 minutes. **Covers:** M2, M3 sequencing, M4 evidence, M5 controls, M6 recovery.

**Create:** `extension/bridge.js`, `extension/core/engine.js`, `extension/core/store.js`, `extension/worker.js`, `extension/tests/engine.test.mjs`, `extension/tests/fixtures/interaction.html`.

**Consumes:** Task 1 contracts/policy. **Produces:** `observe`, `execute`, `advanceRun`, `loadRun`, `saveRun`, and worker message handling.

- [ ] Write failing tests using injected fake bridge/model/store/clock dependencies: `threeActionsExecuteSequentially`, `approvalBoundToPendingStep`, `cancelledRunIgnoresLateProposal`, `duplicateAdvanceDoesNotDispatchTwice`, `pauseStopsNextDispatch`, `interruptedDispatchNeverReplays`, `finishNeedsObservedEvidence`, `alreadyTrueConditionCannotVerifyNoOpClick`, `stepAndTimeBudgetsStopRun`, and `corruptStoreFailsClosed`.
- [ ] Run `node --test .\extension\tests\engine.test.mjs` and verify the expected failing behavior.
- [ ] Implement one authoritative pending action, version/generation checks, pre/post-dispatch checkpoints, terminal states, and no-replay recovery. Do not keep unresolved messages open while waiting for approval.
- [ ] Implement bridge extraction, private snapshot-local target registry, visible/enabled/attached/overlay checks, bounded scroll, approved DOM click, and native-setter input/change events for simple fill. Check resulting fill values locally; never return unrelated existing field values. Handle no-op/uncertain actions honestly.
- [ ] Re-observe after actions. Same-origin navigation reinjects; unknown/cross-origin scope or tab switching stops. Re-observation may propose a different action, but cannot reuse approval for it.
- [ ] Rerun engine and policy tests. DOM behavior still requires the real Chrome checks in Task 4; mocked engine tests do not prove page compatibility.

## Task 3 — Connect one live model and the visible panel

**Allocation:** approximately 6 minutes. **Covers:** M1, M3, M4, M5 user-facing behavior.

**Create:** `extension/core/model.js`, `extension/panel.html`, `extension/panel.css`, `extension/panel.js`. **Modify:** `extension/worker.js` for configuration/proposal calls.

**Consumes:** Tasks 1–2 contracts and engine; user-selected live provider configuration. **Produces:** first-use disclosure, connection check, request/plan/action timeline, exact approvals, pause/resume/cancel, and final status.

- [ ] Add failing engine/adapter cases for invalid model JSON, authentication failure, request timeout, endpoint substitution, and finish without observations. Test fetch through an injected stub; never spend live API credits in unit tests.
- [ ] Run the affected Node tests and establish the failing baseline.
- [ ] Implement the selected provider only. Use worker-origin fetch, trusted-context session credentials, AbortController, safe error text, strict validated JSON, and prompt separation between user intent and untrusted page data.
- [ ] Implement accessible native controls and text-only rendering. Initial action plan is shown before Run plan. Pending click/fill gets an exact preview and one approval; Resume re-observes. Closing the panel prevents further advancement at the next boundary.
- [ ] Run the affected tests. Make one explicit live connection test only after the user supplies configuration locally. If no usable live connection exists, record M1/M3 as blocked rather than building a fake agent.

## Task 4 — Independent verification, real-page demo, and package

**Allocation:** final 5 minutes. **Covers:** every must-have and delivery.

**Create deliverables:** a loadable `extension/` package and `chrome-sidepanel-agent.zip` in task `outputs/` after verification; `how-to-try.md` in task `outputs/planning/` with actual local paths and selected provider setup. **Evidence:** fresh verifier-owned subfolder under task `outputs/planning/`; do not edit the reviewer's verdict.

**Consumes:** fixed candidate files, architecture, unit tests, live configuration supplied locally. **Produces:** verified scope or exact blocked/unmet criteria, package, and setup instructions.

- [ ] A fresh reviewer runs `node --test .\extension\tests\*.test.mjs` from the worktree, inspects the complete scoped diff/manifest, and confirms no packaged key, remote code, wildcard model endpoint, or approval bypass. If PowerShell/native wildcard handling differs, enumerate the test files explicitly and record the actual command.
- [ ] Load the exact candidate as an unpacked extension in Chrome and verify toolbar access, provider connection, and one public docs workflow with at least three consecutive live-model actions including approved click and scroll. Record actual start URL, result, and package identity.
- [ ] Verify exact benign search-field fill without submit. In the retained fixture, verify stale target approval, blocked password/submit, cancellation before the next action, and a dispatched no-op click remaining unverified. Use no real-account side effects.
- [ ] Check worker interruption/recovery by unloading/stopping the worker in an approved test context if supported. Session clears on extension reload, so reload is not proof of worker-only recovery. If the driver cannot stop a worker safely, report this browser-level check as unrun; the unit test still covers the engine policy but does not replace it.
- [ ] Freeze file hashes for the reviewed candidate. Package that exact candidate, excluding tests/fixtures and all credentials, into the task deliverables folder. Confirm extracted manifest and all referenced scripts exist. Save accurate load/setup instructions and link the package.

If browser control cannot load native extensions, ask the user to load it locally and run the short checklist; do not claim the live checks passed until there is actual evidence. If any required independent or live gate remains unrun at minute 20, hand off **unverified/incomplete**, naming the affected must-have.

## Coverage and handoff

M1 maps to Tasks 1/3/4; M2 to Tasks 2/4; M3 to Tasks 2/3/4; M4 to Tasks 2/3/4; M5 to Tasks 1/2/3/4; M6 to Tasks 2/4. Tab management, vision/CDP, hosted services, login, history, streaming, and broad-site guarantees remain explicitly deferred.

No implementation/test/build/browser/model check has run as part of writing this plan. Proposed commands use the observed Node runtime, not an invented existing npm script. Do not commit merely because the plan is finished. Await the user's approval and live-model connection selection before dispatching the implementer.
