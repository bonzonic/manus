# B0 Toolchain v2 SDK Install Report — sdk-install-01

**Work item:** `b0-toolchain-L7GDB`  
**Stage:** `sdk-install-01`  
**Stage status:** `SDK INSTALL COMPLETE / LOCAL SDK COMMANDS VERIFIED`  
**Overall B0/v2 status:** `SDK-ONLY EVIDENCE; NOT A C1–C8 OR B0/PRODUCT PASS`  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (detached, clean before and after this setup)  
**Assigned worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`

## Admission and boundary

The sole stage admission was the fresh native GO receipt:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\coordination\implementation-20261024-L7GDB\evidence\admission-sdk-install-start-01.json`

The receipt has `go: true`, latest sample age within the stated 30-second limit, and reports 34,193,793,024 physical bytes. This stage performed only local extraction/installation of the already acquired official archive and the required installed-SDK inspection. It did not download, restore NuGet packages, scaffold a probe/product, build or test product code, access a microphone, load a model, call a provider, read credentials, commit, push, deploy, or change global PATH/registry/environment/security/network settings.

The worktree remained at the frozen detached baseline. Final `git rev-parse HEAD` was `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; final `git status --porcelain=v1` was empty.

## Official archive verification before extraction

Acquisition runtime manifest:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\dotnet10-sdk-acquisition-2026-10-24T08-53-15-541Z.json`

Archive:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\dotnet-sdk-10.0.402-win-x64.zip`

| Field | Result |
|---|---|
| Official metadata URL | `https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json` |
| Official SDK URL | `https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.402/dotnet-sdk-10.0.402-win-x64.zip` |
| Selected SDK | `10.0.402` |
| Release version | `10.0.13` |
| Archive byte count | `300755826` |
| Manifest byte count match | `true` |
| Expected SHA-512 | `ae4fd528cb7e9f6af6aaf7de36715a69f761f183744f1bb3025d19f5a92447090ec561410e46266c1d10a63781ed6f3de771760bc76c876d87daabc367b898cd` |
| Independently recomputed SHA-512 | `ae4fd528cb7e9f6af6aaf7de36715a69f761f183744f1bb3025d19f5a92447090ec561410e46266c1d10a63781ed6f3de771760bc76c876d87daabc367b898cd` |
| SHA-512 match | `true` |
| Manifest SHA-256 | `24d057ab968986a9d7c7a01606b2a0192cbe6485221ba38e9c685522e93d8798` |
| Independently recomputed SHA-256 | `24d057ab968986a9d7c7a01606b2a0192cbe6485221ba38e9c685522e93d8798` |
| SHA-256 match | `true` |

The archive was present, complete, and matching before any extraction action. No re-download or alternate source was used.

## Destination and traversal preflight

Install destination:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet`

The destination existed before this stage but contained **zero files and zero subdirectories**. Therefore extraction did not overwrite pre-existing unrelated data. The archive contained 5,577 entries. Every entry was checked for rooted paths, `..` parent segments, leading separators, and NUL characters; `zip_bad_traversal_count=0`. Observed top-level names were `dnx.cmd`, `dotnet.exe`, `host`, `LICENSE.txt`, `packs`, `sdk`, `sdk-manifests`, `shared`, `templates`, and `ThirdPartyNotices.txt`.

## Exact extraction command and result

The archive was extracted locally with the .NET ZIP API after the preflight above. Exact PowerShell command body:

```powershell
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$wt='C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB'
$arc=Join-Path $wt '.work\acquisition\dotnet-sdk-10.0.402-win-x64.zip'
$dst=Join-Path $wt '.work\tools\dotnet'
$exit=0
try {
  [IO.Compression.ZipFile]::ExtractToDirectory($arc,$dst)
  Write-Output 'extraction=completed'
} catch {
  $exit=1
  Write-Error $_
  Write-Output 'extraction=failed'
}
Write-Output ('extraction_exit=' + $exit)
exit $exit
```

Result: `extraction=completed`; `extraction_exit=0`.

## Installed SDK commands and results

