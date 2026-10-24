---
task_id: 2
status: draft
updated: 2026-10-24
---

# Multiplayer web game Implementation Plan

**Spec:** [Architecture](../architecture/architecture.md)

**Goal:** Build an interview-sized two-player room game only after genre/rules and the realtime-hosting capability are confirmed.

**Architecture:** Client commands → authorized room connection → server-authoritative simulation → snapshots/events → client render. Reconnect state is server-owned.

**Proposed tech stack:** Manus-managed Game project and its discovered engine/online route; an independently verified realtime service; versioned JSON over WebSocket [1] [2]. No engine, provider or repository commands are established.

> For implementation workers: use unchecked boxes and the current managed Game/workflow routes. The owner defines scope, a separate implementer writes code, and a fresh `om-verifier` measures it. This draft does not authorize scaffolding, hosting purchases, deployment or remote pushes.

## Global constraints

The title is the only confirmed brief. Treasure Sprint, two players, a 60-second round, five-treasure goal, draw on equal score and 15-second reconnect grace are proposals awaiting approval. The server owns positions, collection, timing and results. Reject client score/position assertions. No accounts, matchmaking, rankings, payments or public production service in the first slice.

## Review focus

1. Client authority/cheating → `AuthorityBoundaryTest`, `StaleInputTest` in M2.
2. Malformed/flooding traffic → `MessageValidationTest`, `RateLimitCheck` in M2/M4.
3. Wrong origin/room credential → `OriginAndAuthorizationCheck` in M2/M4.
4. Duplicate reconnect or false winner → `ReconnectIdempotencyTest`, `OutcomeResolutionTest` in M3/M4.
5. Unsupported engine/realtime host → `ManagedGameCapabilityGate` in M1.

## Milestones

### M1 — Discover the Game route and approve the rules

**Artifacts:** task-local `decisions.md`, `evidence/repository-inventory.md`, `evidence/hosting-capability.md`.

**Consumes:** title-only architecture. **Produces:** approved genre/rules, actual Game route/engine, host capability and observed commands.

- [ ] Obtain the full brief and approve or replace the proposed game/rules, including whether the round continues during reconnect grace and how a forfeit interacts with timeout.
- [ ] Inspect current Manus-managed Game initialization and online blueprint before creating a project. Confirm realtime-service hosting rather than assuming a website runtime is a game server.
- [ ] Record the chosen repository, runtime, package/test commands, leases/ports, message budgets and baseline plan. Stop if the required multiplayer host is unavailable.

### M2 — Authoritative room and versioned protocol

**Proposed files:** `src/shared/protocol.*`, `src/server/rooms.*`, `src/server/validation.*`, corresponding tests.

**Consumes:** approved rules and `JoinRequest`/`InputCommand { sequence, direction }`. **Produces:** `RoomSnapshot`, `TickState`, `CollectEvent`, `RoundResult`.

- [ ] Write failing tests for forged score/position, stale sequence, duplicate collection, room capacity, timer ties and malformed/oversized messages.
- [ ] Implement validated room membership, server-owned simulation and outcome resolution; select measured tick/snapshot cadence.
- [ ] Run the discovered tests and `AuthorityBoundaryTest`, `StaleInputTest`, `OutcomeResolutionTest`, `MessageValidationTest` and `OriginAndAuthorizationCheck`. Apply bounded traffic and credential/log handling [4].

### M3 — Playable client and reconnect

**Proposed files:** `src/client/game.*`, `src/client/session.*`, `src/client/render.*`, client/session fixtures.

**Consumes:** authoritative snapshots/events and connection status. **Produces:** bounded input and `ReconnectRequest`, not client-authoritative outcomes.

- [ ] Write failing tests for duplicate subscriptions, repeated reconnect, expired credentials/grace, disconnect before result and changed round identity.
- [ ] Implement confirmed-state rendering, close/error UI [3], short-lived reattachment and interrupted-state behavior. A reconnect must not create a second slot.
- [ ] Run `ReconnectIdempotencyTest` and the approved session fixtures. Confirm reconnect within the proposed window and refusal after expiry.

### M4 — Security, independent verification and demo

**Artifacts:** task-local `evidence/acceptance.md`, `how-to-try.md`, `verification/<run-id>/verify-report.md` and inspected screenshots.

- [ ] Add focused failing adversarial fixtures for wrong origin/room, expired token, bursts, payload overflow and token logging. Implement only controls required by the approved profile [4].
- [ ] Freeze the change-defining valid two-player flow and baseline-negative observation; retain security/malformed-input checks as regression guards.
- [ ] Have a fresh verifier run both-arm scoped checks, result arbitration, reconnect and bounded-resource cleanup on recorded builds.
- [ ] Demo two sessions joining one room, server-confirmed collection, win and draw, close/reconnect and expiry. Show that a forged client result is refused. Do not deploy or publish.

## Acceptance and handoff

Two authorized clients see consistent server-confirmed scores and one agreed result. Invalid or stale commands cannot mutate state; a draw resolves deterministically. Reattachment is idempotent within the approved grace and denied after expiry. Logs and state remain bounded and exclude tokens. The valid multiplayer flow must be demonstrated on the selected host; a single-player UI is not completion.

Handoff includes approved rules, capability evidence, exact commands/build identities, protocol, fixtures, pictures, independent verdict and known latency/hosting limits. All checks are planned, not run; title-only assumptions remain draft until review.

Sources consulted 2026-10-24.

## References

[1]: https://www.rfc-editor.org/rfc/rfc6455 "RFC 6455: The WebSocket Protocol"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket "MDN WebSocket API"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event "MDN WebSocket close event"
[4]: https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html "OWASP WebSocket Security Cheat Sheet"
