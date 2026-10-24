---
title: Multiplayer Snake — architecture and feature scope
status: grid-confirmed-awaiting-plan-approval
author: Manus AI
created: 2026-10-24
supersedes: Treasure Sprint proposal
---

# Multiplayer Snake — architecture and feature scope

Build **two-player competitive Snake in one shared browser arena**. Apples add length; mushrooms temporarily increase speed. Both players join quickly, start together, see the same live match, finish with one agreed result and rematch. Unlimited-space mode belongs in the nice-to-have backlog, but the arena interface must allow it later without replacing the networking layer.

The user has selected Snake, apples for growth, mushrooms for speed and unlimited space as a later mode. **Classic grid-based multiplayer Snake is confirmed by the user on 2026-10-24 at 15:52.** This settles four-direction, 90-degree grid steering; it is not approval of every numerical/rule default or authorization to implement. All other numerical/rule defaults below are proposals for approval. No implementation begins from this document alone. [Short decision brief](decision.md).

## 1. Must have — the complete first version

| ID  | Required feature                     | Acceptance contract                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Fast guest rooms and invitations     | Create/join without accounts, share an eight-character room code or invitation link, and handle invalid/full/expired rooms clearly. Exactly two active players in version one.                                                                                                          |
| S2  | Shared lobby and start               | Show both players, connection/ready status and the rules. Both press Ready; the server runs one three-second countdown. Neither player starts alone.                                                                                                                                    |
| S3  | Real multiplayer Snake               | Both snakes occupy the same finite arena. WASD/arrows turn the local snake; movement is automatic, four-directional and grid-based, as confirmed by the user. No immediate 180-degree reversal. Both clients see the same accepted bodies and actions.                                  |
| S4  | Apples that make you longer          | A surviving snake consuming an apple grows by one segment and gains one apple point. One apple is consumed exactly once; replenishment occurs only in a legal empty cell. Both clients agree on length and score.                                                                       |
| S5  | Mushrooms that make you faster       | A surviving snake consuming a mushroom moves at 1.5× base speed for four active-play seconds. A second mushroom refreshes the four-second duration; speed does not stack. Show boost state and remaining duration; mushroom pickup does not add length.                                 |
| S6  | Clear collision, finish and rematch  | Walls, bodies and head-on collisions follow the rules below. Last survivor wins; simultaneous death draws. At a two-minute timeout, the longer surviving snake wins, equal lengths draw. Results freeze play and show scores/reason. Both players must opt into a fresh rematch.        |
| S7  | Responsive, authoritative networking | Server owns turns, speed, bodies, pickups, collision, timer and outcome. Acknowledged inputs plus bounded local presentation prediction/reconciliation keep steering responsive. Clients never award growth, boost, death or victory. Stale/retried commands cannot mutate a new round. |
| S8  | Complete connection lifecycle        | Refresh can reattach the same seat; replaced sockets lose control. Disconnect pauses both snakes, with bounded grace and a resume countdown. Explicit leave, mid-game join, expiry and server loss have defined behaviour. No fake opponent or invented result.                         |
| S9  | Readable feedback and basic safety   | Distinct snake colours plus player labels/head markings; clear food shapes, length/score HUD, visible speed effect, countdown, death reason and network status. Validate/bound traffic, protect credentials and expire rooms. Sound and elaborate artwork are not required.             |
| S10 | Independent browser demonstration    | Two independent browsers complete S1–S9 through the actual HTTPS/WSS route, including simulated 100–200 ms RTT/jitter and collision/boost cases. Server fixtures or a local rendering demo alone are insufficient. Public delivery requires separate authorization.                     |

All approved S1–S10 must be built. A nice UI without genuine multiplayer, or apples without mushroom acceleration, is incomplete. Start with one arena, one mode, two players and no accounts/database.

## 2. Nice to have — ordered backlog

**Next gameplay:** unlimited-space arena mode; four-player rooms; alternative maps/obstacles; more power-ups; configurable round length; best-of-three matches; optional wall wrapping; and a cooperative mode. Unlimited space and wall wrapping are different modes, not two names for the same feature.

**Next usability:** touch controls/mobile layout, sound with mute, richer head/body animation, spectator view, colour themes, room passwords and a short playable tutorial.

