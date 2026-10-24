# Colyseus architecture evidence

Retrieved 2026-10-24 by the independent supporting research unit. Parent saved the returned evidence because subagent filesystem-write approval was unavailable. No implementation or compatibility test was performed.

## Primary excerpts

Source: https://docs.colyseus.io/server/room

> Each room instance holds one group of clients, who interact through shared state and messages.

> Rooms expose a hook for every stage a client passes through: `onCreate`, `onAuth`, `onJoin`, `onDrop`, `onReconnect`, `onLeave`, and `onDispose`

> `allowReconnection()` lets a dropped client return to the room within a time window, or under manual control.

Source: https://docs.colyseus.io/faq

> Rooms are ephemeral by default.

> When a client disconnects (e.g., closed browser tab), you can allow them to reconnect to the same room

Source: https://docs.colyseus.io/matchmaker

> Every join call from the SDK goes through the matchmaker.

> `joinOrCreate()` finds a compatible room or spawns one, `join()` requires one to exist, and `joinById()` targets a specific room.

## Interpretation

Borrow the room boundary, server-owned match facts, input/event separation, explicit admission and reconnect lifecycle, and cleanup. Retain the managed Godot + Node/ws starter rather than adding the whole framework for a single two-player mode. This is a scope-based recommendation, not a measured implementation comparison.

Whole-framework adoption adds the Colyseus Room/Matchmaker/Schema and client-integration surface. It may become worth a separate compatibility study when richer matchmaking, per-client visibility, established prediction or distributed room ownership becomes a concrete requirement. These features are not assumed to integrate with the existing Godot protocol.

The agent inspected only the official FAQ, Room, and Matchmaker pages. Runtime versions, install manifests, Godot interoperability, migration compatibility, deployment, TLS, security, operating cost, capacity and load were not verified. Ephemeral room state is not durable persistence. No claim about a runnable Treasure Sprint implementation follows from these docs.
