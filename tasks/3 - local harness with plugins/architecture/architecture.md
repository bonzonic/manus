---
task_id: 3
status: draft
updated: 2026-10-24
---

# Local harness with plugins — Architecture

[Implementation plan](../plans/plan.md)

## Brief and proposed scope

Only the title is confirmed. No plugin contract, language, trust model or supported operating-system matrix was provided.

The proposed slice is a local supervisor that discovers manifests without executing plugins, validates a selected plugin, launches one fresh process for an explicit invocation, exchanges structured messages, and retains bounded run artifacts. Python is a proposed supervisor runtime because its standard subprocess API supplies process and pipe primitives [2]; it is not a selected user requirement.

Remote execution, persistent plugin daemons, multi-tenant hosting, marketplace distribution and execution of arbitrary hostile native plugins are not part of this initial slice.

## Components and data flow

```text
Manifest files → Read-only discovery + validator → Catalog
Catalog entry + approved input/policy → Supervisor → Fresh plugin process
                                              ↕ JSONL protocol
                                 Private run directory + bounded artifacts
Cancel / timeout → Owned process-tree cleanup → Final RunResult
```

**Manifest/catalog** consumes files declaring `id`, `manifestVersion`, `protocolVersion`, `entryPoint` and requested capabilities. It produces validated catalog entries or stable validation errors. JSON Schema is a proposed basis for manifest/message validation [1]. Discovery must not import or launch plugin code.

**Policy layer** consumes the manifest, requested invocation and explicit grants. It produces allow/deny/approval-required decisions. Unknown capabilities default to denied. A grant is an authorization record; enforcement is a separate platform requirement.

**Supervisor** consumes `RunRequest { runId, pluginId, input, limits, grants }`. It produces lifecycle events and `RunResult { status, result, exitCode, artifacts, cleanupStatus }`. It owns a fresh child, explicit environment, private run directory, timeout and output budget.

**Plugin protocol** consumes a versioned JSONL run envelope on stdin. It produces a handshake, progress events and one terminal result/error on stdout. Diagnostic stderr is separately bounded. Protocol mismatch, malformed messages or premature exit are errors; the supervisor never waits indefinitely for an absent result.

**Artifact store** consumes declared output paths and logs. It produces run-scoped metadata only after path-containment and size checks. Symlinks/reparse points and resolved path escapes are part of the containment decision, not just string-prefix checks.

## Choice and trust boundaries

Out-of-process invocation is chosen over in-process imports to separate process lifecycle and failures. A fresh process per run is easier to cancel and attribute than a shared long-lived plugin worker. Windows Job Objects are a candidate for managing an owned process family [3]; other operating systems require their own adapter.

**A subprocess is not a security sandbox.** Neither a private run directory nor a manifest capability declaration prevents native code from reading host files or making network requests. The first MVP therefore needs an explicit trusted-plugin policy. If hostile plugins are required, select and validate an actual OS/container isolation design before enabling them; container isolation also has configuration and host-security limits [4]. Do not claim containment merely because the process is separate.

## Failure and privacy behavior

Reject invalid manifests before execution. Bound stdout/stderr, artifacts and message size; stop noisy, hung or cancelled runs and report whether descendants actually exited. Retain no inherited secrets by default, but document any intentional environment variables. Diagnostic records exclude known secret fields and avoid storing unrelated personal data. Missing sandbox capability is a named blocker, not permission to weaken policy.

## Decisions before implementation

Confirm plugin trust classes, runtime, manifest versions, grant enforcement, concrete resource budgets, retention, protocol, artifact-path policy and process-tree mechanism. Inspect the real repository before adopting proposed source paths or commands. No build, plugin execution or test has occurred.

Sources consulted 2026-10-24.

## References

[1]: https://json-schema.org/specification "JSON Schema Specification"
[2]: https://docs.python.org/3/library/subprocess.html "Python subprocess documentation"
[3]: https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects "Windows Job Objects documentation"
[4]: https://docs.docker.com/engine/security/ "Docker Engine security"
