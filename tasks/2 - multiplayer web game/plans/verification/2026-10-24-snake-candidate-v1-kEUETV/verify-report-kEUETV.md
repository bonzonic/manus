# Independent verifier preparation report — Snake candidate v1

**Status: BLOCKED / UNVERIFIED pending the parent network-enabled conduit.** This is not a PASS. The candidate is immutable commit `eebdb1d9408a2002c5971d7c8b4f15ba1f558bed`; baseline is `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`. The baseline has no runnable game and is recorded as unimplemented/unrunnable, not as a passing arm.

## Independent provenance and preparation

The candidate worktree resolved to the expected detached commit and clean status before measurement. The verifier-owned driver is [`snake-verifier.mjs`](./snake-verifier.mjs). It is native ESM, passed `node --check`, imports the candidate server and pure modules by file URL, starts and closes its own server on an auto-assigned port, creates two fresh headless Chromium contexts, forwards actual WebSocket traffic through pinned Playwright `1.56.1` `routeWebSocket`, and writes only redacted event JSON plus inspected-later screenshots. It does not use page evaluation, raw CDP, fake client state, bots, test endpoints, or public deployment.

The exact parent command and required `network:true` execution mode are in [`command-request.json`](./command-request.json). Parent execution is required because this child environment is known to deny localhost network/WebSocket connects; that EACCES capability boundary must not be relabeled as a candidate result.

## Pure scoped results actually run by this verifier

These are verifier-run measurements, not owner or integrator claims:

- `npm run test:rules`: **6/6 pass**.
- `npm run test:rooms`: **4/4 pass**.
- `npm run test:client`: **6/6 pass**.
- `npm run test:security`: **3/3 pass**.
- `node --test test/transport/recovery-wire.test.js`: **2/2 pass**.
- The real websocket transport case `test/transport/recovery-room-play-rematch.test.js` reached the candidate test and produced the known child-localhost `connect EACCES 127.0.0.1:<auto-port>` boundary. It was not counted as a code failure and was not repeated. The prepared conduit contains the actual two-browser replacement measurement.
- The prepared script contains additional independent deterministic checks for arena bounds, mirrored spawn, two-turn queue/reversal/cap, exact apple growth, mushroom boost/refresh/pause freeze, head-swap terminal pickup suppression, protocol size/origin/authority boundaries, and room admission/countdown/expiry. Those script fixtures are pending the parent conduit; no result is asserted from them here.

No full suite was run. No owner/integrator numbers are used as verifier evidence.

## Code findings from candidate inspection

These are precise source findings discovered independently before browser execution. They remain findings regardless of whether the parent conduit later proves other criteria.

### F1 — Runtime Origin validation is not enforced (code / high severity)

**Expected:** S7/S9 and the wire contract require trusted-Origin validation at WSS admission, rejecting an untrusted `Origin` without mutating room state.

**Observed:** `server/index.js:8` imports `validateOrigin`, and `server/index.js:29` builds `allowedOrigins`, but the `WebSocketServer` connection handler at lines 45–46 never inspects the upgrade request Origin or calls `validateOrigin`; it immediately creates a connection. The candidate therefore has a passing pure helper test but no runtime Origin gate. Parent browser evidence cannot upgrade this code mismatch to pass.

**Next action:** enforce the configured Origin allowlist during websocket admission and add a real rejected-origin transport check.

### F2 — Full snapshots are emitted at the 60 Hz server tick, violating the ≤15/s wire bound (code / high severity)

**Expected:** the frozen wire contract says the server emits at most 15 full snapshots per second per active room, with output bounded to 64 KiB and snapshots ≤32 KiB.

**Observed:** `server/index.js:77` starts a timer at `tickMs` (default 1/60 s), `server/index.js:86–95` ticks rooms and calls `sendRoomSnapshot(room)` on every active tick, while `sendRoomSnapshot` broadcasts a full snapshot (`server/index.js:25`). No cadence accumulator or 15/s gate exists. A two-browser run may confirm the excess in the sanitized trace, but the source path already makes the cadence mismatch reproducible.