**Later platform:** public matchmaking, accounts, leaderboards, saved match history, friends/chat, ranked seasons and region selection. **Later operations:** distributed room ownership, interest-managed large worlds, replay tools and durable recovery. None requires speculative database or Redis work in the first version.

## 3. Proposed rules and balance

### Finite arena mode

Use a **40×24-cell board**, with each snake initially five cells long. Spawn them in mirrored, safely separated locations facing inward, with at least six cells of clear forward travel. No diagonal motion. Base speed is **six cells/second**; a mushroom raises it to **nine cells/second**. The faster snake is better at reaching food but harder to steer, creating a deliberate risk/reward choice.

Maintain **four apples and two mushrooms**, distinct in shape and colour, when empty cells permit. Food never overlaps a snake or another item. An apple adds one segment by withholding the normal tail removal for that successful move; a mushroom does not. Replenish consumed food after resolving the whole simulation step. New food cannot be consumed until a later step.

A mushroom boost lasts **240 active simulation ticks at 60 Hz**. Its new speed begins on the following tick, not retroactively halfway through a resolved move. Consuming another mushroom refreshes expiry to four seconds from that pickup, never adds another multiplier or unbounded duration. Pause freezes boost time as well as the round clock. The HUD shows `BOOST` and a countdown.

### Winner and collision rules

A wall or body collision kills the moving snake. **Only the snake whose head hits a body dies**; the body owner does not die merely because it was hit. Two heads targeting the same cell in one simulation tick die together. Swapping head cells also kills both. A moving head reaching a stationary snake’s head is a body collision for the mover.

Use a deliberately conservative first-version rule: **all cells occupied at the start of the simulation step block entry, including tails that are scheduled to move away**. There is no same-step tail-following exception. This avoids ambiguous collision ordering with different speeds; it must be explained in the rules and tested, rather than accidentally varying between clients. A more permissive vacating-tail rule can be considered later.

Both deaths are resolved together, never in player-ID iteration order. If a step ends the match through collision, do not award food pickups on that terminal step. One survivor wins regardless of apple score; two deaths draw. If both survive **120 active seconds**, longer snake wins and equal length draws. This makes the finite mode a survival duel with growth as the timeout tiebreaker, not an unrelated apple-scoring contest. No respawning inside the current round.

If no empty cells remain, finish by length with a `BOARD_FULL` reason instead of entering an endless random-respawn loop. Spawn selection enumerates bounded legal cells and chooses among them; production randomness is server-owned, with a repeatable seeded source for tests only.

### Inputs

A turn queue holds at most **two accepted future directions per snake**. Check each new direction against the last queued direction, or current direction when the queue is empty. Reject exact reversals; ignore duplicates; consume at most one queued turn per movement step. Thus Right → Up → Left means two separate legal turns, not an instant reversal between steps. Reject queue overflow explicitly and acknowledge input disposition. Keyboard auto-repeat must not flood the queue.

## 4. Architecture and ownership boundaries

```text
Player A Godot Web client        Player B Godot Web client
 UI / turn input / presentation   UI / turn input / presentation
              \                 /
              versioned WSS protocol
                       |
            Node.js + ws room server
                       |
       admission / seats / validation / limits
                       |
              room lifecycle controller
                       |
       pure Snake simulation and atomic resolver
          |          |           |          |
        arena    turn/speed    food/growth   outcome
                       |
           snapshots + input acknowledgements
```

Retain the proposed **Manus-managed Game, Godot Web 2D client and standalone Node.js + ws authoritative server**. The installed multiplayer starter documents room/seat/reconnect/discovery foundations but demonstrates Pong, not Snake. Replace its game-specific rules, packets and client renderer together; do not pretend changing a title adds Snake. No runnable Game project has been initialized or inspected yet.

**Transport/admission** handles trusted endpoint discovery, guest admission/resume credentials, socket epochs, validation and heartbeat. **Room lifecycle** handles lobby, start, pause, rematch, expiry and results. **Snake rules** own bodies, movement schedules, growth, boosts and collision. **Presentation** owns camera, body interpolation, effects and UI. Simulation has no sockets or rendering calls.

