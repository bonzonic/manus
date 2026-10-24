---
task_id: 4
status: draft
updated: 2026-10-24
---

# Chrome agent extension with a Side Panel Implementation Plan

**Spec:** [Architecture](../architecture/architecture.md)

**Goal:** Produce a deliberate-user-action Side Panel with scoped context, restart-safe job state and a fail-closed approval boundary.

**Architecture:** Panel → event-driven worker → bounded context/backend adapters; storage persists validated job state, and exact approval gates any side effect.

**Proposed tech stack:** Manifest V3, native Side Panel/service-worker/storage APIs [1] [2] [4], and the repository's discovered framework and tests. Backend/model integration and permissions are not selected.

> For implementation workers: use unchecked boxes, actual repository commands and current Manus workflow tools. An owner defines scope, a separate implementer writes code and a fresh `om-verifier` checks it. No extension installation, backend connection, permission expansion, push or deployment is authorized by this draft.

## Global constraints

Title-only proposal. Start with a read-only fixture flow; a mutation needs its own approved contract. No broad all-hosts permission by default. Page/model content is untrusted data. Worker memory is not durable [2]. Persist intent/status and reconcile uncertain effects before retry. Backend credentials do not belong in page messages or unrestricted durable records.

## Review focus

1. Permission creep or automatic opening → `PermissionManifestCheck`, `PanelGestureCheck` in M2.
2. Worker restart loses/replays an action → `WorkerRestartRecoveryCheck` in M3.
3. Page/model prompt or markup injection → `ContextTrustBoundaryTest` in M3.
4. Stale/missing approval or tab change → `ApprovalDigestTest`, `NavigationScopeCheck` in M3/M4.
5. Backend/storage failure causes a side effect → `BackendUnavailableCheck`, `CorruptStateCheck` in M4.

## Milestones

### M1 — Discover and approve the first action

**Artifacts:** task-local `decisions.md`, `evidence/repository-inventory.md`, command and permission inventories.

**Consumes:** title-only architecture. **Produces:** approved read/context/action scope, observed build/test commands, browser baseline and service ownership.

- [ ] Obtain the full brief and inspect the extension repository, framework, actual scripts, fixture conventions and test-profile permissions.
- [ ] Decide the first user flow, justified API/host permissions, tab/frame scope, retention/storage area, size budgets and backend policy [3].
- [ ] Freeze contracts: `IntentRequest`, `ApprovalDecision`, `PageContext`, `JobState`, `AgentResult`. Record a baseline and stop if a required permission/service is unavailable.

### M2 — MV3 shell and deliberate panel opening

**Proposed files:** `manifest.json`, `src/panel/`, `src/extension/service-worker.*`, manifest/panel fixtures.

**Consumes:** user gesture and approved permissions. **Produces:** panel opening plus initial job-state request.

- [ ] Write failing checks for broad/unapproved access, automatic opening and missing gesture/capability handling.
- [ ] Implement the smallest MV3 panel and validated message boundary using discovered project conventions [1].
- [ ] Run `PermissionManifestCheck` and `PanelGestureCheck` in an approved test profile. Panel opening must not silently grant page-read/action access.

### M3 — Scoped context, durable jobs and exact approval

**Proposed files:** `src/context-bridge.*`, `src/state/schema.*`, `src/state/storage-adapter.*`, `src/approval-gate.*`, benign/adversarial fixtures.

**Consumes:** tab-scoped request, intent and stored state. **Produces:** bounded provenance-labeled context, validated recovery state and blocked or approved intent.

- [ ] Write failing cases for injected page instructions/markup, password extraction, memory-only recovery, duplicate side effects, changed approval digest and navigation to a new page.
- [ ] Implement safe context extraction/rendering, versioned storage [4], idempotent state transitions and exact approval checks. Never let page text authorize itself.
- [ ] Run `ContextTrustBoundaryTest`, `WorkerRestartRecoveryCheck`, `ApprovalDigestTest` and `NavigationScopeCheck`. Restart must reconcile uncertain work before any retry.

### M4 — Backend boundary, independent verification and demo

**Proposed files/artifacts:** `src/backend/adapter.*`, typed error fixtures, task-local `how-to-try.md`, `evidence/` and `verification/<run-id>/verify-report.md`.

**Consumes:** approved normalized request. **Produces:** typed result or recoverable unavailable/error; never an independent grant to execute.

- [ ] Write failing checks for unavailable/late backend, oversized result, corrupt/unknown storage state and an unapproved returned action.
- [ ] Implement the approved adapter or a clearly labeled fixture adapter if no backend is selected; a mock is not proof of live integration.
- [ ] Run `BackendUnavailableCheck` and `CorruptStateCheck`. Freeze the positive approved flow and failing baseline observation, with permission/injection/retry cases retained as regression guards.
- [ ] Have a fresh verifier inspect permissions and rerun the scoped tests/restart/navigation flow on recorded builds. Demo gesture opening, scoped context, malicious page text, restart, blocked action, exact approval and backend failure.

## Acceptance and handoff

A deliberate gesture opens the panel; context remains bounded and labeled as data. A worker restart restores valid job state without duplicating an effect. A missing/stale approval or changed page blocks the action. Backend/storage failure produces a typed safe state. No unapproved host access or executable result rendering is introduced.

Handoff includes decisions, exact commands/build identities, permission inventory, fixtures, inspected screenshots, independent verdict and unresolved backend/authentication/retention items. Checks are planned, not run; no extension or service was started.

Sources consulted 2026-10-24.

## References

[1]: https://developer.chrome.com/docs/extensions/reference/api/sidePanel "Chrome Side Panel API"
[2]: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle "Chrome extension service worker lifecycle"
[3]: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions "Declare extension permissions"
[4]: https://developer.chrome.com/docs/extensions/reference/api/storage "Chrome extension storage API"
