# Final independent verification report — Snake candidate v1

**Verdict:** **CODE FAIL — no PASS.** The candidate has a reproducible S1 room-code contract failure. The local S10 demonstration is also **BLOCKED/UNVERIFIED** because the supplied run uses local HTTP/WS rather than an authorized public HTTPS/WSS delivery route. Public S10 remains blocked and cannot be waived.

**Category:** `CODE_FAIL_WITH_S10_PUBLIC_ROUTE_BLOCKED`

**Candidate:** `eebdb1d9408a2002c5971d7c8b4f15ba1f558bed`  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (documentation/unrunnable; not treated as a passing arm)  
**Evidence root:** `plans/verification/2026-10-24-snake-candidate-v1-kEUETV/evidence/`

## Evidence inspected

I read the complete verifier safeguards and measurement contract, the preparation report, frozen S1–S10 plan, exact conduit output, `run-result.json`, the sanitized trace in bounded slices, the verifier driver source, candidate source relevant to the findings, and the returned `p1-entry-1440x900.png`. The first Git ownership/SHA attempt is not treated as a candidate failure: the second exact process-local `safe.directory` execution resolved identity and measured the expected candidate SHA without global Git configuration.

The screenshot is a genuine 1440×900 entry view (captured image is 1440×1082 because it is full-page): the Wayfinder Grid shell is rendered, the entry modal visibly contains **Create a room**, and the surrounding UI is present. Both fresh browser navigations completed and both 47-element frozen DOM checks passed.

## Determination of the create-room timeout

This is **not a QA-driver fault**. The trace proves the click path reached the product's real transport:

1. P1 sent `hello` with `mode: CREATE` at trace event 18.
2. The candidate returned a real `welcome` at event 25 with room code `SWOEW5S`, seat `P1`, room/round identity, and a redacted credential.
3. `SWOEW5S` has **7 characters**. The frozen S1 contract requires an eight-character guest code; the verifier's `/^[A-Z0-9]{8}$/` wait predicate is therefore correct. The candidate client independently enforces the same eight-character shape for manual join (`public/app.js:70`).
4. The driver timed out only because it correctly refused to accept the product's seven-character code. This is a product/contract mismatch, not a selector, click, WebSocket-connect, or latency-driver error.
5. Candidate source confirms the cause: `server/rooms/room-manager.js:25` derives the default source from `randomBytes(5).toString('base64url').slice(0, 8)`. Five random bytes encode to seven base64url characters, so the advertised eight-character result is not guaranteed and the observed run produced seven.

The trace contains no `page-error` events and no `request-failed` events. It has one browser console error for a 404 resource, but the page rendered, loaded its module, sent `hello`, and received `welcome`; that console error does not explain the room-code timeout. The driver recorded repeated P1 snapshots after welcome and then its explicit fatal timeout, with a clean `server-stopped` receipt.

## Measured checks

| Check | Result | Evidence/qualification |
|---|---|---|
| Candidate identity | PASS | Observed SHA exactly matches expected candidate SHA. |
| Pure deterministic fixtures | PASS | 8/8 verifier fixtures passed: arena/food, round/spawn, turn queue/reversal/cap, apple growth, mushroom boost/pause, terminal head-swap, protocol boundaries, room lifecycle fixture. |
| Browser navigation/rendering | PASS for limited surface | Two fresh contexts navigated; 47/47 frozen DOM IDs passed for P1 and P2; entry screenshot inspected. |
| Create room / S1 | **FAIL** | Product returned 7-character `SWOEW5S`; required 8-character code was never observable to the verifier. |
| Snapshot cadence / S7 | **FAIL** | Existing trace has 465 P1 server-to-browser full snapshots from elapsed 1,902–13,852 ms: approximately 38.91/s, above the frozen ≤15 full snapshots/s bound. This is consistent with the source's snapshot broadcast on every 60 Hz timer tick. |
| Console/page diagnostics | Limited evidence | 0 page errors, 0 request-failed events, 1 console error (404 resource). |
| Two-user lobby/countdown/live/result/rematch/reconnect | UNVERIFIED | Create-flow failure stopped the bounded browser path before P2 join. Do not infer pass or failure for unexecuted stages. |
| S10 public demonstration | **BLOCKED** | Evidence route is local HTTP/WS; no authorized public HTTPS/WSS URL or Render deployment was supplied. Local browser evidence cannot substitute for S10. |

## Independent code findings (F1–F5; documented separately)

These are independent candidate findings and are not merged into the create-timeout finding:

### F1 — Runtime Origin validation absent (high; S7/S9)

