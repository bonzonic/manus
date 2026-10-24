# Deferred v2 verifier command request

**Status:** prepared only; not executed in this QA-preparation lane.

The parent must execute this exact command only after the distinct implementer has produced the immutable v2 candidate commit and the parent has recorded its SHA. Replace only the `<V2_...>` placeholders. Do not substitute the mutable repair worktree, the v1 candidate SHA, or localhost for public S10 evidence.

## Required immutable inputs

- Candidate project: `<V2_CANDIDATE_PROJECT>` — the parent-owned immutable v2 project directory.
- Expected candidate SHA: `<V2_COMMIT_SHA>` — exactly 40 lowercase/uppercase hexadecimal characters.
- Evidence root: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-candidate-v2-kEUETV\evidence`
- Verifier: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-candidate-v2-kEUETV\snake-verifier-v2.mjs`
- Existing Playwright 1.56.1 root: `C:\Users\wongn\Documents\Interview\Manus\.work\tools\browser-qa`
- Chrome executable: `C:\Program Files\Google\Chrome\Application\chrome.exe`

## PowerShell command

Run from the candidate project or the task workspace; the absolute paths below are intentional. This uses `Start-Process -PassThru` and `-Wait`, records the exact conduit PID before waiting, and does not kill by process name or inspect/terminate unrelated Node/Chrome processes.

```powershell
$ErrorActionPreference = 'Stop'
$verifier = 'C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-candidate-v2-kEUETV\snake-verifier-v2.mjs'
$candidateProject = '<V2_CANDIDATE_PROJECT>'
$expectedSha = '<V2_COMMIT_SHA>'
$evidenceRoot = 'C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-candidate-v2-kEUETV\evidence'
$playwrightRoot = 'C:\Users\wongn\Documents\Interview\Manus\.work\tools\browser-qa'
$arguments = @(
  $verifier,
  '--candidate-project', $candidateProject,
  '--evidence-root', $evidenceRoot,
  '--playwright-root', $playwrightRoot,
  '--expected-sha', $expectedSha,
  '--rtt-ms', '150',
  '--jitter-ms', '25',
  '--max-seconds', '180'
)
$start = Get-Date
$process = Start-Process -FilePath 'node.exe' -ArgumentList $arguments -WorkingDirectory $candidateProject -PassThru -RedirectStandardOutput (Join-Path $evidenceRoot 'conduit.stdout.log') -RedirectStandardError (Join-Path $evidenceRoot 'conduit.stderr.log')
@{
  status = 'STARTED'
  conduitPid = $process.Id
  startedAt = $start.ToUniversalTime().ToString('o')
  candidateProject = $candidateProject
  expectedSha = $expectedSha
  command = 'node snake-verifier-v2.mjs --candidate-project <V2_CANDIDATE_PROJECT> --evidence-root <EVIDENCE_ROOT> --playwright-root <PLAYWRIGHT_ROOT> --expected-sha <V2_COMMIT_SHA> --rtt-ms 150 --jitter-ms 25 --max-seconds 180'
} | ConvertTo-Json | Set-Content -Encoding UTF8 (Join-Path $evidenceRoot 'parent-process-start.json')
$process.WaitForExit()
$end = Get-Date
@{
  status = 'EXITED'
  conduitPid = $process.Id
  exitCode = $process.ExitCode
  startedAt = $start.ToUniversalTime().ToString('o')
  endedAt = $end.ToUniversalTime().ToString('o')
  processReceipt = Join-Path $evidenceRoot 'process-receipt.json'
  stdout = Join-Path $evidenceRoot 'conduit.stdout.log'
  stderr = Join-Path $evidenceRoot 'conduit.stderr.log'
} | ConvertTo-Json | Set-Content -Encoding UTF8 (Join-Path $evidenceRoot 'parent-process-exit.json')
Get-Content (Join-Path $evidenceRoot 'parent-process-exit.json')
```

## Execution gates and interpretation

1. Before starting, verify the v2 project is immutable, detached/identified by `<V2_COMMIT_SHA>`, and distinct from the v1 candidate and mutable repair checkout. Record that identity outside this script as parent evidence.
2. Do not add `--headed`, do not replace `routeWebSocket`, do not use raw CDP or `page.evaluate`, and do not lower the RTT/jitter settings. The script launches Chrome through Playwright `chromium.launchServer`, connects with Playwright `chromium.connect`, and records the exact Playwright child PID.
3. The verifier starts the candidate server in-process; its server PID is the exact conduit PID. The script closes only its own server handle, browser contexts, Playwright browser connection/server, and route timers. The parent records the `Start-Process` PID and exit code. Never kill `52788`, `53440`, a process by name, or an unknown process.
4. Inspect `run-result.json`, `trace-sanitized.json`, `process-receipt.json`, `parent-process-start.json`, `parent-process-exit.json`, and every listed screenshot. The script produces measurements pending independent grading; it does not issue a PASS.
5. S10 remains `BLOCKED` for this local command. A localhost HTTP/WS run cannot satisfy the frozen public HTTPS/WSS requirement. Do not append a public URL or relabel this run as S10 proof unless a separately authorized public route is supplied and independently measured.