The installed executable was invoked by absolute path; no global PATH modification was made:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe`

Exact commands, each with exit 0:

```text
C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe --info
C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe --list-sdks
C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe --list-runtimes
```

Complete stdout/stderr and exit evidence is preserved at:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-install-dotnet-commands.txt`

Reported values:

- SDK: `.NET SDK 10.0.402`, commit `a8dd0577c5`, MSBuild `18.9.15+a8dd0577c`.
- Host: `10.0.13`, architecture `x64`, commit `4099f83977`.
- OS: Windows, version `10.0.26200`, platform Windows, RID `win-x64`.
- SDK base path: `...\.work\tools\dotnet\sdk\10.0.402\`.
- Installed SDK list: `10.0.402` only.
- Installed runtimes: `Microsoft.AspNetCore.App 10.0.13`, `Microsoft.NETCore.App 10.0.13`, and `Microsoft.WindowsDesktop.App 10.0.13`.
- Other architectures: none.
- Workloads: none installed; workload installation was not attempted.
- `global.json`: not found.

Process-scoped variables used only for these commands were:

```text
DOTNET_CLI_HOME=<worktree>\.work\dotnet-cli-home
NUGET_PACKAGES=<worktree>\.work\nuget-packages
DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
DOTNET_CLI_TELEMETRY_OPTOUT=1
DOTNET_NOLOGO=1
DOTNET_MULTILEVEL_LOOKUP=0
DOTNET_ROOT=<worktree>\.work\tools\dotnet
```

No global environment variables were changed. The command transcript shows the resolved local paths.

## Extracted file manifest

The complete manifest records every extracted file path, byte length, and SHA-256:

- CSV: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-install-file-manifest.csv`
- JSON summary and full file records: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-install-file-manifest.json`

Manifest totals: `5,577` files; `807,617,264` total bytes. `dotnet.exe` is 167,208 bytes with SHA-256 `abce6623a6729059cf39bb0f728c4a7804f625895099c88c17e6e704661e09eb`.

Evidence file sizes and SHA-256 values at final check:

| File | Bytes | SHA-256 |
|---|---:|---|
| `sdk-install-dotnet-commands.txt` | 4,326 | `086bd82d561ff5803ea5fed0b1a5d2725bd4b437480001b58bd017a9d1eed2f3` |
| `sdk-install-file-manifest.csv` | 928,528 | `7de26c97e9161770f5769f1723f6b04ccc44b809bcd94f1bce19c130e9d98e04` |
| `sdk-install-file-manifest.json` | 1,760,074 | `92f70f8b09d99acd6b57554fb30a79396397add661add82fc248337cc1a2109d` |

## Process cleanup and unavailable checks

The non-WMI `Get-Process -Name dotnet` fallback observed no running `dotnet` process after the commands, so no task-owned process cleanup was needed. A WMI `Get-CimInstance Win32_Process` query and `tasklist` both returned local `Access denied`; executable ownership/command-line enumeration through those routes is therefore unavailable and is not claimed as verified. No remaining task-owned process was observed by the available fallback check.

Out-of-scope checks intentionally not performed in this stage: NuGet/package restore or lock generation, WPF probe/product source creation, build/test/publish, native sherpa/ONNX loading, model acquisition or model hash/license verification, microphone access, inference, provider/cloud calls, credentials, network/socket behavior, and C1–C8/B0 verification. These remain pending or blocked under the frozen v2 handoff.

## Warnings and next prerequisite

This report proves only local official SDK archive integrity, safe extraction, placement, and installed SDK/runtime command output. It does not independently verify the acquisition route, package graph, model assets, product behavior, offline guard, or any B0 criterion. The informational `dotnet --info` help/download URLs were printed by the SDK but no download or restore was requested by this stage.

Next prerequisite: a separately admitted implementer may create only the disposable `.work\b0-probe`, then acquire/restore the exact official locked `NAudio.Wasapi` and `org.k2fsa.sherpa.onnx` graph under the approved v2 process. Exact official Paraformer model/archive and license/hash evidence is still absent. After dependency/probe work, a fresh independent verifier must repeat the frozen v2 checks from a separate verification directory; this SDK-install worker does not claim C1–C8 or B0/product PASS.
