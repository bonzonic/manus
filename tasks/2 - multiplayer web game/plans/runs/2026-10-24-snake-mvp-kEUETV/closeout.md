# Snake MVP owner closeout

**Closeout status:** `BLOCKED / UNVERIFIED`

This is the successor owner closeout for the frozen Snake MVP work item. It acknowledges the independent v2 verdict without editing the verifier record, changing the contract, changing product code, rerunning the browser, or deploying anything. The candidate is an experimental review/source candidate, not a completed game.

## Verdict acknowledged

The independent v2 report is authoritative for this closeout:

- Verdict: `BLOCKED`
- Category: `QA_FIXTURE_ORIGIN_CONFIGURATION_BLOCKER`
- Terminal code failure: `false`
- Report: `plans/verification/2026-10-24-snake-candidate-v2-kEUETV/final-report-v2.md`

The verifier established that the candidate's exact Origin admission correctly rejects hostile and absent Origins. The positive QA fixture incorrectly allowlisted portless `http://127.0.0.1` / `http://localhost` while the server used a random port, and the helper had close-before-message races. Therefore this run did **not** establish a second product-code failure. The one authorized product-code retry is nevertheless consumed under the frozen process; no second code retry, criteria edit, or verifier-record rewrite is authorized by this closeout.

The corrected QA-only driver was authored while preserving the original driver and product criteria. A later parent launch attempt at approximately `2026-10-24 17:58:24 +08:00` did not produce usable evidence: a PowerShell reserved `$PID` assignment fault interrupted the parent receipt, the process handle was not recoverable in the separate approval terminal, and CIM command-line inspection was denied. No duplicate corrected run was launched and no unknown PID was killed. That attempt is not treated as a pass, an exact exit, or correlated positive gameplay evidence.

## Candidate and archive identity

| Item | Recorded identity |
|---|---|
| Frozen baseline | `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` |
| Failed v1 candidate | `eebdb1d9408a2002c5971d7c8b4f15ba1f558bed` |
| v2 candidate | `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35` |
| Candidate worktree | `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-repair-20261024-kEUETV` |
| v2 verifier worktree | `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-verifier-v2-20261024-kEUETV` |
| Source archive | `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\drafts\delivery\snake-source-afd285f-candidate.zip` |
| Archive receipt | `.work\drafts\delivery\archive-receipt.json` |
| Archive contents | 39 files under `project/` |
| Archive SHA-256 | `495a1845d95a1c6c749442428e3c8993989900a7493ed44588f5c66b2b1fd5f1` |
| Archive deployment flag | `deployment_performed: false` |

The archive may be delivered only as an explicitly **UNVERIFIED review candidate/source ZIP**. It is not evidence of a shipped or publicly reachable game.

## What was actually measured

The preserved v2 run and independent inspection measured only the following bounded facts:

- Candidate identity matched the expected v2 SHA.
- Eight pure verifier fixtures passed, including arena bounds and mirrored spawn, turn queue/reversal, exact apple growth, mushroom refresh/pause freeze, terminal head-swap pickup suppression, protocol/Origin/authority boundaries, and room admission/ready/rematch/expiry fixture.
- Four independent room-manager lifecycle seam checks passed.
- Two runtime negative Origin probes passed: hostile `https://evil.example` and absent Origin produced `BAD_ORIGIN` with no `welcome`.
- The local server started and served the UI; browser navigation succeeded.
- The frozen DOM contract passed `47/47` IDs.
- The retained entry screenshot was inspected: `plans/verification/2026-10-24-snake-candidate-v2-kEUETV/evidence/p1-entry-1440x900.png`.
- Two raw transport measurements passed: same-seat RESUME epoch rotation/RESUMING and full-snapshot cadence `<=15/sec` while ticks advanced.
- The raw conduit classified five tests as `2 pass, 3 fail`; its two positive passes were the resume and cadence cases. The two negative-Origin helper failures were close-before-message QA races. The create/join/ready/countdown/play/result/rematch case timed out because the driver had not allowlisted the actual ephemeral-port Origin.
- Task-owned browser PID `59852` exited with observed code `0`; task-owned in-process server/conduit PID `11316` was stopped exactly. The report records no unknown-PID kill. Unknown Node PIDs `52788` and `54428` were left untouched.
- The parent receipt's `exit_code: null` is not a pass and is not converted into an exit claim here.

## Entry UI evidence, without invented usage claims