`server/index.js:8` imports `validateOrigin` and line 29 creates `allowedOrigins`, but the WebSocket connection handler at lines 45–46 never checks the upgrade request's Origin or calls the validator. The pure helper fixture passing does not prove runtime admission security. Repair by enforcing the configured allowlist at WebSocket admission and adding a real rejected-Origin transport check that proves room state is unchanged.

### F2 — Full snapshot cadence exceeds the frozen bound (high; S7)

`server/index.js:77` runs the timer at the 60 Hz tick interval, and lines 86–95 call `sendRoomSnapshot(room)` every active timer tick. The inspected trace measured about 38.91 P1 full snapshots/s over the captured interval, versus the required ≤15/s per active room. Repair by throttling full snapshot emission independently of authoritative simulation ticks and then measuring per-room cadence and bounded output.

### F3 — Shared invite links are generated but not consumed (high; S1)

`public/app.js:83–86` creates `/?room=<roomCode>` for Copy invite, but there is no query parsing or startup JOIN path. A second browser opening the advertised link would receive the generic entry surface rather than join the encoded room. Repair the frozen query/link join flow without putting credentials in the URL and cover it with an independent browser check.

### F4 — Browser reconnect/resume and interruption cap are incomplete (high; S8)

`public/app.js` creates fresh in-memory client state and never persists/sends credential/epoch in a `RESUME` hello. `server/rooms/room-manager.js:25` configures `maxInterruptions`, but `disconnectSeat` at line 141 only increments `interruptionEpisodes`; no enforcement comparison exists. Expiry handling at lines 152–156 is limited to `PAUSED`, leaving disconnected lobby/results expiry paths incomplete. Repair same-seat bounded resume, credential/epoch rotation, two-episode enforcement, and all frozen expiry cases.

### F5 — Player status and boost HUD are not authoritative-state driven (medium; S2/S5/S9)

`public/client-model.js` stores players, but `public/dom-renderer.js:4–24` does not render player labels, connection state, or ready state from `model.players`; the static HTML labels remain stale after lifecycle changes. Line 24 displays absolute `boostUntilTick`, not a visible BOOST/remaining-duration presentation. Repair rendering from authoritative welcome/snapshot state and calculate a bounded active-time remaining display that freezes during pause.

## Exact reproduction and repair targets

**Reproduction already evidenced (no rerun performed):** run the supplied verifier conduit against the immutable candidate with the recorded project/evidence/playwright paths and the requested 150 ms RTT / 25 ms jitter configuration. Observe P1 `hello CREATE`, then `welcome.roomCode = SWOEW5S` (length 7), followed by the driver's `Timed out waiting for created room code` at `snake-verifier.mjs:294`.

**Repair targets:**

1. Make the server's default room-code generator produce exactly eight uppercase alphanumeric characters with adequate entropy and collision retry; keep client JOIN validation and invite handling consistent.
2. Add runtime trusted-Origin enforcement at WebSocket admission and a rejected-origin integration check.
3. Throttle full snapshots to ≤15/s per active room while retaining a 60 Hz authoritative tick; measure snapshot size and output-queue bounds.
4. Parse and consume `?room=` on cold startup, while keeping credentials out of URLs and logs.
5. Implement persisted, bounded same-seat credential/epoch resume; revoke the old socket; enforce at most two interruption episodes and 15 cumulative disconnected seconds across lobby, play, paused, and results lifecycle states.
6. Render player labels/connection/ready state from authoritative model data and show BOOST plus remaining active duration, with pause freeze.
7. After code repair, rerun the complete independent browser matrix and obtain the separately required public HTTPS/WSS evidence. Do not convert this local run into S10.

## Process ownership and cleanup gap

The trace records an in-process candidate server start and one `server-stopped` event; it records no cleanup errors. The verifier source closes timers, contexts, browser, and the in-process server in `finally`, but it does **not** record OS process IDs or a post-close process-exit receipt for the Playwright-launched Chrome family. Therefore this artifact cannot assert that no process remains.

The parent observed Node IDs **52788** and **53440** with start times **17:29:40** and **17:39:08**, respectively. Ownership was not established by the supplied trace or conduit output. They must not be killed by name, assumed unrelated, or reported as zero remaining PIDs. The exact follow-up need is to instrument the conduit with task-owned startup receipts (conduit PID, any external server PID, browser PID/process-group identity where available), then verify exit of those exact recorded task-owned IDs after `finally`; alternatively have the parent correlate each observed PID to the recorded parent/creation receipt before any authorized cleanup. This is a verification/cleanup-evidence gap, not a fabricated product result.

## Coverage limits and non-actions

No product, test, acceptance criterion, deployment, public account, network service, merge, or global Git configuration was changed. No rerun, browser rerun, build, install, or network process was performed during this final review. The browser path stopped at create-room, so no result/rematch/reconnect screenshot or two-user state is evidence. No PASS is issued.
