# Multiplayer Snake MVP Implementation Plan

> **For implementation workers:** Use checkbox syntax for tracking. Implement only after the parent resolves the route/capability gate and provides a writable task-owned implementation worktree. Do not infer a managed Game project, hosting provider, or deployment authorization from this plan.

**Goal:** Deliver a genuinely networked two-player browser Snake match with guest room sharing, authoritative grid simulation, apples, mushroom speed boosts, complete lifecycle, results, and rematch.

**Architecture:** A versioned JSON/WSS boundary connects two browser clients to one authoritative room server. Pure Snake rules own grid bodies, movement credit, food, boost, collision, and outcome; room lifecycle owns seats, phases, pause/resume, expiry, and rematch; the client renders accepted snapshots and bounded presentation-only intent. The finite arena is an interface so a later unlimited-space mode can replace bounds without replacing networking.

**Tech Stack:** Route A (only with selected Cloud Computer): Manus-managed Game, Godot Web 2D client, standalonyes te Node.js + `ws` server. Route B (only if explicitly approved as a source-code deliverable): host-independent browser client plus Node.js + `ws` server in the future `project` directory. Exact versions and commands must be discovered from the initialized/approved project; no dependency or package-manager command is invented here.

**Spec:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\architecture.md`; original brief `tasks.txt:2-11`; preserved history `architecture\architecture.md` and `plans\plan.md`.

## Global Constraints

- Exactly two active seats; guests join through an eight-character code or shared link; no account/database requirement.
- Four-direction, 90-degree grid turns; no immediate reversal; at most two accepted future turns per seat.
- 40×24 finite board; five-cell mirrored spawn; six cells/second base; nine cells/second boosted.
- Four apples and two mushrooms where legal empty cells permit; apple growth is exactly one segment and one apple point.
- Mushroom speed is 1.5× for four active seconds; a second pickup refreshes but does not stack; pause freezes duration.
- Server owns turns, speed, bodies, pickups, collision, timers, outcomes, room phase, credentials, and reconnect epochs.
- Authoritative simulation is 60 Hz with integer movement credit; movement due in one tick is resolved from one pre-step state for both snakes.
- Collision is atomic: start-of-step occupied tails block; head-on/head-swap kill both; body owner is not killed by being hit; terminal collision skips pickups.
- Results: last survivor wins; simultaneous death draws; at 120 active seconds longer surviving length wins, equal length draws; `BOARD_FULL` ends a full board.
- Disconnect freezes both snakes, uses 15 cumulative seconds and at most two interruption episodes per seat, then forfeits to a connected opponent or abandons if both absent.
- Messages and snapshots are versioned, size/rate bounded, origin/member checked, stale round/epoch rejected, and credential-free in links/query strings/logs.
- Free shared-link hosting is required for any public delivery; public deployment, purchases, accounts, database, and hosting-provider choice require separate authorization.
- The implementer must not run the full suite, push, merge, deploy, or edit files outside the approved candidate boundary. If the plan cannot be implemented as written, write `BLOCKED.md` and stop.

## Review Focus

1. Mixed-speed, same-tick ordering and stationary-head collisions must resolve from one pre-step state; own it in the rules/fixture task.
2. Accepted input versus applied input, reconnect epochs, and round identities must prevent stale/retried commands from mutating a new round; own it in protocol/room tests.
3. Pause must freeze active time and boost time while both bodies/food remain unchanged; own it in lifecycle tests.
4. Maximum body/snapshot and queue limits must remain bounded under food-rich play and slow peers; own it in transport/security tests.
5. Browser evidence must prove two independent sessions over the real HTTPS/WSS route with 100–200 ms RTT/jitter; own it in the independent verifier packet, never a local rendering demo.

---

## 1. Problem statement

Today the task repository has no initialized game or product surface. The generic brief cannot be satisfied by a local Snake mock: two people need one shared room, one agreed live state, deterministic finish, and another round. The user has selected classic grid Snake, apple growth, and mushroom speed, but the older Treasure Sprint drafts do not define those rules. This plan freezes the smallest complete networked Snake slice without deciding an unapproved managed-versus-source-code delivery format.

The baseline is therefore a documentation/repository state with no runnable product: S1–S10 are not implemented or runnable, not passing. That is a baseline gap, not a newly invented defect and not evidence of product verification.

## 2. Architecture changes

Create the following boundaries inside the approved future project directory; exact paths may follow the initialized starter only after route selection, but responsibilities and interfaces are fixed:

- `shared/protocol.json`: version, room/round identity, phase/revision, server tick, board, ordered bodies, direction/queue, movement credit, lengths/apple counts, boost expiry, food IDs/cells, accepted/applied input sequences, and outcome. Client messages are `hello`, `turn`, `ready`, `rematch`, `leave`; server messages are `welcome`, `inputAck`, `snapshot`, `effect`, `result`, `error`.
- `server/game/`: pure `createRound(config, randomSource)`, `acceptTurn(state, seat, command)`, `step(state, tick)`, `resolveOutcome(state)`; no sockets/rendering; deterministic fixtures use seeded randomness only.
- `server/arena/`: finite `contains(cell)`, occupancy, bounded legal food selection, board-full detection; preserve an arena-policy seam for later unbounded mode.
- `server/rooms/`: guest admission, exactly two seats, readiness/countdown, pause/resume, leave/expiry, reconnect credential/epoch, rematch, and result retention.
- `server/authoritative_server.*` and validation: WSS admission, trusted Origins, 256-bit tab-scoped credentials, message size/rate limits, slow-peer handling, stale sequence/round/epoch rejection, and no credential logging.
- `client/`: lobby/link/code, countdown, controls, confirmed snapshots, input acknowledgements, capped 150 ms presentation-only turn intent, reconciliation, HUD, boost timer, network/error/result/rematch views. Client must never award growth/boost/death/victory.
- `shared/fixtures/` and `test/`: language-neutral golden fixtures plus deterministic room/protocol/browser integration cases.

No migration, account store, Redis, physics engine, or second game mode is needed. Host/provider configuration is route-specific and must not be fabricated before the capability gate.

## 3. User flow

1. From a cold browser, a guest chooses Create Room, receives a short code and shareable link, and sees an empty lobby with rules and connection status.
2. A second independent browser opens the link or enters the code. Invalid, full, expired, malformed, or server-unavailable rooms show bounded actionable errors; a third guest cannot claim a seat.
3. Both labels/seats and connection/ready state appear. Each presses Ready; readiness is idempotent. A single Ready never starts play. When both are ready, the server sends one three-second countdown.
4. Both clients enter the same 40×24 board. WASD/arrows submit sequenced turns; movement is automatic on the server grid. The UI shows each label/color, bodies, length/apple points, food, server/network status, and boost remaining time.
5. Eating an apple grows exactly one segment. Eating a mushroom raises speed for four active seconds, refreshes on a second pickup, and does not stack. A disconnect freezes both snakes and shows paused/resume state; refresh may resume only the same seat credential within grace.
6. A wall/body/head-on/head-swap collision or timeout produces one authoritative result with reason, winner/draw, lengths, and scores. No client-only death or fabricated server-loss winner is shown.
7. Results offer Play Again. Only after both opt in does a new round identity, fresh positions/food, and countdown appear. A leave/expiry returns remaining seats to the lobby without rewriting the finalized result.
8. Narrow viewport, offline transition, lost credential, stale tab, slow peer, malformed traffic, and server restart show explicit interrupted/error states. No optional mobile/touch mode is implied.

## 4. Solution chosen

Choose one authoritative fixed-step room server with pure deterministic Snake rules and confirmed snapshots. At 60 Hz, add each snake’s current rate to integer movement credit; when credit reaches 60, schedule at most one move and consume at most one queued turn. Build both proposed heads from the same pre-step state, resolve every collision together, then commit legal moves, resolve food once, update boost expiry, replenish from bounded legal cells, and check board-full/timeout. Collision outcomes have priority over timeout and terminal collision skips pickups.

Clients send only bounded direction commands with increasing sequence, round ID, and connection epoch. Snapshots carry both last-accepted and last-applied sequence plus the accepted future queue. Presentation may show local turn intent for at most 150 ms, but reconciliation starts from the exact snapshot and replays only newer unacknowledged commands; it cannot invent food, growth, death, victory, or opponent rollback.

Rejected alternatives:

- Peer-to-peer/client-authoritative state: rejected because two clients can disagree on collision/food and can forge result or score; the brief requires one agreed authoritative match.
- Smooth Slither-style steering: rejected because the user selected classic grid turns and it would replace occupancy, collision, input, and prediction rules.
- Unlimited-space first: rejected because chunks, camera, interest management, and bounded resource policy would delay the complete finite game; retain the arena seam instead.
- Offline/web initialization to bypass managed Game setup: rejected because it would misrepresent the selected route and produce an unapproved uninitialized product. Use it only if the parent explicitly changes the deliverable to a source-code project and records that decision.

## 5. Acceptance criteria

Each item is binary and must be demonstrated on the candidate; the current documentation baseline has no product, so none is treated as passing now.

- **S1 — Guest room/invitation:** Two independent browsers create/join one room through a code or shared link without accounts; invalid, full, and expired rooms fail clearly; exactly two active seats exist.
- **S2 — Shared lobby/start:** Both player labels, connection/ready state, and rules are visible; both Ready are required; one three-second server countdown is observed; one player cannot start alone.
- **S3 — Real multiplayer Snake:** Both clients render the same finite board and accepted bodies/actions; WASD/arrows turn automatically on four-direction grid cells; exact reversals are rejected; no client-owned movement result can win.
- **S4 — Apple growth:** A controlled server fixture and browser case consume one apple once, add exactly one segment and one apple point, agree on both clients, and replenish only to a legal empty cell after the step.
- **S5 — Mushroom boost:** A controlled case shows 1.5× base speed for four active seconds, visible `BOOST`/remaining duration, no length increase, no stack, refresh on a second pickup, and frozen duration during pause.
- **S6 — Finish/rematch:** Wall/body/head-on/head-swap, simultaneous death, timeout length tiebreak, equal draw, and `BOARD_FULL` resolve deterministically with reason/winner/lengths; play freezes; both opt into a new round before countdown.
- **S7 — Authoritative responsive networking:** Server owns turns, speed, bodies, food, collision, timer, and outcome; malformed/oversized/flooded/stale/wrong-round/wrong-epoch commands do not mutate state; input acknowledgements and snapshot reconciliation preserve bounded responsive steering under 100–200 ms RTT/jitter; snapshots stay ≤32 KiB and queues/output remain bounded.
- **S8 — Lifecycle:** Refresh reattaches only the same seat within 15 cumulative disconnected seconds and two interruption episodes; old socket loses control; play pauses/resumes with a three-second countdown; leave, mid-game join, expiry, both-absent abandonment, server loss, and result-seat expiry follow the frozen lifecycle with no fake opponent/result.
- **S9 — Feedback/safety:** Distinct labels/colors/head markings, food shapes, length/score HUD, countdown, boost timer, death reason, network status, trusted Origin validation, tab-scoped credentials not in links/logs, room expiry, and bounded traffic are visible/tested; no sound/art polish is required.
- **S10 — Independent browser demonstration:** A fresh verifier uses two independent browsers over the actual HTTPS/WSS delivery route, repeats S1–S9 including collision and boost cases under simulated 100–200 ms RTT/jitter, and records candidate commit/build identity. Local fixtures or a single-browser rendering demo are insufficient.

### Testable protocol/state-machine fixtures

At minimum, implementers must provide deterministic fixtures for: two queued legal turns and illegal reversal; same-cell food contention; exact apple growth; mushroom pickup/refresh/expiry/pause; mixed-speed due moves; stationary-head body collision; head-on and head swap; start-of-step tail occupancy; simultaneous death; timeout and board full; stale sequence/epoch/round; duplicate ready/rematch; reconnect idempotency/expiry; old-socket control loss; malformed/oversized/flooded traffic; snapshot-size/output-queue bounds. Test names and command syntax must be discovered from the approved project and recorded before implementation.

## 6. Risk

- **Capability/format risk:** Managed Game requires a selected Cloud Computer; source-code delivery is a different approved format. Parent must choose before init.
- **Hosting risk:** “Free shared-link hosting” must be proven by the eventual route/provider and bounded lifecycle; do not claim it from a local server or a static website.
- **Rule drift:** Mixed speeds and occupied tails create ordering ambiguity; golden fixtures and one authoritative step order are mandatory.
- **Network fairness:** Localhost cannot prove responsiveness; use two browsers, real HTTPS/WSS, deterministic latency injection, bounded prediction, and reconciliation evidence.
- **Lifecycle/security:** Reconnect credentials, stale sockets, room expiry, Origin checks, and queue limits are material; server loss must remain interrupted rather than inventing a result.
- **Scope pressure:** No unlimited-space, extra players, accounts, or polish may displace S1–S10. A verifier failure needing code consumes at most one implementer retry; a second code failure is terminal.

## Implementation slices

- **Gate 0 — route/setup provenance:** Parent resolves managed Game versus explicit source-code delivery, obtains coordinator admission, creates distinct worktrees, discovers toolchain/test/build commands, and records the new project baseline. This is a prerequisite, not product implementation.
- **Slice 1 — pure rules/protocol:** TDD shared protocol, arena, deterministic Snake rules, fixtures, and validation. Useful independently as a server-authority contract; no browser claim.
- **Slice 2 — room/lifecycle server:** Add two-seat rooms, guest links/codes, ready/countdown, pause/resume/reconnect/leave/expiry/rematch, and bounded WSS transport around Slice 1. Useful as a networked authoritative room with test clients.
- **Slice 3 — browser client:** Add lobby, board, renderer, controls, HUD, acknowledged input/reconciliation, errors, results, and rematch against Slice 2. This is the minimum useful complete slice: one finite room, two guests, full play/result/rematch with apples and mushrooms.
- **Slice 4 — candidate hardening and independent verification:** Run discovered scoped checks, two-browser latency/collision/boost demonstration, evidence capture, and bounded resource/security checks. No public delivery without separate authorization.

Self-review: every S1–S10 item maps to Slices 1–4; the only unresolved choice is delivery format/host setup, explicitly isolated in Gate 0. No source code, dependency, test, build, browser, or deployment command was run during this owner stage.