The inspected entry screenshot shows the following visible labels/surfaces: `Wayfinder Grid`; `ROOM`; `Copy invite`; `PHASE` / `LOBBY`; `DISCONNECTED`; `LIVE FIELD · 40 × 24`; `The grid is waiting for two Wayfinders.`; `GUEST MATCH · NO ACCOUNT NEEDED`; `A SHARED FIELD FOR TWO`; `Find your way through the grid.`; `Create a room`; `Paste an invite link`; `TWO SEATS`; `PLAYER 1`; `PLAYER 2`; `STEERING`; `Make a turn`; `FIELD NOTES`; `Rules at a glance`; and `MATCH STATUS` / `Stay in sync`. The screenshot also shows the entry rules copy about four directions, apples, mushrooms, and both players being ready.

This is entry/lobby evidence only. It does not demonstrate that a room was created, that a second browser joined, that gameplay occurred, or that a result/rematch worked.

## Measured versus unrun acceptance criteria

The frozen criteria are binary. Partial fixtures or a screenshot do not turn an item into a pass. Accordingly, every S1–S10 remains **not satisfied** in this closeout:

| Criterion | Measured evidence | Still unrun or insufficient |
|---|---|---|
| S1 Guest room/invitation | Local UI loaded; source/fixtures cover admission; negative Origin probes passed. | Trusted browser CREATE/JOIN was blocked by the QA allowlist mismatch; two independent browsers, full/expired/invalid behavior, and exactly-two-seat browser proof were not measured. |
| S2 Shared lobby/start | Entry DOM and lobby labels inspected; room seams exist. | Shared two-browser lobby, both labels/status, both Ready, and the three-second countdown were not observed. |
| S3 Real multiplayer Snake | Pure rule fixtures passed. | Two-browser board, accepted turns, reversal behavior over the browser route, and server-owned movement were not demonstrated. |
| S4 Apple growth | Pure exact-growth fixture passed. | Controlled browser/server route consumption, both-client agreement, and legal replenishment were not demonstrated independently. |
| S5 Mushroom boost | Pure mushroom refresh/pause-freeze fixture passed. | Natural browser pickup, `BOOST` remaining HUD, no-stack behavior, and pause display freeze were not demonstrated. |
| S6 Finish/rematch | Room/lifecycle seams and pure terminal cases were covered locally. | Browser collision/result/rematch flow and all required outcome cases were not completed; the positive transport lifecycle case timed out before trusted admission. |
| S7 Authoritative responsive networking | Protocol/authority fixtures and raw snapshot cadence passed. | Full malformed/flood/stale matrix on the browser route, bounded queues/snapshots in the complete flow, and 100–200 ms RTT/jitter two-browser evidence were not completed. |
| S8 Lifecycle | Four lifecycle seams and raw RESUME epoch case passed. | Browser refresh/offline/reconnect, old-socket behavior in the full flow, narrow lifecycle, and all user-visible expiry cases were not demonstrated. |
| S9 Feedback/safety | `47/47` DOM IDs, entry screenshot, source inspection, and negative Origin probes were recorded. | Full runtime labels/status/boost/pause/result/safety matrix, credentials and bounded-traffic evidence through gameplay, and public-route safety proof were not completed. |
| S10 Independent browser demonstration | Local browser navigation and entry screenshot only. | Two independent browsers over actual public HTTPS/WSS, complete S1–S9, latency/jitter, and public delivery were not run. |

S1–S10 are the must-have criteria. Unlimited-space mode, extra players, sound, and art polish are nice-to-have only and must not displace the remaining matrix.

## Optional local use (documented, not verified as two-user acceptance)

The candidate README records these commands when run from the candidate `project` directory:

```text
npm ci --ignore-scripts --no-audit --no-fund
npm start
```

The README says the server serves static files from `public/`, exposes `GET /healthz`, accepts WebSocket clients at `/ws`, honors `PORT`, and defaults to `127.0.0.1:10000`. Those are documented local entry points, not a claim that this closeout ran a manual two-user session. Localhost rendering or a single-browser run cannot satisfy S10 or prove free public hosting.

## Deployment boundary

`project/docs/render.md` describes one future free Render web service: package root `rootDir: .`, Node `22.12.0`, Free plan, build `npm ci --ignore-scripts`, start `npm start`, health check `/healthz`, proposed `HOST=0.0.0.0`, and same-origin `/ws` with deployment-time `ALLOWED_ORIGINS`. It explicitly says that no Render account, service, public URL, deployment, uptime, HTTPS/WSS measurement, or S10 result exists.

No Render deployment, account mutation, public URL, push, merge, or production action occurred. A future deployment requires an authorized Git repository connection and user-authenticated Render setup; the owner makes no promise that this can be done without those technical/account steps.

## Closeout decision

**Status is `BLOCKED / UNVERIFIED`; the MVP is not satisfied, not all-must-passed, and not shipped.** The source archive can be handed over as an explicitly unverified candidate only. Preserve the old verifier records and the original driver. The exact next action is in [`followups.md`](followups.md), and the delivery-state summary is in [`delivery-status.md`](delivery-status.md).
