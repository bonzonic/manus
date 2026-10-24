# Nakama architecture evidence

Retrieved 2026-10-24 by the independent supporting research unit. Parent saved the returned evidence because subagent filesystem-write approval was unavailable. No implementation or compatibility test was performed.

## Primary excerpts

Source: https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/

> In server-authoritative multiplayer, all exchanges of gameplay data are validated and broadcast by the server.

> You must define the gameplay - how many players per match, whether joining in progress is allowed, how the match ends, etc. - by writing custom runtime code.

> Each match maintains its own individual, isolated state.

> A single node is responsible for this to ensure the highest level of consistency accessing and updating the state and to avoid potential delays reconciling distributed state.

Source: https://heroiclabs.com/docs/nakama/server-framework/typescript-runtime/function-reference/match-handler/

> There are 7 functions required in any match handler.

> This includes any re-join request from a client after a lost connection is resumed, where client will need to explicitly re-join upon reconnection.

> Executed when one or more users have left the match for any reason including connection loss.

> Each tick the match loop is run which can process messages received from clients and apply changes to the match state before the next tick.

Source: https://heroiclabs.com/docs/nakama/concepts/sockets/

> Socket connections are used in Nakama to enable real-time communication and gameplay between servers and clients.

> Realtime messages have a per-message size limit set by socket.max_message_size_bytes, 4 KB by default.

## Interpretation

Borrow isolated authoritative match state, explicit admission/rejoin callbacks, server-timed rules, and explicit state broadcasts. Nakama does not remove the need to implement game-specific timers, pickup arbitration, results or reconnect policy.

Adopting Nakama would add its server, custom authoritative runtime, client socket and opcode contract. For the current small scope, retaining the managed Godot + Node/ws starter appears smaller; this is an inference, not a performance comparison. The documented 4 KB message default is a Nakama setting, not proof of Treasure Sprint capacity or the appropriate rate limit.

The agent inspected only the three official pages above. Authentication, persistence setup, automatic state replay, full deployment, runtime/SDK pairing, scaling, cost and Godot interoperability with the selected managed route were not verified. No product code, installs, services or deployments were performed.
