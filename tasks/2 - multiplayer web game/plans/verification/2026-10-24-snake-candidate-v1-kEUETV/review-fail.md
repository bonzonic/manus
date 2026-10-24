# Review fail — Snake candidate v1

**Verdict:** CODE FAIL; no PASS.  
**Category:** `S1_ROOM_CODE_CONTRACT_MISMATCH` (with independent F1–F5 code findings and public S10 blocked)

**Candidate:** `eebdb1d9408a2002c5971d7c8b4f15ba1f558bed`  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`

## Blocking failure

The measured browser trace proves the product handled the real create flow but returned a seven-character room code:

- P1 sent `hello` with `mode: CREATE`.
- The candidate returned `welcome.roomCode = SWOEW5S` (length 7), with valid room/round/seat data and a redacted credential.
- The frozen S1 contract requires an eight-character guest code. The verifier's `/^[A-Z0-9]{8}$/` wait is correct, and the client also validates manual join with the same eight-character requirement.
- The run then stopped at `snake-verifier.mjs:294` with `Timed out waiting for created room code`.

Source cause: `server/rooms/room-manager.js:25` uses `randomBytes(5).toString('base64url').slice(0, 8)`. Five bytes encode to seven base64url characters, so the observed seven-character code is expected. Repair the generator to guarantee exactly eight uppercase alphanumeric characters, with collision retry, then rerun S1 and the full browser matrix.

This is a product contract defect, not a QA-driver fault. The trace shows successful navigation, 47/47 DOM IDs for each fresh browser, WebSocket routing, the CREATE hello, and the welcome response. There were zero pageerror and zero request-failed events; the one console 404 did not prevent application startup.

## Additional independent code findings

- **F1, high:** Runtime WebSocket Origin is not checked. `server/index.js` imports `validateOrigin` and builds an allowlist but never applies it in the connection handler. Enforce the allowlist at admission and add rejected-Origin transport evidence.
- **F2, high:** Full snapshots are broadcast on the 60 Hz timer. The trace contains 465 P1 full snapshots over elapsed 1,902–13,852 ms, approximately 38.91/s, above the frozen ≤15/s bound. Throttle full snapshots while retaining the authoritative 60 Hz tick.
- **F3, high:** `public/app.js:83–86` generates `?room=...` invite links, but no query parsing or automatic join exists. Implement and test link consumption without credentials in URLs/logs.
- **F4, high:** The browser does not persist/resume credential/epoch; the server increments interruption episodes but does not enforce the configured two-episode cap, and expiry logic is only in PAUSED. Implement bounded same-seat resume, old-socket revocation, interruption cap, and all frozen expiry paths.
- **F5, medium:** `public/dom-renderer.js` does not render authoritative player labels/connection/ready state and displays absolute `boostUntilTick` rather than BOOST/remaining duration. Render lifecycle/HUD state from authoritative snapshots.

## Public and cleanup status

S10 remains blocked: the evidence is local HTTP/WS and no authorized public HTTPS/WSS route was supplied. Local browser evidence cannot substitute for S10.

The trace records `server-stopped` and no cleanup errors, but no OS PID receipts. Parent-observed Node IDs 52788 (17:29:40) and 53440 (17:39:08) are ownership-unconfirmed. Do not kill by name or claim zero PIDs. Instrument or correlate exact task-owned startup/process-group receipts before cleanup conclusions.

See the complete [final verification report](verify-report-final-v1.md) for the evidence matrix, coverage limits, and exact repair targets.
