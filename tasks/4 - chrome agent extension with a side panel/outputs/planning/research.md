---
status: awaiting-user-approval
updated: 2026-10-24
budget: 10 minutes planning, 20 minutes development
---

# Chrome Side Panel Agent — Architecture and MVP Scope

Build a **supervised, single-tab browser agent** that can read a real page and carry out a short sequence of actions from a natural-language request. Spend the 20-minute development window on the action loop, user control, and truthful results—not accounts, tab management, or a polished chat platform.

This is a proposed contract for approval, not a claim that the extension exists. All must-haves below belong to the first build. If a dependency or verification gate fails, report an incomplete build rather than silently reclassifying a must-have as optional.

## 1. Decisions and starting point

**Your decisions:** always use worktrees; allocate 10 minutes to architecture and 20 minutes to development; approve the plan before implementation; treat tasks.md.txt as suggestions rather than a fixed feature checklist. You selected `C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel` for all task documents, overriding the earlier repository default. Planning documents are grouped in `outputs/planning/`, with supporting records in `outputs/planning/evidence/`.

**My proposed defaults:** Chrome desktop 116+, Manifest V3, plain JavaScript ES modules and CSS, no bundler, no application backend, one live model provider, one user-authorized tab, top-frame DOM only. These are recommendations for this time budget, not requirements you previously selected. Chrome supports the Side Panel API from 114 and programmatic opening from a user action from 116 [1].

**Model access:** you confirmed that you can enter an API key locally. Provider, model, and exact endpoint selection remain pending, as does architecture approval. Do not paste secrets into chat. A scripted fixture can test the plumbing but cannot count as a live natural-language agent.

The existing architecture/architecture.md:13–17 and plans/plan.md:19–21 are title-only, read-only proposals. tasks.md.txt:2–12 now supplies the real multi-action brief. Git HEAD is `0c3155d` on `main`; .gitignore, AGENTS.md, and README.md are tracked at that revision, and existing task documents are untracked. There is no product implementation or established product framework to preserve. Node 22.12.0 is available for dependency-free tests.

The original checkout has unrelated changes, which remain untouched. The requested detached worktree is:

```text
C:/Users/wongn/Documents/Interview/Manus/tasks/4 - chrome agent extension with a side panel/.work/worktrees/architecture-20261024-YYvz4
```

Product code will live in `extension/` inside that worktree. This document and the [build plan](plan.md) now live in the user-selected task folder under `outputs/planning/`. All five planning/evidence documents were moved together, preserving their relative links. Future task documents must also stay under this task folder. Existing drafts in the task's `architecture/` and `plans/` directories remain unchanged until you decide whether to supersede them.

## 2. Must-have features — all required for this build

### M1 — Installable Side Panel and deliberate page access

Load an unpacked extension, click its toolbar icon, and see a compact panel showing the authorized page and whether the model is connected. The toolbar invocation grants temporary `activeTab` access; a button in an already-open panel must not pretend it grants fresh access. A newly selected or cross-origin page requires another toolbar invocation. No default access to all browsing activity [2].

First-use copy explains that scoped page text is sent to the chosen model, actions need supervision, and high-impact tasks are handed back to the user. Model configuration is entered locally and a small live connection check shows usable/authentication/network status before a task starts.

### M2 — Useful page understanding, not raw HTML dumping

Capture page URL/title, visible text, headings, and a small registry of rendered links/buttons/simple inputs. Prefer main/article content over navigation boilerplate; rank targets by intent keywords and current visibility before applying the limit. Include off-viewport rendered elements so the agent can locate and scroll to content. Use at most 16,000 text characters and 80 targets, with a truncation indicator. Refresh this snapshot before choosing the next action.

Never read existing input/textarea/contenteditable values, password values, cookies, localStorage, hidden inputs, or unrelated frames. Sensitive-field metadata is marked non-actionable; forms containing password, payment, verification-code, or identity-sensitive controls are not automation targets. Redact obvious secret patterns from text before sending it, but do not promise perfect removal of all personal data. The first-use disclosure is still necessary.

