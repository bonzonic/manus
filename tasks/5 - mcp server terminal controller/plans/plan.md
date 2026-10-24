---
task_id: 5
status: draft
updated: 2026-10-24
---

# MCP server terminal controller Implementation Plan

**Spec:** [Architecture](../architecture/architecture.md)

**Goal:** Expose approved one-shot commands and task-owned interactive terminal sessions through explicit, bounded MCP contracts.

**Architecture:** Validated tools → authorization → direct-argv executor or session manager → Windows PTY/process adapter → paged output and independent lifecycle evidence.

**Proposed tech stack:** Compatible MCP SDK, discovered runtime, Windows ConPTY binding and actual repository test runner [1] [2] [4]. TypeScript/Node, transport and SDK major version are unconfirmed proposals.

> For implementation workers: use unchecked boxes, observed repository commands and current Manus workflow tools. Separate owner, implementer and fresh `om-verifier`. This plan does not authorize arbitrary shell input, server installation, external services, pushes or deployment.

## Global constraints

Title-only scope. Direct argv is not an implicit shell string. An interactive session has a separately approved trust boundary; keyword filtering is not a complete shell security model. Sessions belong to an authenticated connection/task. Cancellation is cooperative, not proof of exit [3]. Bound output/state and report overflow. Known-field redaction is not universal secret detection.

## Review focus

1. Tool/schema or argv drift → `ToolSchemaContractTest`, `ArgvBoundaryTest` in M2.
2. Cross-connection/stale-session access → `SessionOwnershipTest` in M3.
3. Surviving descendants or false cancellation → `ProcessTreeCleanupCheck`, `CooperativeCancelTest` in M3/M5.
4. Unsafe approval bypass or secret overclaims → `PolicyNegativeTest`, `RedactionBoundaryCheck` in M4.
5. Lost/duplicated output or terminal escape interpretation → `PaginationResumeCheck`, `TerminalRenderingCheck` in M3/M5.

## Milestones

### M1 — Discover transport, platform and authorization

**Artifacts:** task-local `decisions.md`, `evidence/repository-inventory.md`, command inventory and policy/tool contracts.

**Consumes:** title-only architecture. **Produces:** approved MCP/runtime/transport, available ConPTY adapter, observed commands and command/session policy.

- [ ] Obtain the full brief and inspect the actual repository, SDK/runtime versions, package/test scripts and host integration.
- [ ] Approve executable/argument and working-directory profiles, interactive trust, environment inheritance, output budgets and retention.
- [ ] Validate ConPTY viability and define session/process ownership. Stop before execution if host approval or the platform binding is unavailable.

### M2 — Typed tools and direct-argv lane

**Proposed files:** `src/mcp/tools.*`, `src/execution/one-shot.*`, contract fixtures.

**Consumes:** `CommandRequest { executable, args[], cwd, envPolicy, approval }`. **Produces:** `CommandResult { exitCode, outputCursor, status }`.

- [ ] Write failing tests for unknown tools, malformed/extra arguments, absent approval, disallowed cwd/executable and arguments containing shell metacharacters.
- [ ] Implement validated `run_command` and explicit argv/environment handling using the selected SDK [1] [2]. These names are proposed product tools, not existing Manus APIs.
- [ ] Run `ToolSchemaContractTest`, `ArgvBoundaryTest` and the approved policy cases. Metacharacters must remain argv data, not implicit shell execution.

### M3 — Owned interactive sessions and paged output

**Proposed files:** `src/sessions/session-manager.*`, `src/platform/windows/conpty.*`, `src/output/buffer.*`, session fixtures.

**Consumes:** `open_session`, `write_input`, `read_output`, `resize_session`, `close_session` requests with connection identity. **Produces:** owned session state, acknowledgements, cursors and `LifecycleResult { cancelled, exited, cleanupStatus }`.

- [ ] Write failing tests for non-owner/stale IDs, duplicate close, output overflow, cursor gaps, unsafe terminal rendering, cancellation and leaked descendants.
- [ ] Implement the approved PTY/session lifecycle [4], bounded output buffer and explicit cleanup of the recorded process family. Never kill unrelated processes by pattern.
- [ ] Run `SessionOwnershipTest`, `PaginationResumeCheck`, `TerminalRenderingCheck`, `CooperativeCancelTest` and `ProcessTreeCleanupCheck`. Acknowledged cancellation and observed exit remain distinct results.

### M4 — Approval, environment and conservative redaction

**Proposed files:** `src/security/policy.*`, `src/output/redaction.*`, policy/error fixtures.

**Consumes:** action classification, exact authorization and known secret fields. **Produces:** allow/deny/approval-required and bounded safe diagnostics.

- [ ] Write failing checks for privilege/destructive actions without approval, stale approval, inherited secrets and claims of universal output redaction.
- [ ] Implement the approved profile and explicit interactive-session gate. Do not treat an allowlisted outer shell as authorization for arbitrary inner commands.
- [ ] Run `PolicyNegativeTest` and `RedactionBoundaryCheck`; disclose residual arbitrary-output exposure and preserve conservative error/cleanup states.

### M5 — Independent verification and demo packet

**Artifacts:** task-local `evidence/`, `how-to-try.md` and `verification/<run-id>/verify-report.md`.

- [ ] Freeze the valid direct-argv and authorized interactive flows with failing baseline observations; retain authorization, malformed-input and cleanup checks as regression guards.
- [ ] Have a fresh verifier rerun the scoped fixtures and inspect owned process/cursor evidence on recorded builds.
- [ ] Demo a safe command, owned terminal input/output, pagination, resize, cancellation/exit, cleanup, non-owner refusal and unapproved-action refusal. Use only approved synthetic fixtures.

## Acceptance and handoff

Valid argv retains argument boundaries. Only the owner can operate a live session. Output pages have defined overflow/cursor behavior; cancellation results do not invent termination. Forbidden/stale-authorized actions are refused. Cleanup touches only recorded owned processes. Known secret fields are redacted without promising arbitrary-output coverage.

Handoff includes decisions, exact commands/build provenance, tool schemas, policy, fixtures, independent report and OS/secret/transport limits. No server, shell command or product test was run by this documentation pass.

Sources consulted 2026-10-24.

## References

[1]: https://ts.sdk.modelcontextprotocol.io/v2/servers/tools.html "MCP TypeScript SDK tools documentation"
[2]: https://modelcontextprotocol.io/specification/2025-06-18/server/tools "MCP server tools specification"
[3]: https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/cancellation "MCP cancellation utilities"
[4]: https://learn.microsoft.com/en-us/windows/console/creating-a-pseudoconsole-session "Creating a Windows pseudoconsole session"
