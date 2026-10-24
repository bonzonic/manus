---
task_id: 4
status: draft
updated: 2026-10-24
---

# Chrome agent extension with a Side Panel — Architecture

[Implementation plan](../plans/plan.md)

## Brief and proposed scope

Only the title is known. Page actions, backend/model service, authentication, retention, framework and release requirements are unconfirmed.

The proposed slice is a Manifest V3 extension with a deliberately user-opened Side Panel, scoped page-context extraction, a durable job-state model and an explicit approval gate. Chrome's Side Panel API and opening constraints inform that UI [1]. The extension offers a visible request/result flow; it is not an always-on autonomous browsing agent.

Broad default host access, unattended side effects, password collection, production distribution and an invented Manus product API are out of scope. Start with read-only summarization using fixtures; any real mutation requires a separately defined action contract and approval.

## Components and data flow

```text
User gesture → Side Panel → Service-worker orchestrator → Backend adapter
                   ↕                 ↕                         ↓
            Approval UI       Durable JobState             Typed result
                                     ↕
                          Scoped page-context bridge
                          Page text is UNTRUSTED DATA
```

**Panel UI** consumes job snapshots, context provenance and typed results/failures. It produces `IntentRequest { jobId, tabId, action, scope }` and `ApprovalDecision { jobId, actionDigest, approved }`. Render text safely; do not execute generated markup.

**Service worker** consumes validated panel/bridge messages and lifecycle events. It produces durable transitions, bounded context requests and approved backend requests. MV3 workers can terminate and restart, so in-memory state is not durable [2]. Use idempotent job identifiers and persist state before starting a side effect. A restarted worker must not replay a previously executed action blindly.

**Context bridge** consumes an explicit tab/frame request and scope. It produces `PageContext { provenance, text, truncated, capturedAt }`. Page content, DOM values and model output cannot grant privileges or override policy. Exclude password fields and unrelated frames from the proposed extraction boundary.

**Storage adapter** consumes versioned `JobState { id, stage, intent, approval, result }`. It produces validated recovery snapshots through the chosen extension storage area [4]. Quotas, migrations, access restrictions and retention must be decided. Storage is not assumed to be a secret vault.

**Backend adapter** consumes a normalized authorized request and produces an `AgentResult` or typed unavailable/error state. Endpoint, model, credentials, retry policy and service hosting are unresolved. Keep secrets off the page and out of untrusted messages.

## Choice and permissions

A Side Panel plus event-driven worker is chosen over a broad-permission content script and an always-running background page. It gives a persistent user-facing surface while respecting worker lifecycle.

Declare only permissions justified by the approved action/context model [3]. There is no default all-hosts permission. Distinguish opening the panel from gaining permission to read or mutate a page; both need their own applicable capability checks. Do not treat a model suggestion or page instruction as user authorization.

## Failure and privacy behavior

Denied permission, worker restart, corrupt/unknown state, missing backend, navigation to another tab/page and oversized context yield visible, typed failures. Bound context and result sizes. Revalidate the page identity and approval digest immediately before an action; stale approval must not authorize a changed intent. Do not retry a side effect after an uncertain result without reconciling whether it occurred.

## Decisions before implementation

Obtain the full brief and approve the first action, host/tab scope, target Chrome range, storage area/retention, backend ownership and authentication. Inspect the repository/toolchain and extension packaging requirements. No extension was loaded, backend contacted or product check run.

Sources consulted 2026-10-24.

## References

[1]: https://developer.chrome.com/docs/extensions/reference/api/sidePanel "Chrome Side Panel API"
[2]: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle "Chrome extension service worker lifecycle"
[3]: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions "Declare extension permissions"
[4]: https://developer.chrome.com/docs/extensions/reference/api/storage "Chrome extension storage API"
