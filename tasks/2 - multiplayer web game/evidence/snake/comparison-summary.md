# Multiplayer architecture comparison synthesis

Retrieved 2026-10-24. Parent retained the synthesis unit's recommendation and source-backed reasoning because the subagent could not obtain filesystem-write approval. The research workflow completed with two comparable results and one synthesis; no map failures. It did not implement or independently verify the proposed game.

**Recommended: adapt the existing managed Godot + standalone Node/ws starter.** Borrow the documented room/match boundary, authoritative state, explicit lifecycle and rejoin handling from Colyseus and Nakama; do not add either complete framework in the first slice.

## Options

| Option | What it provides | Why now or later |
| --- | --- | --- |
| Adapt Node/ws starter | Reuses the platform's documented room/seat/reconnect/discovery direction and keeps a small custom rules module. | Recommended for one two-player game. Exact runnable source and contracts must be inspected after approved setup; this is not a measured performance claim. |
| Adopt Colyseus | Documented Room lifecycle, state/message APIs, Matchmaker and reconnection. | Revisit for a concrete framework-specific requirement. Adds Schema/client/protocol integration and package/version alignment; Godot interoperability was not verified. |
| Adopt Nakama | Documented authoritative match callbacks, tick processing, explicit broadcasts and socket messages. | Revisit when broader platform needs justify its runtime and operations. Godot interoperability with the selected starter was not verified. |

## Source basis

Colyseus Room: https://docs.colyseus.io/server/room

> Each room instance holds one group of clients, who interact through shared state and messages.

Colyseus FAQ: https://docs.colyseus.io/faq

> Rooms are ephemeral by default.

Nakama authority: https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/

> In server-authoritative multiplayer, all exchanges of gameplay data are validated and broadcast by the server.

Nakama match callbacks: https://heroiclabs.com/docs/nakama/server-framework/typescript-runtime/function-reference/match-handler/

> There are 7 functions required in any match handler.

Complete captured evidence and gaps are in [Colyseus](colyseus.md) and [Nakama](nakama.md). State that persists for a match is not durable database state. Neither framework makes a 60-second timer, finite results, pickup tie rules or restart recovery automatic for this game.

The source-research stage started before tasks.txt was supplied. Its provisional two-player/60-second premise remains a parent proposal after the file arrived; the actual file delegates genre/mechanics and asks for a complete real networked match. No new compatibility, capacity, cost or deployment assertion is added by that clarification.
