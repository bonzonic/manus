# Snake MVP owner details

## Original brief preserved

`tasks.txt:2-4` asks for a real-time browser multiplayer game in which at least two players enter the same match, see each other’s actions, and complete joining, starting, playing, finishing, and playing again. It explicitly rejects two unrelated local screens and calls out room/invitation, authoritative networking, latency/duplicate/out-of-order action handling, cheating boundaries, disconnect/reconnect, leaving, and restart behavior.

The user-confirmed product direction is classic grid-based multiplayer Snake: apples make a snake longer, mushrooms make it faster, and unlimited-space mode is a later nice-to-have. The full S1–S10 Snake contract in the current task-local `architecture.md` supersedes the older Treasure Sprint concept while preserving the older canonical `architecture/architecture.md` and `plans/plan.md` as history.

## Must-have complete slice

Two guest players use one shared browser link or eight-character room code, see a common lobby and rules, both press Ready, enter a single finite grid arena after one server countdown, steer four-direction snakes, collect apples and mushrooms, resolve authoritative movement/collision/results, reconnect or receive a bounded interrupted state, see a clear result, and both opt into a fresh rematch. Exactly two active seats; no accounts, database, matchmaking, spectator, or mid-round replacement.

## Frozen proposed defaults

- Board: 40×24 cells; mirrored five-cell spawns; at least six clear forward cells.
- Movement: four directions, no diagonal motion, base six cells/second.
- Input: at most two queued future directions per seat; reject exact reversals, ignore duplicates, acknowledge disposition.
- Food: four apples and two mushrooms where legal empty cells permit; apple adds one segment; mushroom does not add length.
- Boost: mushroom gives 1.5× speed (nine cells/second) for four active seconds; pickup refreshes expiry and never stacks; pause freezes boost time.
- Simulation: authoritative 60 Hz integer movement credit; food/collision are resolved atomically from one pre-step state.
- Collision: walls and start-of-step occupied cells block; same-cell head-on and head swaps kill both; only a head entering a body kills that mover; terminal collision skips pickup awards.
- Outcome: last survivor wins; simultaneous death draws; 120 active seconds uses longer length/equal-length draw; no respawn; full board ends with `BOARD_FULL`.
- Lifecycle: `LOBBY → COUNTDOWN → PLAYING → RESULTS`; disconnect is `PLAYING → PAUSED → RESUMING → PLAYING`; each seat has 15 cumulative disconnected seconds and at most two interruption episodes; both snakes freeze; no mid-round replacement.
- Safety: versioned JSON over WSS, server-issued 256-bit seat credentials, exact Origin allowlist, no credentials in links/logs, bounded messages/snapshots/queues, stale round/epoch rejection, slow-peer disconnect.

## Explicit exclusions

Unlimited-space/chunk streaming, edge wrapping, four-player rooms, new maps, extra power-ups, best-of-three, touch controls, sound, accounts, matchmaking, rankings, durable history, distributed room ownership, and production deployment are not in this slice. Free hosting is a delivery constraint; provider selection and public release remain separately authorized decisions.

## Route decision boundary

Preferred route, if a selected Cloud Computer becomes available: Manus-managed Game with Godot Web 2D client plus standalone Node.js + `ws` authoritative server, retaining the arena-policy seam. Alternative route, only if the parent/user explicitly selects a deployable source-code deliverable: a host-independent browser client plus Node.js + `ws` server in the same exact future `project` directory, with deployment instructions/adapter boundaries but no false claim of managed initialization or hosting. The implementation contract is otherwise identical.