Pure rule interfaces should cover `createRound(config, randomSource)`, `acceptTurn(state, seat, command)`, `step(state, tick)` and `resolveOutcome(state)`. An arena policy supplies bounds checking, cell occupancy, legal food locations and viewport information. Snake rules consume world cells, not pixels or browser dimensions.

## 5. Simulation — different speeds without ordering bias

Run the authoritative simulation at **60 Hz**. Each snake keeps integer movement credit: add its current cells/second rate every tick; when credit reaches 60, subtract 60 and schedule one cell move. This represents six/nine cells per second without floating-point drift or separate player timers. Keep fractional progress when boost starts/expires; change the rate from the next tick. Only one move can be due per snake per tick at these rates.

For each tick:

1. Advance active time and determine which snakes are due to move. Consume one queued turn only for due snakes.
2. Build every due snake’s proposed head cell from the **same pre-step state**. Non-moving bodies still occupy cells.
3. Resolve wall/body/head-on/head-swap collisions together under the declared occupancy rule. If collision ends this two-player match, finalize one result and skip pickups.
4. Otherwise commit all legal movements, resolve food at final head cells once, grow apple eaters and update mushroom expiry.
5. Rebuild bounded occupancy, replenish food from empty cells and check board-full/round-timeout conditions. Collision outcomes take priority over timeout on the same tick.

A 40×24 occupancy array keyed by `y × width + x` is sufficient initially; total live segments cannot exceed 960 legal board cells. Avoid full physics engines or distributed collision processing. Food/boost effects have unique IDs and are emitted only after accepted state changes.

## 6. Protocol, responsiveness and anti-cheat

Use **versioned JSON over WSS** with a shared protocol specification and language-neutral golden fixtures. State includes boot/room/round identity, phase/revision, server tick, rules version, board dimensions, ordered body cells per snake, direction/turn queue, movement credit, length/apple count, boost expiry, food IDs/cells, accepted input sequence and final outcome. Never include another seat’s credentials.

Client messages are `hello`, `turn`, `ready`, `rematch` and `leave`. A turn contains direction, increasing sequence, round ID and connection epoch—never a claimed head coordinate, body, score, speed or collision. Server replies include `welcome`, `inputAck`, sequenced `snapshot`, `effect`, `result` and stable `error` codes. Acknowledgements identify accepted/applied/rejected input and authoritative tick; results also remain in snapshots so a missed event does not lose the outcome.

**Do not reuse Treasure Sprint’s direction-overwrite/free-motion networking unchanged.** Snake turns are ordered commands, and collision is fatal. The installed Game guide explicitly warns that precise/collision-heavy games require acknowledged input/replay or established networking rather than an ad hoc rollback system. Our bounded approach is to retain pending local turn commands, show immediate turn intent and owned-head presentation, then reset to authoritative snapshots and replay only still-unacknowledged local turns. Server rules are canonical; client replay logic must match shared fixtures.

Each snapshot carries both `lastAcceptedSeq` and `lastAppliedSeq`, together with the accepted future-turn queue. Reconciliation starts from that exact snapshot and replays only newer local commands not already represented there. An early input acknowledgement alone must not erase the client record before a reflecting snapshot arrives; rejected commands are removed, and accepted turns already in the snapshot queue are never replayed twice. The two-command bound applies to outstanding future turn intent, not an unbounded input-history or rollback buffer.

Prediction is presentation-only, capped at **150 ms**, and stops at known occupied cells, stale state, pause, seat loss or disconnect. It must not speculate through an unknown opponent collision, grow a body, consume food or announce death. Correct the visual body to accepted state; reset immediately for death/new round/reconnect. No cross-player rollback or retroactive collision compensation in version one. If realistic-latency tests show misleading near-collision steering, revise this model before declaring S7 complete; localhost cannot prove it feels fair.

Start with **15 full snapshots/second**, plus prompt input acknowledgements and accepted effects. Bound snapshots to **32 KiB**, input messages to **4 KiB**, pending turn commands to two on each side, and retained control-request IDs to 64 per seat with expiry. Keep output queues at most 64 KiB/socket and disconnect slow peers rather than accumulating snapshots. These are proposed safety/tuning limits, not measured capacity. Verify maximum-body snapshots and bandwidth before choosing a room cap; start conservatively at ten rooms/20 active seats, with independently bounded pending sockets.

