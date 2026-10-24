# Multiplayer Snake — decision brief

**Your selected features:** multiplayer Snake, apples that increase length, mushrooms that increase speed. **Unlimited-space mode is a nice-to-have**, not part of the first build.

[Full architecture and acceptance contract](architecture.md).

## Recommended first version

Two players join a guest room in the browser, press Ready, and enter one shared finite arena. **Classic grid-based multiplayer Snake with 90-degree turns is confirmed by you.** WASD/arrows remain the proposed keyboard controls. The remaining rule defaults and full implementation contract still await approval.

**Must have:** guest create/join/invite; two-player lobby and shared countdown; real synchronized snakes; apples/growth; mushrooms/speed; server-controlled collision/results; rematch; responsive acknowledged inputs; refresh/reconnect/leave rules; clear feedback and bounded safety; and independent two-browser verification. All ten groups S1–S10 in the full document are required once approved.

**Nice to have:** unlimited-space arena, four players, new maps/obstacles/power-ups, best-of-three, optional wall wrapping, cooperative play, sound, mobile/touch, spectators, matchmaking, accounts and rankings. Unlimited space does not mean wrapping across a finite board or using unlimited memory.

## Proposed rules — not yet approved

- A 40×24 board; each snake starts five cells long and moves at six cells/second.
- Apples add one segment. Mushrooms grant **1.5× speed for four active seconds**; another refreshes duration without stacking speed. Maintain four apples and two mushrooms where empty cells permit.
- Last survivor wins; simultaneous deaths draw. At **120 active seconds**, longer snake wins, equal lengths draw. No mid-round respawn.
- Walls and occupied body cells are fatal to the moving snake. Same-cell head-on and head swaps kill both. For clear version-one ordering, even a tail that will vacate during the current step blocks entry.
- Disconnect pauses both snakes. Each seat has 15 cumulative disconnected seconds and at most two interruption episodes per round; recovery uses a three-second countdown. Exceeding grace forfeits to a connected opponent; both absent means abandonment, not an invented win.

## Architecture

**Godot Web client + authoritative Node.js/ws server**, inside the managed Game workflow. Separate rooms/connections, pure Snake rules, arena policy and rendering. Server runs a fixed-step simulation, resolves simultaneous moves atomically, owns food/boost/death, and sends versioned snapshots/input acknowledgements. The client can show bounded predicted turn movement but cannot guess pickups, growth or death. Unlimited-space mode later replaces the arena policy with bounded chunks, spatial collision indexing, a following camera and interest-managed updates.

The prior room/security research is reused; no new framework is needed at this stage. Exact initialized source, tools, host and latency behaviour remain to be verified. The earlier host lookup listed no available Cloud Computer: attach an existing one, or if necessary [create one](https://manus.im/app#settings/my-computer/create), with current documented plans from $10/month to recheck at setup. No purchase or deployment is performed.

A fresh **detached Snake-planning worktree** is created. Earlier proposals and all existing changes are retained. This is a proposed architecture only; no code, Game initialization or independent product verification has occurred.

**Decision remaining:** do you approve S1–S10 and the proposed rules above, or want changes before we freeze the implementation plan? Confirming grid-based controls does not yet authorize implementation, purchases or deployment.
