# Snake driver preflight — 2026-10-24-snake-driver-preflight-kEUETV

**Status:** PREPARED / NOT EXECUTED. This is driver preflight only, not product verification and not a verdict.

## Scope and safeguards

The frozen verifier role, wire/DOM contract, owner verification packet, role/resource handoff, and verification-before-completion runtime guidance were read before drafting. The baseline is `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`, which has no runnable product. No candidate, build, public route, browser run, focused test run, installation, server, or verdict exists in this preflight. S10 remains blocked and a localhost/static demo must never be relabeled as S10 passing.

Only the standalone QA harness and this verifier-owned preflight report were written. Product code, criteria, owner records, implementation worktrees, and mutable candidate files were not inspected or edited.

## Prepared artifacts

- [Driver script](../../../../.work/qa/snake-driver/qa-driver.mjs)
- [Package draft](../../../../.work/qa/snake-driver/package.draft.json)
- [Driver README](../../../../.work/qa/snake-driver/README.md)
- This report: `plans/verification/2026-10-24-snake-driver-preflight-kEUETV/preflight.md`

The script accepts explicit `--candidate-project`, `--base-url`, `--evidence-root`, and optional `--executable-path`; it contains no public URL. It uses two fresh headless Chromium contexts, the frozen 1440x900 viewport, exact frozen IDs, Playwright locators/keyboard/screenshot APIs, and `routeWebSocket` traffic forwarding. The route adds symmetric one-way delay derived from a configured 100–200 ms RTT target and jitter bound, records message timestamps/directions/types/sizes/dispositions with secret-key redaction, and never substitutes client-side delay or fake UI state.

## Frozen contract mapping

The harness checks all stable IDs from the wire contract exactly once in each context. It uses:

- `#create-room-button` and `#room-code` for cold creator flow.
- `#join-room-code` for cold guest entry; the frozen packet does not define a join-submit ID, so the draft submits with Enter and records this seam assumption.
- `#ready-button`, `#round-phase`, `#countdown-overlay`, `#countdown-label`, and the two player cards for ready/countdown observation.
- `#arena-focus-target`, `#direction-pad`, and keyboard arrows for real controls.
- `#results-panel`, `#rematch-panel`, `#pause-overlay`, `#error-panel`, `#connection-chip`, and `#latency-note` for opportunistic lifecycle captures.
- `#arena-canvas` and all HUD IDs for paired screenshots and later visual review.

No selector outside the frozen contract is required for the initial cold flow. A missing or non-unique frozen ID aborts the driver as a seam blocker rather than being worked around by invented selectors.

## Dependency and executable metadata

- Required later runtime: Node native ESM compatible with the owner contract (`>=22.12.0 <23`) plus a project-bound, exact-pinned Playwright package selected during a reserved stage.
- Browser API required later: Playwright `routeWebSocket`, fresh headless Chromium contexts, locator APIs, keyboard APIs, `BrowserContext.setOffline`, and screenshot APIs. Raw CDP/eval is intentionally not used.
- `package.draft.json` leaves the Playwright version as `REPLACE_WITH_EXACT_PIN_AFTER_RESERVED_STAGE`; no dependency was installed.
- The first PowerShell metadata probe was rejected by shell quoting before lookup; it launched nothing. A shell-safe retry also produced no Edge/Chrome/Playwright command output, and a minimal direct `Get-Command msedge.exe/chrome.exe` probe exited `1` with no output. This is metadata evidence only, not proof that no executable exists in other locations. No browser process was launched.
- The later reserved stage should use bounded `Test-Path`/`Get-Item` on an explicitly approved executable path or a corrected `Get-Command` probe, then record path, file version, size, and timestamp. Prefer existing Edge/Chrome; do not download globally.
- Project-local `npm` cache, Playwright browser cache/profile, `TEMP`, and `TMP` are specified under `.work/qa/snake-driver` in the README. None were created or populated by this preflight.

## Deferred commands (not run)

PowerShell setup and the exact driver command are recorded in the [driver README](../../../../.work/qa/snake-driver/README.md). In outline, the later reserved stage must:

