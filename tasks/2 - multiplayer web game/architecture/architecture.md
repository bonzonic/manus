---
task_id: 2
status: draft
updated: 2026-10-24
---

# Multiplayer web game — Architecture

[Implementation plan](../plans/plan.md)

## Brief and proposed scope

Only the title is confirmed; the existing local task file is empty. Genre, player count, framework and hosting requirements have not been supplied.

The proposed interview-sized MVP is **Treasure Sprint**, a two-player room-based browser game. A proposed round lasts 60 seconds; the first player to five treasures wins, otherwise the higher score at timeout wins. Equal scores produce a draw. A disconnected player has a proposed 15-second reattachment window. These are reviewable defaults, not official requirements.

Room creation/join, movement, server-confirmed collection, results, disconnect and reconnect are in scope. Accounts, public matchmaking, persistent rankings, chat, payments, spectators and production operation are not.

## Components and data flow

```text
Browser input → Authenticated room connection → Authoritative simulation
      ↑                                                  ↓
Client render ← Versioned snapshots / events ← Room lifecycle + reconnect state
```

**Client** consumes `RoomSnapshot`, `TickState`, `CollectEvent`, `RoundResult` and connection status. It produces `JoinRequest`, `InputCommand { sequence, direction }` and `ReconnectRequest`. It may render interpolation, but never dictates score, collision or victory.

**Join/session boundary** consumes a room intent, origin and rate-limit context. It produces a short-lived room credential and connection parameters or a generic refusal. Credentials must not appear in diagnostic logs.

**Authoritative room service** consumes validated, sequenced commands. It owns positions, collision, treasure placement/collection, timing and result arbitration. It emits snapshots and events with room/round identity. A versioned JSON envelope over WebSocket is a proposed transport; WebSocket supports bidirectional communication [1] [2]. Tick and snapshot cadence remain decisions to benchmark.

**Reconnect state** consumes owned room/session state and disconnect time. It produces either an idempotent reattachment or an expiry refusal. A reconnect is not a second player slot. Client close events inform connection UI, but the server remains responsible for outcome and expiry [3]. During a player's grace window, input from that player is stopped; the final treatment of the ongoing round must be fixed in the approved rules.

## Choice and infrastructure gate

Server authority is chosen over client-authoritative scoring because the result needs a single arbiter. A peer-only design is not selected for this slice. Bounded room state is preferred over a persistent account backend.

Future implementation must initialize a **Manus-managed Game project** and inspect its current engine and online blueprint. No standalone HTML game is the default. Engine choice and persistent realtime-service hosting are separate decisions; the availability of a managed website does not establish support for a long-lived game server. If the required realtime route is unavailable, stop at that capability gate rather than mislabel a single-player prototype as multiplayer.

## Security and failure behavior

Check expected origins and authenticated room membership, validate every message, reject stale/out-of-room commands, limit message size and rate, bound room capacity, and expire abandoned state. These are material WebSocket security controls [4]. Transport encryption and origin checks are not substitutes for room authorization.

A wrong credential, malformed payload, duplicate reconnect or flood receives a bounded refusal. Server loss displays an interrupted state rather than an invented win. Shutdown and expiry must release task-owned connections and state without affecting other rooms.

## Decisions before implementation

Obtain the detailed task brief and approve genre, rules, grace-window behavior, credential model, message schema and capacity limits. Confirm the actual Game project route, selected engine, supported realtime host and test commands. No code, running service or verification PASS exists.

Sources consulted 2026-10-24.

## References

[1]: https://www.rfc-editor.org/rfc/rfc6455 "RFC 6455: The WebSocket Protocol"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket "MDN WebSocket API"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event "MDN WebSocket close event"
[4]: https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html "OWASP WebSocket Security Cheat Sheet"
