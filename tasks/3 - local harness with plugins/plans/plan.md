---
task_id: 3
status: draft
updated: 2026-10-24
---

# Local harness with plugins Implementation Plan

**Spec:** [Architecture](../architecture/architecture.md)

**Goal:** Discover plugins without executing them, invoke a selected trusted plugin through a versioned contract, and bound/cancel its task-owned execution and outputs.

**Architecture:** Schema-validated catalog → explicit policy grant → fresh supervised process → JSONL messages → run-scoped result/artifacts and cleanup status.

**Proposed tech stack:** Python supervisor/subprocess [2], JSON Schema validator [1], JSONL and platform-specific process-tree management. Windows Job Objects are a candidate [3]; runtime, validator and test commands must be discovered.

> For implementation workers: retain unchecked boxes and use actual repository commands/current Manus workflow tools. Separate owner, implementer and fresh `om-verifier`. No plugin execution, installation, push or deployment is authorized by drafting this plan.

## Global constraints

Only the title is confirmed. Discovery never imports/launches plugin code. Unknown versions/capabilities default to refused. Subprocesses and capability declarations are not a sandbox. The initial profile is trusted plugins only unless an actual isolation boundary is selected and validated [4]. Bound logs/artifacts, minimize environment inheritance, and clean up only task-owned processes.

## Review focus

1. Discovery executes code → `DiscoveryNoExecCheck` in M2.
2. Malformed/unsupported manifests → `ManifestNegativeTest`, `SchemaPositiveTest` in M2.
3. Protocol deadlock/output flood/path escape → `ProtocolNegativeTest`, `ArtifactContainmentTest` in M3.
4. Cancellation leaks descendants → `TreeCleanupCheck` in M3/M4.
5. Capability grants masquerade as sandboxing → `TrustBoundaryReview` in M1/M4.

## Milestones

### M1 — Discover the repository and decide trust

**Artifacts:** task-local `decisions.md`, `evidence/repository-inventory.md`, command inventory and contract record.

**Consumes:** title-only architecture. **Produces:** approved trust/runtime/OS profile, observed commands, resource budgets and policy boundaries.

- [ ] Obtain the detailed brief and inspect the actual repository/runtime/test conventions; do not invent package scripts.
- [ ] Approve manifest/protocol versions, timeout/output/artifact budgets, retention and environment policy.
- [ ] Perform `TrustBoundaryReview`: explicitly classify allowed plugins. If hostile code is required, stop for a real sandbox design rather than claiming subprocess containment.

### M2 — Manifest validation and read-only discovery

**Proposed files:** `src/harness/manifest.py`, `src/harness/discovery.py`, `schemas/plugin-manifest.schema.json`, corresponding tests.

**Consumes:** manifest files. **Produces:** validated catalog entries or stable errors with no plugin launch.

- [ ] Write failing fixtures for malformed schema, unsupported versions, absent entry point, unknown capabilities and a plugin instrumented to detect accidental execution.
- [ ] Implement validation and read-only catalog discovery [1], using the approved schema and path rules.
- [ ] Run `ManifestNegativeTest`, `SchemaPositiveTest` and `DiscoveryNoExecCheck`. A valid manifest enters the catalog; the instrumented entry point remains unexecuted.

### M3 — Fresh process, protocol and artifact boundaries

**Proposed files:** `src/harness/supervisor.py`, `src/harness/protocol.py`, `src/harness/run_store.py`, `tests/fixtures/plugins/`.

**Consumes:** `RunRequest { runId, pluginId, input, limits, grants }`. **Produces:** handshake/progress/result/error events and `RunResult { status, result, exitCode, artifacts, cleanupStatus }`.

- [ ] Write failing tests for wrong handshake/version, malformed JSONL, no terminal result, timeout, output overflow, abnormal exit, escaping/reparse-point artifacts and leaked descendants.
- [ ] Implement one owned process with explicit pipes/environment, bounded diagnostics/artifacts, private run path, cancellation and the approved process-family adapter [2] [3].
- [ ] Run `ProtocolNegativeTest`, `ArtifactContainmentTest` and `TreeCleanupCheck`. Report cleanup failure independently from an accepted cancellation request; do not kill unrelated processes.

### M4 — Interoperability, independent verification and demo

**Artifacts:** task-local `how-to-try.md`, trust-policy record, `evidence/` fixtures/results and `verification/<run-id>/verify-report.md`.

- [ ] Add valid-result, declared-error and noisy/cancelled fixtures, ideally with two independent sample plugins using the same contract.
- [ ] Freeze the change-defining catalog→run→result behavior and a failing baseline observation. Keep malformed/trust/cleanup cases as explicit regression guards.
- [ ] Have a fresh verifier rerun the approved scoped checks and review trust claims, path containment, environment and output limits.
- [ ] Demo discovery without execution, a valid run, an invalid manifest, a noisy run and cancellation with observed descendant cleanup. Do not imply hostile native-code isolation.

## Acceptance and handoff

Valid independent fixtures obey the same manifest/JSONL contract and produce inspectable bounded artifacts. Invalid manifests are rejected before launch. Timeout/flood/cancel does not leave owned descendants or unbounded outputs. Resolved artifacts cannot escape the approved run root. The stated trust model matches the actual enforcement; capability declarations are not marketed as a security guarantee.

Handoff includes approved schema/protocol, exact command/build provenance, fixtures, trust/retention decisions, independent verdict and unsupported-platform limitations. Every check remains pending; no plugin or test ran in this documentation pass.

Sources consulted 2026-10-24.

## References

[1]: https://json-schema.org/specification "JSON Schema Specification"
[2]: https://docs.python.org/3/library/subprocess.html "Python subprocess documentation"
[3]: https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects "Windows Job Objects documentation"
[4]: https://docs.docker.com/engine/security/ "Docker Engine security"
