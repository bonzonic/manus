# Snake candidate v2 verifier preparation

**Run ID:** `2026-10-24-snake-candidate-v2-kEUETV`  
**Lane:** fresh independent `om-verifier` QA-preparation lane  
**Status:** **PREPARED — NOT EXECUTED; NO VERDICT**  
**Prepared at:** 2026-10-24T17:47:26+08:00

## Frozen inputs and independence

This preparation used the verifier safeguards, the frozen owner repair handoff, original S1–S10 plan, frozen wire/DOM contract, independent v1 failure report, and the real v1 verifier driver. No mutable repair product source was read. No product, test, acceptance criterion, worktree, or v1 evidence was edited.

The v1 report established a product contract failure rather than a verifier fault: the real CREATE/WELCOME path returned `SWOEW5S` (seven characters) while frozen S1 requires exactly eight uppercase alphanumeric characters. It also measured approximately 38.91 full snapshots per second, above the frozen maximum of 15, and documented independent F1–F5 repair targets. The v2 driver therefore requires an explicit unknown v2 SHA and does not weaken the frozen eight-character predicate.

The requested document destination is the task-local root explicitly supplied for this run: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game`. The verifier folder is distinct from the v1 folder and from the owner run folder.

## Prepared artifacts

- `snake-verifier-v2.mjs` — reusable verifier adapted from the real v1 Playwright driver.
- `command-request-v2.md` — deferred parent-side PowerShell command using `Start-Process -PassThru`, exact placeholders for the unknown candidate project/SHA, and cleanup/interpretation gates.
- `verify-preparation-v2.md` — this preparation record.

The runtime evidence directory is intentionally not claimed as measured evidence. The v2 script creates it only when the parent executes the deferred command.

## v2 measurement expansion

The script preserves the v1 real application path and adds the following bounded checks:

| Area | Prepared measurement | Evidence rule |
|---|---|---|
| Candidate identity | Explicit `--expected-sha`, observed Git SHA, frozen baseline SHA | Mismatch blocks measurement; no default v1 SHA remains. |
| Real latency | Playwright 1.56.1 `page.routeWebSocket` with 150 ms RTT target and 25 ms jitter bound | Real browser traffic is forwarded with per-message one-way delay; no fake data, CDP, or page evaluation. |
| Origin security | Two transport-only probes using the candidate's installed `ws` library: evil Origin and absent Origin | Requires bounded `BAD_ORIGIN`, no `welcome`; no room/gameplay state is injected. |
| Room code and invite | Real P1 CREATE, exact eight-character code, real P2 cold navigation to `?room=CODE` | Counts exactly one P2 `JOIN` hello and zero P2 `CREATE`; credentials are never placed in the URL. |
| Both-ready authority | Real Ready clicks from both browsers, then server-to-browser `welcome`/`snapshot` player metadata | Requires server-confirmed P1/P2 connected and ready, not DOM-only evidence. |
| Snapshot limit | Counts scheduled server-to-browser full snapshots by room and unique revision over sliding one-second windows | Requires at most 15; also records maximum snapshot bytes against 32 KiB. Renderer counts are not used. |
| Live play/input | Real browser controls and server `inputAck` dispositions | Requires PLAYING server ticks to advance and accepted authoritative acknowledgements. |
| Boost HUD | Looks for an actually observed authoritative snapshot with non-null future `boostUntilTick`, then checks the corresponding real HUD | No mushroom state is injected; if the bounded run never naturally observes a pickup, the result is `UNVERIFIED`, not PASS. |
| Same-seat refresh | Real P1 browser refresh, server-observed `RESUME` hello and newer epoch | Checks page URL/query for credential leakage and requires server-confirmed epoch advancement. |
| Pause/reconnect | Real P2 `BrowserContext.setOffline(true/false)` and server phase/RESUME observations | Records pause surface, PAUSED snapshots, and same-seat resume; missing observations remain unverified. |
| Epoch/episode/expiry | Candidate room-manager public seam only, using actual exported lifecycle functions | Covers stale epoch, epoch advance, old-socket command rejection, third interruption cap, and both-absent expiry without a fabricated winner. This is explicitly labeled seam evidence, not browser evidence. |
| Results/rematch | Real two-browser result surfaces, server `result`, narrow viewport, both rematch controls, fresh countdown round | No client-only result is accepted. Missing bounded stages remain unverified. |
| S10 | Explicit blocked record | This local in-process HTTP/WS run cannot pass frozen S10 public HTTPS/WSS; no deployment or public route is claimed. |

## Process ownership and cleanup design

The conduit records its own `process.pid` and `process.ppid`; the in-process candidate server is recorded under that exact conduit PID. Playwright is launched with `chromium.launchServer` and connected with `chromium.connect`, so the browser-server child PID is recorded from Playwright's owned process handle. Cleanup closes only the exact contexts, browser connection/server, route timers, in-process server handle, and transport probe sockets created by the script. The script writes `process-receipt.json`, including exact PIDs and exit observations; the parent command writes separate start/exit receipts for the `Start-Process -PassThru` conduit.

No process was reserved, launched, tested, built, installed, browsed, or killed in this preparation lane. Existing observed Node IDs `52788` and `53440` remain untouched and are not treated as owned.

## Coverage and grading limits

This is a preparation artifact, not a run report. It contains no candidate v2 SHA, no execution start/end receipt, no browser screenshot, no runtime trace, no phase PASS, and no verdict. The parent must execute the deferred command only after the implementer produces the immutable v2 candidate and the parent records its exact SHA. A later fresh grader must inspect the complete outputs and screenshots and independently issue the v2 verdict. A successful local run still cannot waive S10.