### M3 — A real, bounded sequential action loop

Accept natural language, show a short proposed plan, then offer **Run plan**. The live model selects one allowed action at a time using the latest observation; the extension, not the model, decides whether that action is legal.

Only four tools ship: `observe`, `scroll`, `click`, and `fill`. `observe` includes finding text/targets; `scroll` moves by a bounded amount or brings a known target into view; `click` operates on an approved known target; `fill` replaces a simple search/text field with the exact approved value. No arbitrary JavaScript, selectors, keypress/Enter, generic network requests, file upload, or form-submission tool.

A run permits at most eight action decisions and 90 seconds of active work, excluding time waiting for the user. Each model request times out after 20 seconds or the remaining active budget, whichever is shorter. Malformed model output yields a visible error; it never falls through to execution.

### M4 — Visible progress and evidence-backed outcomes

Keep a simple plan, current step, and chronological action log in the panel. Show concrete lines such as “Reading page,” “Waiting for approval to click ‘Examples’,” and “Scrolled to ‘Permissions’.” No token-streaming UI is required.

After each action, obtain a fresh observation and verify its stated expected result. A fill succeeds when the target contains the requested value, checked locally without exposing unrelated field values. A scroll succeeds when the expected viewport/target condition holds. A click succeeds only when its expected URL or newly visible content change is observed. If a dispatched click has no observable result, report “action sent; outcome unverified,” not success.

A model `finish` request must point to evidence from the latest observation/action results. The summary distinguishes **succeeded**, **partially completed**, **needs your action**, **failed**, and **cancelled**. Only a run whose required observable checks pass can be marked succeeded.

### M5 — Supervision, stop controls, and a conservative safety boundary

Read/find and bounded scrolling may run after Run plan. **Every click and every fill requires its own exact preview and explicit approval in this MVP.** The preview contains the site, target label, proposed value or destination, and expected result. This avoids pretending that a button is safe merely because it says “Next”; typing can also trigger autosave.

Payments, purchase confirmation, deletion, sending/publishing, account changes, final non-search form submissions, login, and sensitive-field entry are blocked for automation and handed to the user. A recognizable search-only GET form on a public page may be clicked with exact approval; ambiguous submit controls are blocked. Detection uses local DOM metadata plus conservative intent/label checks, not model-provided risk labels. This is a prototype safeguard, not a guarantee about arbitrary site JavaScript; only benign public-page workflows are in the verified scope.

Approval is one-use and bound to the run, step, tab, document, target fingerprint, action arguments, and expected result. Replacing a target, changing the intended action, or navigating invalidates approval. A blocked action cannot be made legal by approving it.

Pause prevents the next dispatch; Resume re-observes and invalidates pending approvals. Cancel records a terminal state and ignores late model replies. Neither control promises to undo a click already dispatched. User-supplied instructions remain separate from page content; malicious page instructions cannot change tools, permissions, model endpoint, or approval rules.

### M6 — Bounded recovery and an honest compatibility envelope

Check that a target is attached, visible, enabled, uniquely registered, and not obscured before acting. Re-observe once if the target is stale or a benign expected change is delayed. Any changed click/fill requires a new approval. Never blindly retry a click or fill after an uncertain result.

Same-origin full navigation causes reinjection and a new document snapshot; a changed URL in a single-page app causes re-observation. Cross-origin navigation, tab switching, unsupported controls, browser-native dialogs, login/CAPTCHA, missing access, and closed tabs stop the run with a clear next action. Reinvoke the extension on the new page to start a fresh scoped run. Support ordinary top-frame DOM pages only; do not claim compatibility with all websites.

Persist a small run checkpoint in `chrome.storage.session`. After a worker restart, an in-progress dispatch becomes **interrupted / outcome unknown**, with no automatic replay. The user may start again from a fresh observation. Cross-browser-session history/resumption is not part of this build [3] [4].

## 3. Nice-to-have features — later, not hidden MVP dependencies