1. Set `npm_config_cache`, `PLAYWRIGHT_BROWSERS_PATH`, `TEMP`, and `TMP` below `.work/qa/snake-driver`.
2. Copy the package draft to a project-bound manifest, replace the Playwright placeholder with the exact approved pin, and install only after explicit reservation/authorization.
3. Confirm candidate commit/build stamp, candidate project path, and authorized route before any browser run.
4. Supply an approved Edge/Chrome executable path and run `qa-driver.mjs` with an explicit evidence root, `--rtt-ms 150`, `--jitter-ms 25`, `--max-seconds 180`, and `--require-public` for any S10-relevant run.
5. Independently inspect every screenshot and sanitized event log. Re-run focused candidate tests using the candidate's discovered commands; do not treat the driver output as unit/security proof.
6. Write a separate `verify-report-<agent>.md` with PASS/FAIL/BLOCKED and exact evidence. The harness's observational exit status is not a verifier verdict.

No commands above were run. No install, npm/test/build/server/browser/page-opening, remote account, deployment, or descendant process was started.

## Coverage intended for the later run

The prepared driver can attempt independent contexts, cold create/join, exact selector inventory, both-ready/countdown observation, keyboard and direction-pad actions, synchronized screenshots, WebSocket message/timestamp logging, actual bidirectional delay forwarding, offline/reconnect captures, and same-context refresh/re-attach observation within a hard duration bound. The summary will label a non-HTTPS run `OBSERVED_LOCAL_ONLY_NOT_S10`; it never certifies S10.

Complex or security-sensitive checks remain explicitly deferred: deterministic apple and mushroom fixtures, collision priority and simultaneous death, timeout tiebreak/draw, board-full, malformed/oversized/flood limits, snapshot/output bounds, stale epoch/round/sequence rejection, old-socket control loss, bounded reconnect episodes, expiry, both-absent/server-loss, origin controls, credential-link/log audit, and focused rule/room/transport/security test results. The frozen packet requires those checks; the harness must not fabricate them.

The cold guest flow has one frozen-contract seam gap: there is no exact join-submit selector. The driver uses Enter on `#join-room-code`; if the candidate requires a separate submit control, the later verifier must report a records/spec seam finding or obtain an authorized static-contract clarification, not add a selector inside this harness.

## Known blockers and next setup

1. **No candidate/build:** baseline is intentionally unimplemented and the immutable candidate is supplied later. No behavior can be graded now.
2. **No authorized public HTTPS/WSS route:** S10 is blocked. A local route may be useful for non-S10 exploratory capture only and must remain labelled local-only.
3. **No installed/resolved Playwright dependency in this preflight:** install is deferred to the application-owned heavy stage under a project-bound cache/profile/TMP/TEMP root.
4. **No confirmed executable path:** bounded metadata probes returned no usable command path. Later stage must provide or safely discover an approved existing Edge/Chrome executable without launching it during discovery.
5. **No deterministic fixture mechanism supplied:** food/collision/timeout/board-full and narrow server-loss checks are gaps, not passes. Do not invent bots or unsafe endpoints.
6. **Account boundary:** the later run expects a user-authorized/prepared account/session if the candidate requires authentication; the harness does not create accounts or operate remote identity systems.
7. **Resource boundary:** parent remains the sole dispatcher and application lane owns the sole heavy reservation. This preflight created no watcher, descendant, server, browser, install, build, or test process.

**Next actual verification setup:** after the parent provides candidate provenance and an authorized route, reserve the heavy lane, resolve an existing approved Edge/Chrome path, pin/install Playwright only under `.work/qa/snake-driver`, run the bounded driver with `--require-public`, inspect all generated evidence, then perform fresh focused candidate tests and complete the independent S1–S10 report. Until those prerequisites exist, the correct state is BLOCKED/UNVERIFIED, not pass.

## Process accounting

Processes started for product/QA execution: none. The only command attempts were bounded PowerShell metadata lookups; both browser/executable discovery attempts returned no executable and launched no browser. No process ID is available or requires termination.
