# Room-code browser QA command request

Status: **prepared, not executed**. This is the one-shot independent browser check for the frozen room-code display defect. The parent must run it only after the immutable candidate commit SHA exists and with network-enabled direct Node execution.

Use the pinned Playwright 1.56.1 module resolved by the script from the task root's `.work/tools/browser-qa/node_modules/playwright/index.mjs`, and the installed Chrome executable at `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`. Invoke `node` directly; do not use PowerShell `Start-Process` or a wrapper that loses the QA process PID receipt.

```powershell
node "C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\plans\\verification\\2026-10-24-room-code-display-kEUETV\\room-code-browser-check.mjs" `
  --baseline-project "C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\worktrees\\snake-room-code-baseline-20261024-kEUETV\\project" `
  --candidate-project "C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\.work\\worktrees\\snake-room-code-fix-20261024-kEUETV\\project" `
  --candidate-sha "<immutable-candidate-sha>" `
  --evidence-root "C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\2 - multiplayer web game\\plans\\verification\\2026-10-24-room-code-display-kEUETV\\evidence"
```

The script owns only in-process ephemeral-port servers and its Playwright browser-server processes. It records its own `process.pid` immediately, starts each arm with `host: '127.0.0.1'`, `port: 0`, and a mutable `allowedOrigins` array, then appends the exact `new URL(baseURL).origin` and `http://localhost:<port>` values after `start()`. It does not touch the user's `localhost:10000` service or protected port `31417`.

Expected run-result status is `PASS` only for the scoped room-code display proof: baseline receives a real eight-character network welcome but retains `--------` on both DOM display surfaces, while candidate receives a real eight-character network welcome and renders the same code on both surfaces. A missing network welcome code is `BLOCKED`, never a baseline RED result. The script writes `run-result.json`, sanitized trace entries containing only `type` and optional `roomCode`, before/after screenshots, and cleanup receipts below `--evidence-root`.