**Broader browser operation:** opening/switching/grouping tabs, cross-site journeys with per-origin permission prompts, iframe/open-shadow-DOM support, file upload/download handling, advanced widgets, and screenshot/vision fallback.

**Better interaction:** streamed responses, editing individual plan steps, adding context mid-run, selected-text context, action highlighting overlays, keyboard shortcuts, undo where a site genuinely supports it, task templates, and polished onboarding.

**More autonomy and resilience:** remembered per-site policies, narrowly approved safe-action batches, site adapters, multi-attempt semantic relocation, independently verified high-impact action support, persistent task history, resume after browser restart, and cost/usage dashboards.

**Product infrastructure:** hosted model proxy, login, encrypted server-side credential custody, multiple model providers, telemetry with opt-in, cloud sync, team/admin policy, and Chrome Web Store distribution.

These additions must preserve the same action policy boundary. Adding vision or a new provider must not create a second executor that bypasses approval.

## 4. Architecture and ownership

```text
User
  |
  v
Side Panel: request -> plan -> Run -> exact approvals -> result
  | validated extension messages        ^ state snapshots
  v                                     |
Service Worker: authoritative run engine + policy + session checkpoint
  |                         |
  | scoped commands         | bounded HTTPS request
  v                         v
Top-frame DOM bridge       One configured LLM provider adapter
  |                         |
  v                         v
Page action + observation  Proposed plan/action JSON only
```

### Panel — presentation and deliberate decisions

`panel.js` owns UI rendering and sends intent/approval/pause/cancel messages. It never executes browser actions directly. Render page/model strings as text, not HTML. The UI shows an authorized-tab badge and does not silently follow the user into another tab.

The panel drives the next `ADVANCE` request only while the user has a running task. Closing/disconnecting the panel stops future dispatches at the next boundary. This is supervised work, not an unattended background agent.

### Worker — the only authority for dispatch

`worker.js` owns browser integration and a single active run. `core/engine.js` advances one bounded step; `core/policy.js` validates tools, action scope, blocked operations, and exact approvals; `core/contracts.js` validates message and model shapes. The worker writes a checkpoint **before** dispatch and after receipt/verification.

Each `ADVANCE` processes a bounded unit and returns state. Waiting for approval does not leave an unresolved long-running request. Single-flight dispatch plus monotonic run/step versions rejects duplicates; cancellation/version checks are repeated immediately before execution. State is not trusted merely because it came from storage.

Chrome may terminate a worker after inactivity or a long fetch, so memory-only execution state and assuming that an open port guarantees liveness are rejected [3]. An uncertain recorded dispatch is never replayed automatically.

### DOM bridge — observation and a tiny executor

`bridge.js` is programmatically injected into the authorized top frame in an isolated world. It owns a private registry mapping snapshot-local IDs to actual elements. Each document has a private nonce, each observation a snapshot ID, and each target a fingerprint based on role/label/type/destination. Do not write IDs into page DOM attributes, accept CSS from the model, or inject executable model output.

Before a click/fill, the bridge itself checks that the current element still matches the approved fingerprint and document/snapshot. DOM content is untrusted even in an isolated world; isolation protects JavaScript state, not the integrity of a page's content [5]. Synthetic DOM interaction is not a trusted native mouse/keyboard event. Sites that reject it are unsupported rather than forced through a debugger fallback.

### Provider adapter — propose, never execute

`core/model.js` exposes `propose(input, signal)` and converts one selected provider's response to the validated internal shape. One chosen provider and model are configured explicitly before implementation. No model ID or response API is assumed to work without a live connection test.

For the short build, prefer the user's API key kept in trusted-context `storage.session` and HTTPS requests from the worker. This removes a backend deployment from the critical path. The provider origin is an exact approved allowlist entry; it is not supplied by a webpage or returned tool call. Request only that model origin's optional host permission from a user gesture. The package cannot finalize this origin until the user chooses the connection.

