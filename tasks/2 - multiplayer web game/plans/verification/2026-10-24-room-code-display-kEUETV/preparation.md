# Independent QA preparation — room-code display

**Run:** `2026-10-24-room-code-display-kEUETV`  
**Role:** independent verifier preparation only  
**Status:** prepared; no server, browser, test, install, network, or descendant process was run in this stage.

## Immutable inputs reviewed

- Baseline SHA: `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35`.
- Baseline project: `C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\worktrees\\snake-room-code-baseline-20261024-kEUETV\\project`.
- Candidate project: `C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\worktrees\\snake-room-code-fix-20261024-kEUETV\\project`.
- The approved product change scope remains only `public/dom-renderer.js` plus the focused client test; this preparation does not edit either product or test file.

The baseline source shows `createGameServer(config)` using the supplied mutable `allowedOrigins`, listening on the requested host/port, and returning an ephemeral actual port from `address()`. The actual CREATE request follows the browser's normal `#create-room-button` handler and the authoritative server emits a `welcome` frame containing `roomCode`. The frozen DOM contract requires the existing `--------` placeholder before welcome, then the authoritative code in `#room-code` and every `[data-copy-source="room-code"]` node.

## Prepared driver and fixture

The QA script uses the pinned Playwright 1.56.1 ESM entrypoint at `C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\tools\\browser-qa\\node_modules\\playwright\\index.mjs` and Chrome at `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`. Baseline and candidate each receive a fresh browser context with the same 1440×900 viewport and device scale factor 1. Each arm starts its own in-process server on `127.0.0.1` with `port: 0`, then appends the exact actual browser origin and same-port localhost origin to the same configured `allowedOrigins` array. No wildcard or origin bypass is used.

The browser captures sanitized incoming WebSocket frames through standard Playwright WebSocket events, retaining only `type` and optional `roomCode`; no credential or raw payload is persisted. It does not use page evaluation, CDP, fake sockets, fake welcome data, product test endpoints, or the OS clipboard. It captures a before and after viewport screenshot per arm, reads the actual welcome code independently of DOM readiness, and only then reads the header and all marked display-source values.

## Result and cleanup expectations

The script records its QA process PID immediately under the evidence root, then writes `run-result.json` with each arm's authoritative code, DOM values, source SHA, renderer source hash, code-support status, sanitized trace, screenshot paths, and cleanup receipt. Missing network welcome code is `BLOCKED`, not baseline RED. `PASS` is reserved for this local room-code display matrix only; it is not a whole-game, public S10, deployment, gameplay, reconnect, or MVP verdict. All owned contexts, browser connections, browser servers, and in-process game servers are closed in `finally` blocks, with owned PIDs recorded and no process-name kills.

The parent may run the exact command in `command-request.md` only after the candidate SHA is immutable. No execution result is claimed by this preparation document.
