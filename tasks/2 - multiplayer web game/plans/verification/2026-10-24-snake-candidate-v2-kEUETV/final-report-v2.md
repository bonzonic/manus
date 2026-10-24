# Independent Snake MVP v2 verification report

**Verdict:** `BLOCKED` — QA fixture/configuration blocker; not a PASS and not a public S10 demonstration.

**Category:** `QA_FIXTURE_ORIGIN_CONFIGURATION_BLOCKER`

**Terminal code failure:** `false`. The evidence establishes a verifier allowlist mismatch and two close-before-message test races, not a candidate product-code failure. The one authorized code retry remains consumed; no product repair, test mutation, acceptance-criteria edit, or deployment was performed here.

## Identity and evidence authority

- Candidate SHA: `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35`
- Baseline SHA: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`
- Failed v1 SHA: `eebdb1d9408a2002c5971d7c8b4f15ba1f558bed`
- Candidate project inspected: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-verifier-v2-20261024-kEUETV\project`
- Actual v2 driver retained unchanged: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-candidate-v2-kEUETV\snake-verifier-v2.mjs`
- Actual run result: `evidence/run-result.json`, status `MEASUREMENT_BLOCKED_OR_INCOMPLETE`
- Actual sanitized trace: `evidence/trace-sanitized.json`
- Actual browser evidence: `evidence/p1-entry-1440x900.png`
- Actual transport output: `.work/debug/retry1-transport-conduit.txt`

The candidate SHA was observed exactly in the v2 run result and trace. The trace is sanitized evidence, not a verdict; raw transport output and candidate bytes are the authority for the failure accounting.

## Precise root cause of the browser stop

The candidate admission code in `server/index.js` performs the required pre-hello Origin check and calls the exact-match `validateOrigin` helper. The v2 verifier instead creates the server with `port: 0` and the static, portless list `['http://127.0.0.1', 'http://localhost']` (original driver lines 742–747). The server selected ephemeral port `51467`, and the browser navigated to `http://127.0.0.1:51467/`; its trusted browser Origin therefore includes the port: `http://127.0.0.1:51467`.

The exact comparison rejects that trusted browser Origin because `http://127.0.0.1:51467` is not equal to `http://127.0.0.1`. The sanitized trace records the causal sequence: server started at `http://127.0.0.1:51467/`; the 47-element DOM contract passed; the browser scheduled a normal `hello` `CREATE`; the server returned `error` code `BAD_ORIGIN` with no `welcome`; the driver then timed out waiting for the eight-character room code. This is a QA setup fault: the verifier supplied the wrong configured test allowlist for its own dynamic-port server. It is not evidence that the candidate accepts a bad Origin or that the candidate's exact Origin enforcement is wrong.

The same trace independently shows both explicit negative probes behaving correctly: `https://evil.example` and absent Origin each opened the socket, received `BAD_ORIGIN`, and received no `welcome`. The candidate source has no wildcard bypass. The corrected QA driver therefore adds only the actual runtime origin `new URL(baseUrl).origin` to the mutable test allowlist after the ephemeral port is known; it does not weaken Origin enforcement.

## Transport output classification

The parent-executed conduit output is authoritative and ended with `PARENT_NETWORK_CONDUIT_EXIT=1`, reporting **5 tests: 2 pass, 3 fail**:

1. Untrusted-Origin admission: failed with `socket closed before expected message`.
2. Absent-Origin admission: failed with `socket closed before expected message`.
3. Same-seat RESUME epoch rotation/RESUMING: passed.
4. Full snapshot cadence <=15/sec while ticks advance: passed.
5. Create/join/ready/countdown/play/result/rematch: failed by timeout waiting for a server message.

Tests 1 and 2 are QA helper races/expectation defects: the helper rejects immediately on `close` before observing the bounded `BAD_ORIGIN` message, while the independent browser Origin probes did observe `BAD_ORIGIN` and no `welcome`. They do not prove an Origin-admission product defect. Test 5 is the same trusted-origin allowlist mismatch described above, not a code assertion that room creation returned a wrong code.

The v2 browser driver separately had `process-receipt.json` `exitCode: 1`, and its `run-result.json` status was incomplete. The parent process receipt deliberately has `exit_code: null`; that null is not a PASS. No shell exit was treated as script PASS.

## Candidate source inspection against F1–F5 and eight-character rooms