An external provider key is not concealed from the machine's owner or extension DevTools, and session storage is not an encrypted vault. For public distribution, replace this adapter with an authenticated hosted proxy; never embed a developer key or Manus session credential. Extension cross-origin requests require host permissions, and content scripts must not be given an arbitrary-URL fetch service [6].

### Session store — recovery without a history product

`core/store.js` persists schema-versioned run state and the local model configuration. Restrict session/local storage to trusted extension contexts. Keep page snapshots and user text only in the current run; cap serialized run data at 128 KB. Clear run content when the user clears the session or starts a new run. Keys and checkpoints clear on extension reload/update/disable or browser restart [4]. Non-sensitive display settings alone may use `storage.local`.

## 5. Contracts and state transitions

The implementation uses JavaScript with JSDoc; these are contract sketches, not a TypeScript/bundler requirement.

```text
PageSnapshot = {
  tabId, documentNonce, snapshotId, url, title,
  text, truncated, targets: TargetMetadata[]
}
TargetMetadata = {
  targetId, role, label, tag, inputType?, href?, formKind?,
  fingerprint, actionable
}
Action =
  observe |
  scroll { direction?, pixels?, targetId?, expected } |
  click { targetId, expected } |
  fill { targetId, value, expected }
Expected =
  urlIs { url } |
  textAppears { text } |
  targetInViewport { targetId } |
  valueIs { targetId, value } |
  scrollChanged { direction }
Proposal =
  plan { steps: string[] } |
  act { action, briefReason } |
  ask { question } |
  finish { summary, evidenceRefs: string[] }
Approval = {
  runId, stepIndex, actionDigest, documentNonce,
  snapshotId, approved: true
}
ActionResult = {
  actionId, status: verified | failed | unknown | blocked,
  evidence: string[], nextSnapshot?
}
RunState = {
  schemaVersion: 1, runId, tabId, origin, phase,
  stepIndex, activeElapsedMs, generation,
  plan, pendingAction?, approval?, log, result?
}
```

`actionDigest` is SHA-256 over a canonical encoding of the run/step/document/snapshot, target fingerprint, arguments, and expected result. It is a binding against accidental stale approvals, not a claim that untrusted page data is cryptographically authentic. The worker obtains page identity and target metadata from the bridge; the model cannot choose a different tab or document.

Expectations are local data checks, never executable code. Click supports a changed URL matching `urlIs` or previously absent text becoming visible via `textAppears`; an already-true condition cannot verify a no-op click. Fill supports only `valueIs` matching its own target/value, checked locally. Scroll supports viewport/scroll movement checks. Each verified result gets an action ID, which `finish.evidenceRefs` must reference; unknown or invented references cannot verify completion. Control-state click verification is deferred rather than adding an arbitrary assertion language.

```text
IDLE -> PLANNING -> READY -> RUNNING
RUNNING -> AWAITING_APPROVAL -> RUNNING
RUNNING -> PAUSED -> RUNNING after fresh observation
RUNNING -> SUCCEEDED | PARTIAL | NEEDS_USER | FAILED
any nonterminal state -> CANCELLED
worker recovery of pending dispatch -> INTERRUPTED
```

Model `ask` produces NEEDS_USER; answering starts a fresh run in the MVP. Rich in-run conversation comes later. Bad/corrupt/unknown-version state fails closed and offers Clear session rather than attempting migration during this sprint.

## 6. Permissions and security boundaries

Required extension permissions: `sidePanel`, `activeTab`, `scripting`, and `storage`. There is no `tabs`, `debugger`, `cookies`, `history`, `webRequest`, or `unlimitedStorage` permission, and no page-wide persistent content-script registration. The Tabs API is usable for scoped metadata/events without asking for broad `tabs` access; `activeTab` grants the authorized page's sensitive metadata [2] [7].

Only the selected HTTPS model origin goes in optional host permissions. That permission is distinct from webpage automation access. Do not request `<all_urls>` or blanket HTTPS access to make a configurable endpoint easier.