Reject stale sequences, wrong round/epoch, invalid directions, malformed/oversized input, queue floods and gameplay before admission. Replayed ready/rematch requests are idempotent and still require current phase conditions. The server issues 256-bit seat credentials; store them tab-scoped and send them only in the first WSS resume message, not invitations/query strings/logs. Validate exact allowed Origins before upgrade; a room code invites a new guest but cannot claim an existing seat. These controls follow the retained OWASP evidence. [3]

## 7. Join, disconnect, death and rematch lifecycle

`LOBBY → COUNTDOWN → PLAYING → RESULTS` is the normal path. Both choosing Play again creates a new round and countdown. Same-round recovery is `PLAYING → PAUSED → RESUMING → PLAYING`, with a three-second resume countdown and unchanged bodies/food/boost/remaining active time.

During play, each seat has **15 cumulative disconnected seconds and at most two interruption episodes per round**; retries while continuously disconnected are one episode. A third episode or expired grace forfeits to a connected opponent; if both are absent, abandon with no winner. Both snakes freeze, so the remaining player cannot farm apples while the opponent reconnects. A disconnect during resume consumes the same allowance. Server time, not a client clock, owns all deadlines.

Lobby/start-countdown disconnect cancels the countdown, clears readiness and reserves the departed seat for up to 15 seconds. Leave there releases the seat without a winner. Explicit leave during play/pause/resume forfeits to a connected opponent; otherwise abandon. New guests cannot join countdown/play/pause/resume; only the reserved seat may reconnect. No mid-round spectator or replacement bot.

A valid refresh resume revokes the old socket’s authority and increments its epoch before new input. A replaced client stops retries. Clear pending turn prediction/queues on reconnect and obtain a full authoritative snapshot; holding an old key must not cause unintended turns after resume. Lost/expired tab credentials cannot recover ownership by room code alone.

Death ends this two-player round immediately; no local-only death screen before server confirmation. Results retain cause, winner/draw and both lengths/scores. Leave or results-screen seat expiry returns the remaining player to the lobby without changing the finalized result. Empty rooms expire after two minutes; inactive lobbies/results after 20 minutes.

A server restart loses in-memory rooms. Show interrupted/retry/create-room, never a fabricated winner or hidden local match. Active round recovery and saved statistics are nice-to-haves, not promises of this ephemeral design.

## 8. Unlimited-space mode — designed for later, not built now

Interpret “unlimited space” provisionally as a **logically unbounded arena with no outer walls**, not edge wrapping and not infinite memory. Keep it as a separate mode selected in the lobby. Round duration/victory can remain bounded; endless-time play would be another product decision.

The finite arena implements `contains(cell)`, occupancy and legal food-cell selection. A future unbounded implementation replaces the dense board with **chunks and spatial hashing**, keeps world coordinates separate from pixels and generates food only in bounded active regions. Each client follows its own head with a camera. The server sends nearby relevant snakes/food using interest management while remaining the collision authority for all players.

Chunk creation, food density, distant-body collision coverage, camera behaviour, player separation and late joins need explicit limits and tests. Do not silently drop far-away body segments from authoritative collision merely because they are off-screen. Segment/player/chunk caps and finite coordinate ranges are still necessary. An infinite-looking arena cannot bypass resource limits.

This is why version one separates arena policy, Snake rules, transport and rendering. It does **not** mean implementing chunk streaming, camera tracking, spatial hashes or interest subscriptions now.

## 9. Proposed files and implementation sequence

```text
game/
  project.godot
  scenes/                       lobby, board, results
  scripts/net/                  connection, protocol, input acknowledgements
  scripts/game/                 snake renderer, bounded local replay, arena view
  scripts/ui/                   controls, scores, boost and connection status
  shared/protocol.json
  shared/fixtures/               turn/growth/boost/collision golden scenarios
  multiplayer/config.json       trusted public endpoint and build
  server/authoritative_server.mjs
  server/rooms/                 seats, lifecycle, registry, grace
  server/game/                   snake rules, speed scheduler, food, outcomes
  server/arena/                  finite board policy; later unbounded policy
  server/test/                  deterministic rules and isolated network tests
  server/package.json + lockfile
  test/                         Godot client/protocol/browser integration checks
```

