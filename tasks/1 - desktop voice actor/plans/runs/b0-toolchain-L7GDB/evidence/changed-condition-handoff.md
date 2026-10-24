# B0 Toolchain Changed-Condition Handoff

- **Work item:** `b0-toolchain-L7GDB`
- **Status:** **READY ONLY AFTER OUTBOUND TERMINAL NETWORK IS ENABLED; currently blocked**
- **Owner diagnosis:** Same-role successor to the B0 toolchain feature owner
- **Assigned worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`
- **Canonical run folder:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB`
- **Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (detached; source/probe absent)
- **Diagnosis:** [`network-diagnosis.md`](network-diagnosis.md)
- **Prior implementation report:** [`implementation-report.md`](implementation-report.md)
- **Prior provenance:** [`provenance.md`](provenance.md)

## Verified condition and blocker

The current terminal process reports `MANUS_TERMINAL_NETWORK_DISABLED=1`. DNS resolves both official endpoints, but TCP/443 returns `Bad access`/curl exit 7 for both:

- `https://dot.net/v1/dotnet-install.ps1`
- `https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json`

No TLS or HTTP response was reached. The available terminal invocation exposes no `network:true` parameter, and discovery exposed no browser/device-network MCP route. The condition was not overridden. The prior worker's resource admission was GO; this is a capability/network blocker, not a resource-pressure blocker. No code-retry allowance was consumed.

## Smallest authorized changed condition

Before a retry, the coordinator/user must provide a fresh device terminal execution route with outbound network explicitly enabled (request `network:true` if supported by the current terminal tool). The route must be official-endpoint-only and must not require proxy/VPN changes, TLS downgrades, privilege elevation, credentials, or registry changes. If the next worker still observes `MANUS_TERMINAL_NETWORK_DISABLED=1`, `Bad access`, or equivalent TCP denial, it must stop and report the unchanged blocker; it must not unset the variable or attempt a workaround.

After enabling the condition, the first lightweight check should be:

```powershell
$ErrorActionPreference='Stop'
$urls=@(
  'https://dot.net/v1/dotnet-install.ps1',
  'https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json'
)
foreach($u in $urls){
  Write-Output "=== $u ==="
  & curl.exe --verbose --silent --show-error --location --head --max-time 10 --connect-timeout 5 --url $u 2>&1
  Write-Output "curl_exit=$LASTEXITCODE"
}
```

Proceed to SDK download only if the coordinator admits the heavy stage after this condition check succeeds.

## Exact prompt for a NEW DISTINCT implementer

> You are a **new distinct B0-T implementation worker** for work item `b0-toolchain-L7GDB`, not the prior blocked worker and not the owner/verifier. Continue the frozen B0 contract in `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\plan.md` and handoff. Work only in `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`; baseline must remain detached at `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`. Do not edit the original checkout, create production `src/`, commit, push, merge, deploy, use credentials, open a microphone, call Azure, or weaken any B0 gate.
>
> **Precondition/admission:** obtain fresh coordinator admission for the heavy SDK download/restore/build/publish stage. The device terminal must have outbound network explicitly enabled by the platform; request `network:true` where the current terminal API supports it. First confirm `MANUS_TERMINAL_NETWORK_DISABLED` is absent/false and run the bounded official-endpoint HEAD check from `changed-condition-handoff.md`. If TCP remains denied, stop with a blocked report; do not unset environment variables, alter proxy/VPN/TLS/registry settings, use an unofficial mirror, or retry heavily. Resources were previously GO, but that admission is stale for this new heavy attempt.
>
> If the lightweight check succeeds, implement the original frozen C1-C7 only: (1) record worktree SHA/status and absence of global `dotnet`; (2) download the official `https://dot.net/v1/dotnet-install.ps1`, record retrieval timestamp and SHA-256, and install .NET 10 x64 only under `.work\\tools\\dotnet`; (3) record exact local `dotnet --info`; (4) scaffold only `.work\\b0-probe\\B0.ToolchainProbe.sln` and WPF `net10.0-windows` app; (5) resolve real exact stable versions of `NAudio.Wasapi` 3.x and `Microsoft.CognitiveServices.Speech` from the permitted official package feed, record dependency graph and lock file, and do not invent versions; (6) restore locked, build Release `net10.0-windows`/`win-x64`, publish self-contained folder `win-x64`, and run only the deterministic `--no-mic --no-cloud` probe; (7) enumerate actual published native dependencies, record x64/hash/load results, command exit codes, source/output manifests, and no-network/no-mic observations in a new implementation-owned evidence file. Preserve `provenance.md` and the prior `implementation-report.md`; do not overwrite them. Leave the disposable probe and manifests for a fresh verifier. Stop on any C1-C7 hard-gate failure. Return exact evidence paths and status; do not call the verifier or downstream B0 stages yourself.

## Admission/resource request

The next attempt needs:

1. Fresh coordinator admission for a network-enabled terminal and the finite heavy stages: official SDK retrieval, NuGet restore, Release build, self-contained publish.
2. Writable task-local paths under `.work\\tools\\dotnet` and `.work\\b0-probe` with no administrator elevation.
3. Official dot.net/Microsoft SDK and permitted NuGet feed access without user secrets.
4. A separate fresh verifier slot after implementation completes; verifier evidence must live outside this owner/implementer evidence directory.
5. No microphone, Azure key/region, browser login, provider call, or evaluation corpus for B0.

The changed condition is not currently available in this session. If the coordinator cannot provide it, the focused user action is: **enable outbound network for the device terminal (the platform's `network:true` capability) or run the exact implementer prompt in an approved network-enabled device session; do not weaken the frozen C1-C7 contract.**