Use local packaged scripts under Manifest V3's CSP; no remote code, eval, HTML execution, external message entry point, or page-provided endpoint. Validate runtime sender context and bridge tab/frame identity. Page snapshots are data in a separate model message, never system instructions. Local policy runs on every action even when a prompt claims the user already approved it. Prompt isolation reduces exposure; it cannot by itself guarantee resistance to prompt injection.

## 7. Alternatives and why this one fits

**Native activeTab/content-script extension — recommended.** Chrome's documented activeTab example demonstrates deliberate scoped injection [2]. It fits the user's existing browser session, avoids a separate browser/driver installation, and supports ordinary DOM workflows. Its trade-off is synthetic events and limited browser-native UI support.

**Debugger/CDP-backed extension — defer.** Chrome's debugger API provides protocol access to input, DOM, and network features, but introduces the separate `debugger` permission, attachment/session lifecycle, and potential DevTools detachment [8]. This is a sensible later executor adapter, not a 20-minute dependency.

**External Playwright agent — reject for this deliverable.** Playwright's documented actionability checks are a useful benchmark: unique, visible, stable, enabled, and receiving events before clicks [9]. Borrow a small subset of that discipline, but do not claim Playwright-grade reliability. An external controller adds a runtime/browser connection and does not by itself deliver a native Chrome Side Panel in the user's browser.

## 8. Acceptance and the 20-minute limit

The primary real-page demo is a public documentation workflow: “Find the activeTab documentation from the Chrome extension docs, open it, and scroll to the permissions explanation.” The agent must use live model decisions and carry out at least three consecutive tool actions including an approved click and a scroll. Choose and validate the exact starting URL before the build demo; public-site markup can change. A browser-only read fixture is not sufficient.

A second capability check fills a user-approved benign search field and verifies the exact resulting value without pressing Enter or submitting. Use a public search page when reachable; deterministic fixtures cover field logic regardless of external page availability. Also demonstrate cancellation and a blocked sensitive/submit target.

Completion requires an installable package, these live checks, and passing contract/policy tests. Reserve the final five development minutes for fresh verification and packaging. One implementer owns the dependent code; a fresh reviewer independently checks it. Do not divide the tightly coupled engine/policy/bridge among many concurrent writers.

Twenty minutes is a **time box, not a tested guarantee**. This is a narrowly supported interview MVP, not production-grade automation. If model access, loading, public-page interaction, or independent verification is blocked, return the package and the exact unmet must-have; do not market an offline fixture or an unverified build as completion. Future features can reuse the architecture without expanding this sprint.

## 9. Future extension points

New tools implement a registry entry containing input validation, risk policy, executor, and result verification. A screenshot/vision or CDP executor must return the same ActionResult and go through the same approval policy. A tab manager adds an explicit authorized-tab set, never implicit access to all tabs.

New providers implement only `propose`; they do not acquire browser permissions. A hosted proxy changes authentication, retention, and the provider origin, not the DOM bridge. Persistent history needs an opt-in retention design and schema migrations before writing page content to durable storage. These are small seams to preserve, not additional subsystems to build today.

[Primary-source notes](evidence/chrome-api-notes.md) retain the repository baseline and API findings. No product code, model request, browser action, Git commit, merge, deployment, or board update has been performed during planning.

## References

[1]: https://developer.chrome.com/docs/extensions/reference/api/sidePanel "Chrome Side Panel API"
[2]: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab "Chrome activeTab permission"
[3]: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle "Chrome extension service worker lifecycle"
[4]: https://developer.chrome.com/docs/extensions/reference/api/storage "Chrome extension storage API"
[5]: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts "Chrome content scripts and isolated worlds"
[6]: https://developer.chrome.com/docs/extensions/develop/concepts/network-requests "Chrome extension cross-origin network requests"
[7]: https://developer.chrome.com/docs/extensions/reference/api/tabs "Chrome Tabs API permissions"
[8]: https://developer.chrome.com/docs/extensions/reference/api/debugger "Chrome debugger API"
[9]: https://playwright.dev/docs/actionability "Playwright actionability and auto-waiting"