These are planned modules, not existing code. Inspect the initialized starter before selecting exact file splits/commands. Retain its lockfile/export/font/managed-project conventions.

After control-style/rule approval: **first**, select the permitted host and initialize one managed Game in a task-owned implementation worktree; establish source/toolchain/baseline provenance. **Second**, complete real two-client room/start networking. **Third**, add movement/turn buffering, apples, mushrooms and atomic collision/results. **Fourth**, complete rematch, lifecycle, bounded input reconciliation and feedback. **Fifth**, run fresh independent acceptance, then separately authorized client/server delivery and public checks. No core requirement is traded for optional polish.

The feature owner freezes the contract, a separate implementation agent writes product code, and a fresh `om-verifier` checks the exact candidate. Use the coordinator for staged/multiple-slice admission. All product work and candidate verification use separate task-owned worktrees; no shared-checkout editing or self-verification. The new detached planning worktree is `.work/worktrees/snake-architecture-20261024-kEUETV`, at baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; earlier worktrees/documents remain untouched.

Verification must cover illegal reversals/two queued turns, same-tick food contention, exact growth, boost refresh/expiry/pause, mixed-speed collision, stationary head, head swaps, tail-occupancy rule, simultaneous death, timeout/board-full, stale epoch/round, reconnect, bounded maximum snapshots and two real browsers under latency. No pre-existing defect is invented for this new game. Commands and browser drivers remain to be discovered; no tests/builds have run.

## 10. Existing evidence, alternatives and open decisions

The actual brief is `tasks.txt:2-4` plus the user’s Snake message. The repository remains an instruction/document workspace: main is `0c3155d...`, with no initialized Game established. The earlier Treasure Sprint proposal is superseded as a product concept but retained as history. Existing source research remains useful for room authority/lifecycle; no claim is made that Colyseus, Nakama or the starter provides these Snake rules automatically.

Colyseus documents clients grouped in rooms around state/messages and explicit reconnect lifecycle. [1] Nakama documents authoritative gameplay validation and isolated custom match state. [2] Borrow those boundaries while keeping the managed Node/ws starter; do not add either framework unless the chosen Snake design or measured network quality justifies an integration study. [Retained comparison evidence](evidence/snake/comparison-summary.md).

| Option | Scope and implication | Recommendation |
| --- | --- | --- |
| Classic grid Snake | Four-direction ordered turns, cell occupancy, deterministic collision; bounded client replay. | Selected by the user; remaining rule defaults await approval. |
| Smooth Slither-style Snake | Continuous steering, sampled curved bodies, swept collision, different camera/control/prediction model. | Not selected; retained only as a historical alternative. |
| Unlimited-space first | Chunked world, camera/interest management and resource/rule decisions alongside core mechanics. | Defer as you requested; preserve the arena seam now. |

**Control style settled:** classic grid-based multiplayer Snake. **Remaining decision:** approve the S1–S10 scope and proposed numerical/collision/lifecycle defaults together, or identify changes before freezing the implementation contract. The control-style reply is not blanket plan or deployment approval.

The earlier capability lookup listed no available Cloud Computer. The installed managed Game multiplayer route requires one selected before init; attach an already-owned computer via the computer icon, or if needed [create a cloud computer](https://manus.im/app#settings/my-computer/create). Current documented plans start at $10/month, to recheck at setup. No purchase, device switch, host selection, project initialization or deployment is authorized/performed here. Desktop resource telemetry and the prescribed missing builder-check prompt remain unproven/blocked from the earlier pass; no heavy work or formal builder-check completion is claimed.

This is architecture-only. No code, dependencies, commits, pushes, services, board updates or publication were created. No new research agents were needed: the changed work is game-rule design, and the retained primary evidence already covers the unchanged room/security architecture. [Current provenance](evidence/snake/context.md).

## References

Primary documentation was retrieved in the earlier research pass on 2026-10-24 and reused without new product-behaviour assertions.

[1]: https://docs.colyseus.io/server/room "Colyseus official Room lifecycle and state/messages"
[2]: https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/ "Nakama official authoritative multiplayer concepts"
[3]: https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html "OWASP WebSocket authentication validation and resource limits"
