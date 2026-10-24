---
task_id: 5
status: draft
updated: 2026-10-24
---

# MCP server terminal controller — Architecture

[Implementation plan](../plans/plan.md)

## Brief and proposed scope

The title is the only confirmed requirement. MCP transport, tools, shell behavior and operating systems are unspecified.

The proposed Windows-first local server offers two distinct lanes: an approved direct-argv one-shot command and a task-owned interactive terminal session. It exposes typed tool inputs/results, connection-scoped session ownership, bounded output pagination, cancellation and process-family cleanup. SDK major version, runtime, transport and available ConPTY binding are decisions, not established dependencies [1] [2].

Remote execution, privilege elevation, arbitrary unapproved shell commands, universal secret detection and a production service are outside the first slice. Unix support is a future platform adapter, not an achieved capability.

## Components and data flow

```text
MCP client → Validated tool boundary → Authorization / approval policy
                                          ↓
                         Direct-argv executor | Owned session manager
                                                   ↕
                                          Windows ConPTY adapter
                                                   ↓
                          Bounded output pages + LifecycleResult
```

**Tool boundary** consumes a tool name, schema-valid arguments, connection identity and authorization context. It produces structured results/errors. Proposed tool names are `run_command`, `open_session`, `write_input`, `read_output`, `resize_session` and `close_session`; these are product proposals, not existing Manus tools.

**Direct-argv executor** consumes `CommandRequest { executable, args[], cwd, envPolicy, approval }`. It produces `CommandResult { exitCode, outputCursor, status }`. It preserves argument boundaries rather than implicitly concatenating a shell command. A permitted executable/argument profile must be approved before use.

**Session manager** consumes session operations with the owning connection and opaque session ID. It produces state changes, input acknowledgements, output cursors and `LifecycleResult { cancelled, exited, cleanupStatus }`. A different connection or stale ID is rejected.

**Platform adapter** consumes terminal dimensions, encoded input and lifecycle signals. It produces PTY output and process events. ConPTY is the proposed Windows pseudoconsole boundary [4]. Terminal output must be displayed as data, not executed as UI/control markup.

**Output/policy layer** consumes chunks, action classification and explicitly known secret fields. It produces bounded pages and allow/deny/approval-required decisions. Cursor behavior must define overflow and dropped-output status instead of silently losing data.

## Choice and safety boundaries

One-shot argv and interactive PTY are separate because quoting, interactivity, permissions and cleanup differ. A universal unrestricted shell tool would hide those differences. Interactive shell input is not made safe by a keyword denylist; a trusted interactive session needs an explicit authorization boundary, and hostile/untrusted commands must not enter it. Process isolation also does not sandbox the user's account.

Request cancellation is cooperative in MCP [3]. Accepting a cancellation request does not demonstrate process termination; independently close the owned session/process family and report the observed result. Never kill unrelated processes by name or port.

Redact known credential fields and minimize inherited environment/log retention, but explicitly disclose that arbitrary terminal output can contain secrets that a generic filter will miss. Limit the working-directory and command scope where the approved profile requires it.

## Failure behavior and decisions

Malformed tool input, wrong owner, expired approval, unsupported ConPTY binding, output overflow, disconnect and unsuccessful cleanup have typed results. Do not report `exited` solely because cancellation was acknowledged.

Before implementation, confirm the actual MCP SDK/transport, host approval mechanism, executable/argument policy, interactive-session trust model, binding/runtime, output budgets, retention and OS matrix. No server, command or terminal session was started.

Sources consulted 2026-10-24.

## References

[1]: https://ts.sdk.modelcontextprotocol.io/v2/servers/tools.html "MCP TypeScript SDK tools documentation"
[2]: https://modelcontextprotocol.io/specification/2025-06-18/server/tools "MCP server tools specification"
[3]: https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/cancellation "MCP cancellation utilities"
[4]: https://learn.microsoft.com/en-us/windows/console/creating-a-pseudoconsole-session "Creating a Windows pseudoconsole session"
