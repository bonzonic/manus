# Snake MVP implementation handoff

## Dispatch identity

- **From:** `om-feature` owner
- **To:** one separate implementation agent, dispatched by `om-coordinator`
- **Repository:** `C:\Users\wongn\Documents\Interview\Manus`
- **Recorded baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (`main` / `origin/main`)
- **Owner docs:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\runs\2026-10-24-snake-mvp-kEUETV`
- **Required implementation worktree (create later; not currently available):** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-implementation-20261024-kEUETV`
- **Candidate worktree (separate from implementation):** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-candidate-20261024-kEUETV`
- **Verifier worktree (separate and fresh):** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-verifier-20261024-kEUETV`
- **Exact future project directory:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-implementation-20261024-kEUETV\project`

The owner worktree requested at `...\.work\worktrees\snake-mvp-owner-20261024-kEUETV` could not be registered because Git lacked permission to create `.git/worktrees/...`. Do not reuse the shared checkout or any research worktree; resolve setup permissions through the coordinator before implementation.

## Prerequisite route decision

Parent must record one of these before implementation:

- **Route A — managed Game:** selected Cloud Computer is available; initialize the approved Manus-managed Game in `project`, inspect its current Godot Web 2D/online starter, and retain its conventions. Do not initialize until the selected computer prerequisite is actually met.
- **Route B — explicit source-code deliverable:** parent/user explicitly selects a deployable source-code project instead of managed Game. Build the same browser-client/Node.js + `ws` authoritative architecture in `project`, but do not claim Manus-managed initialization, free public hosting, HTTPS/WSS availability, or deployment until separately evidenced/authorized.

Do not choose a route silently. Do not bypass Route A with offline/web init. Do not add a peer framework, database, Redis, account system, or optional mode without a new contract decision.

## Product contract

Build exactly two guest seats and one finite 40×24 grid room. Spawn five-cell mirrored snakes with six cells/second base speed. Four-direction WASD/arrows only; reject exact 180-degree reversals; accept at most two queued future turns and consume at most one per due movement. Server runs a 60 Hz integer-credit simulation; both proposed heads come from the same pre-step state. Start-of-step occupied cells, including tails that will vacate, block entry. Wall/body collisions kill the moving head; same-cell head-on and head swaps kill both; terminal collision skips food awards. Last survivor wins; simultaneous death draws; at 120 active seconds longer length wins or equal-length draws; full board uses `BOARD_FULL`.

Maintain four apples/two mushrooms where legal cells permit. Apple pickup adds one segment and one apple point exactly once. Mushroom pickup gives 1.5× speed (nine cells/second) for four active seconds, refreshes on another pickup without stacking, and does not grow the body. Pause freezes active time and boost time. Replenishment occurs after the whole step and only in legal empty cells.

Lifecycle is `LOBBY → COUNTDOWN → PLAYING → RESULTS`; both Ready are required. Disconnect freezes both snakes and enters `PAUSED`; same-seat refresh may reattach within 15 cumulative disconnected seconds and at most two interruption episodes, then `RESUMING` performs a three-second countdown. Third episode/expired grace forfeits to the connected opponent; both absent abandon. Lobby/countdown disconnect clears readiness and reserves the seat; no new guest may join a live round; explicit leave and server loss never invent a winner. Both rematch opt-ins create a fresh round identity and countdown.

Use versioned JSON over WSS. Client commands: `hello`, `turn`, `ready`, `rematch`, `leave`; server: `welcome`, `inputAck`, `snapshot`, `effect`, `result`, `error`. A turn includes direction, increasing sequence, round ID, and connection epoch only. Never accept claimed body/head/score/speed/result. Snapshots carry last accepted/applied sequence and the accepted two-command queue. Use 256-bit seat credentials tab-scoped and never in invitation/query strings/logs. Validate trusted Origins, membership, payload size, rate, round/epoch, queue and output limits; cap snapshots at 32 KiB, input at 4 KiB, output queues at 64 KiB/socket, retained control IDs at 64/seat, and disconnect slow peers.

## Implementation sequence and TDD

1. **Gate/setup:** After route decision, create the implementation worktree from the recorded baseline, inspect the approved starter/package scripts, and record exact test/lint/type/build/export commands. No install or command is implied by this packet.
2. **Rules/protocol:** Write failing deterministic tests first for protocol validation, two queued turns/reversal, movement credit, apple growth, mushroom refresh/expiry/pause, mixed-speed due moves, all collision combinations, timeout, board-full, and atomic food/collision ordering. Implement pure `createRound(config, randomSource)`, `acceptTurn(state, seat, command)`, `step(state, tick)`, and `resolveOutcome(state)` plus arena policy. Run the smallest discovered scoped command after each group.
3. **Rooms/transport:** Add validation/admission, two-seat room registry, ready/countdown, pause/resume/reconnect/leave/expiry/rematch, epochs and stale command rejection. Add failing tests for invalid/full/expired room, duplicate ready/rematch, old-socket control, refresh idempotency, grace/episode limits, both-absent abandonment, server-loss interruption, malformed/oversized/flooded input, origin/credential handling, and bounded output.
4. **Client:** Add cold-start create/join/link/code flow, lobby/status/countdown, board renderer, keyboard input, confirmed snapshots, input acknowledgements, 150 ms presentation-only intent/reconciliation, HUD, food/boost/death/network/result/rematch/error states. Client must never award growth/boost/death/victory. Add focused client/protocol fixtures before implementation.
5. **Integration hardening:** Run only discovered scoped tests for changed files and project gates permitted by the implementer role. Prepare a candidate for the fresh verifier; do not run browser verification yourself as proof and do not deploy.

## Implementer guardrails

- This is a frozen owner contract. Do not edit criteria or widen scope to resolve an implementation inconvenience.
- Product code and tests may be written only inside the later task-owned implementation worktree/project directory. Never edit the shared checkout, owner docs, or verifier records.
- Do not push, open a PR/MR, merge, deploy, purchase hosting, or start unattended watchers/services.
- Do not run the full suite; use the repository’s actual discovered scoped command. Never invent `npm`/`bun`/Godot commands before inspection.
- Stage exact paths only if commits are authorized by the coordinator; no broad staging.
- If the selected route, starter, dependency, command, or required host cannot support this contract, stop and write `BLOCKED.md` in the implementation worktree naming the exact blocker. Do not improvise a local-only substitute.
- Report changed files, scoped commands/results versus the recorded baseline, unrun checks, known exclusions, and the candidate commit/build identity. A passing implementer run is not independent verification.

## Definition of implementer handoff readiness

The implementer may start only after the parent has resolved Route A versus Route B, coordinator has admitted the stage, worktrees have been created with separate candidate/verifier boundaries, and exact project tooling is discovered. The owner has frozen S1–S10 in `plan.md`; the verifier packet is separate at `..\..\verification\2026-10-24-snake-mvp-kEUETV\verification-packet.md`.