- **Eight-character code:** `server/rooms/room-manager.js` now generates eight uppercase alphanumeric characters from eight random bytes, and `validate.js` requires `^[A-Z0-9]{8}$` for JOIN. The repair report records the genuine default-code assertion green (2/2), and the frozen admission test source asserts the same. This is source/repaired-lane evidence, not an independent browser room-creation result; the browser never reached `welcome` in this run.
- **F1 Origin admission:** source inspection confirms admission-time exact Origin validation before hello handling and bounded `BAD_ORIGIN`/close. Runtime evil and absent probes passed (2/2 negative cases). The trusted positive browser admission was not measured because the original QA driver failed to whitelist the actual ephemeral-port Origin. The two raw transport F1 failures are close-before-message QA races.
- **F2 snapshot cadence:** source inspection confirms a central per-room limiter while the 60 Hz tick loop remains. Raw transport test 4 passed, including advancing ticks and the <=15/sec assertion. The browser-side cadence measurement did not run after the trusted handshake blocker.
- **F3 invite startup:** source inspection shows one-shot valid `?room=` JOIN scheduling and bounded `ROOM_INVALID` for malformed values without CREATE. The actual cold shared-link browser assertion did not run because P1 could not create a room.
- **F4 lifecycle:** source inspection confirms credential/current-epoch checks, old-socket invalidation, bounded interruption/grace checks, PAUSED/RESUMING handling, and non-fabricating abandonment/result retention. The independent v2 seam checks passed stale-epoch rejection, epoch advance into RESUMING, old-socket rejection, and both-absent abandonment (4/4); raw transport test 3 also passed. Full browser refresh/offline/reconnect behavior was not reached.
- **F5 authoritative render:** source inspection confirms player metadata is carried in canonical welcome/snapshot data and the renderer computes boost remaining from server tick/expiry. The entry screenshot and 47/47 frozen DOM IDs prove only the initial surface. The browser labels/status/boost/pause render matrix did not run; the repair report's scoped model/renderer results remain supplementary, not independent browser proof.

## Verified local scope

The actual v2 run proved the following bounded local facts only:

- Candidate identity matched the expected SHA.
- Eight pure verifier fixtures passed, including arena bounds, mirrored spawn, turn queue/reversal, exact apple growth, mushroom refresh/pause freeze, terminal head-swap pickup suppression, protocol/Origin/authority boundaries, and room admission/ready/rematch/expiry fixture.
- Four independent room-manager lifecycle seam checks passed.
- Two runtime negative Origin probes passed with `BAD_ORIGIN` and no `welcome`.
- The real local server started and served the UI; browser navigation succeeded.
- The frozen DOM contract passed 47/47 IDs.
- The 1440x900 entry screenshot was captured and inspected.
- The two raw transport positive measurements that could run (resume epoch and snapshot cadence) passed.
- Task-owned browser process PID `59852` exited with observed exit code 0; task-owned in-process server/conduit PID `11316` was closed exactly and recorded stopped.

This is partial local evidence, not whole-game proof.

## Coverage limits and remaining evidence

Not independently demonstrated by the current run: trusted browser CREATE/JOIN, shared lobby/countdown, two-browser PLAYING, accepted turn behavior over the browser route, natural boost HUD and pause freeze, browser result/rematch, browser refresh/offline resume, narrow-viewport gameplay, browser-side cadence after a trusted handshake, and any public HTTPS/WSS delivery. S10 remains blocked by the frozen requirement because this run used an in-process localhost HTTP/WS server and no public deployment was authorized or supplied.

The source tree may be delivered as an experimental candidate/source archive, but this report does not verify it as a shipped or publicly reachable game. The old driver and evidence remain history; they are not overwritten.

## Corrected QA rerun

One distinct QA-only copy was created; the original driver was not edited:

`C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-candidate-v2-kEUETV\snake-verifier-v2-origin-corrected.mjs`

Its only functional change is to retain the exact static negative origins, then add the actual server origin `new URL(baseUrl).origin` after the ephemeral port is known. All eight-character, Origin rejection, latency, browser, narrow-viewport, lifecycle, and cleanup checks remain in the copied driver. It does not add `*` or bypass Origin validation.

Parent may rerun separately with a fresh evidence directory and the exact installed task-local Playwright module root:

```powershell
node "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-candidate-v2-kEUETV\snake-verifier-v2-origin-corrected.mjs" `
  --candidate-project "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-verifier-v2-20261024-kEUETV\project" `
  --evidence-root "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-candidate-v2-kEUETV\evidence-origin-corrected" `
  --playwright-root "C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\tools\browser-qa\node_modules\playwright" `
  --expected-sha afd285f6c85cfa4638fbcd84973d1ae1bfa41e35 `
  --rtt-ms 150 --jitter-ms 25 --max-seconds 180
```

The current measurement records do **not** suffice for a final PASS. A fresh rerun with the corrected QA origin configuration is required to replace the blocked trusted-browser evidence; even a successful corrected localhost run would remain local-scope evidence and could not turn S10/public HTTPS/WSS into PASS. No `review-fail.md` was created because this review did not establish a product-code failure.

## Process cleanup verdict

Cleanup was exact and task-owned. The trace records browser PID `59852` exit observed with code 0 and server PID `11316` exact stop. `process-receipt.json` records both owned processes exited; `parent-process-exit.json` records PID `11316` status `EXITED` but `exit_code: null`, so only the known conduit marker `PARENT_NETWORK_CONDUIT_EXIT=1` and the child receipt `exitCode: 1` are reported as failures. No unknown PID was killed, and no unrelated Node/Chrome process was touched.