**Next action:** throttle full snapshot emission to the frozen cadence while retaining authoritative ticks and bounded output handling; measure the resulting per-room rate.

### F3 — Shared invite links are generated but never consumed (code / high severity for S1)

**Expected:** opening a shared room link should let a second independent browser join the room without requiring a separate manual code transfer.

**Observed:** `public/app.js:83–86` constructs `/?room=<roomCode>` for Copy invite, but there is no `location.search`/query parsing or startup join path anywhere in `app.js`. The only join path is the manual `#join-room-panel` submit handler at lines 67–75. Thus the candidate advertises a shared link that opens the generic entry surface rather than joining the encoded room.

**Next action:** implement the frozen query/link join flow (without placing credentials in the URL) and cover it in the browser run. The prepared conduit intentionally uses the real code-submit button for its fallback two-browser join and records the link-query gap separately.

### F4 — Reconnect credential/epoch is not persisted or resumed by the browser, and interruption limits are not enforced (code / high severity for S8)

**Expected:** refresh may resume only the same seat credential within 15 cumulative disconnected seconds and at most two interruption episodes; the old socket loses control and expiry/forfeit/abandonment is deterministic.

**Observed:** `public/app.js` starts each load with a fresh in-memory `createClientModel()` and never stores or sends `credential`/`epoch` in a `RESUME` hello. The browser therefore cannot reattach after refresh. On the server, `server/rooms/room-manager.js:25` configures `maxInterruptions`, and line 141 increments `interruptionEpisodes`, but no code compares the count to `maxInterruptions`. Expiry logic at lines 152–156 runs only in `PAUSED`; a disconnected lobby or results room is not expired by `tickRooms`.

**Next action:** add a safe same-seat resume path with bounded credential storage/epoch rotation, enforce the two-episode cap, and cover lobby/results/paused expiry cases. The conduit records reconnect as not observed rather than fabricating it.

### F5 — Player ready/connection labels and boost remaining-time HUD are not driven from authoritative model state (code / medium severity for S2/S5/S9)

**Expected:** both labels plus connection/ready state, and a visible BOOST/remaining duration, are displayed from the authoritative welcome/snapshot lifecycle.

**Observed:** `public/client-model.js:10` stores `players`, but `public/dom-renderer.js:4–24` only updates phase, controls, snake stats, and turn queue; it never renders the player-card labels, connection, or ready state from `model.players`. The HTML remains with static “Not ready”/“Not connected” copy after join. `dom-renderer.js:24` renders the absolute `boostUntilTick` value as the boost HUD text, not a remaining duration or `BOOST` state. This should be confirmed in the returned screenshots, but the missing rendering path is source-certain.

**Next action:** render player card labels/status and calculate a bounded active-time remaining boost display from authoritative ticks.

## Browser/public evidence still pending

The parent must execute the exact command from `command-request.json` with its network-enabled conduit. The pending run is bounded to approximately 120 seconds and should produce desktop `1440x900` and narrow `390x844` screenshots, redacted protocol/latency trace, and JSON outcome. It covers cold create/join, both-ready countdown, live authoritative frames, keyboard controls, result/rematch, offline observation, and routeWebSocket 150 ms RTT/25 ms jitter. Pure fixture, malformed-boundary, stale-sequence/epoch/round, and lifecycle checks are included where candidate APIs permit.

After raw outputs return, an independent grading context must inspect every screenshot and trace before issuing any final status. The browser driver cannot establish S10 because the supplied route is local HTTP/WS and no authorized public HTTPS/WSS Render URL exists. Local browser evidence must be labeled local and cannot be substituted for S10.

## Coverage limits and non-actions

- No public deployment, account, database, purchase, push, merge, production restart, or test-criteria mutation was performed.
- No full repository suite was run. The known child-localhost EACCES was not repeated or called a code failure.
- No baseline browser comparison is possible: baseline is documentation/unrunnable by the frozen receipt.
- No screenshot or raw parent conduit artifact has yet been inspected; this draft deliberately does not call PASS.
- No verifier-owned process remains running from this phase; the prepared driver itself has not been executed here.
