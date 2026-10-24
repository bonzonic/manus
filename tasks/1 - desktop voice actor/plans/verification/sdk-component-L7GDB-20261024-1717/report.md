# Independent SDK Component Verification — `sdk-component-L7GDB-20261024-1717`

## Verdict

**PASS_SDK_COMPONENT** — the frozen v2 **C1 SDK-install/component boundary only** is independently verified from fresh measurements. This is not a full v2, B0, application, or M1–M9 pass.

## Scope and admission

- Frozen contract: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\contract-version-v2.md`
- Work item: `b0-toolchain-L7GDB`
- Verification reservation: `sdk-independent-verify-01`
- Fresh admission receipt: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\coordination\implementation-20261024-L7GDB\evidence\admission-sdk-independent-verify-start-01.json`
- Admission result: `go=true`; latest sample age was within the stated 30-second limit; physical memory reported by the receipt was `34,193,793,024` bytes.
- Verifier output directory: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\verification\sdk-component-L7GDB-20261024-1717`

Only read-only SDK/worktree inspection and process-local CLI diagnostics were performed. No network, package/model acquisition, restore, build, test, microphone, source edit, commit, push, deploy, or product/app operation was performed.

## Revision and provenance identity

- Frozen baseline Git SHA: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`.
- Independently observed current worktree `HEAD`: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`.
- `git status --porcelain=v1 --untracked-files=all`: empty.
- `git diff --quiet HEAD --`: exit `0`.
- `git diff --cached --quiet`: exit `0`.
- `candidateGitSHA`: **pending; no commit was authorized**. The archive and installed-tree SHA-256/SHA-512 values below are artifact fingerprints, not Git commits and are not labeled as candidate commits.
- Source/worktree integrity result: **PASS**; no verifier source/product output changes were observed.

The baseline tracked tree contains only `.gitignore`, `AGENTS.md`, and `README.md`. No tracked project-like path (`src`, tests, `.sln`, `.csproj`, `.fsproj`, or `.vbproj`) exists.

## Independent C1 measurements

### 1. Official archive identity and hashes

Archive under verification:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\dotnet-sdk-10.0.402-win-x64.zip`

The immutable acquisition manifest records the official Microsoft metadata/source URLs, target `win-x64`, SDK `10.0.402`, release/runtime `10.0.13`, expected SHA-512, byte count, and SHA-256. I independently recomputed the archive values:

| Measurement | Independent value | Recorded value | Result |
|---|---:|---:|---|
| Byte count | `300755826` | `300755826` | MATCH |
| SHA-256 | `24d057ab968986a9d7c7a01606b2a0192cbe6485221ba38e9c685522e93d8798` | same | MATCH |
| SHA-512 | `ae4fd528cb7e9f6af6aaf7de36715a69f761f183744f1bb3025d19f5a92447090ec561410e46266c1d10a63781ed6f3de771760bc76c876d87daabc367b898cd` | same | MATCH |

The acquisition manifest identifies the official SDK URL as `https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.402/dotnet-sdk-10.0.402-win-x64.zip`, with metadata from the official Microsoft release feed. This verifier performed no network request and independently verified the local archive against that retained immutable manifest.

### 2. Installed tree versus recorded install manifest

Install root:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet`

I independently enumerated and SHA-256-hashed every installed file and compared its relative path, byte length, and digest with all `5,577` records in `sdk-install-file-manifest.json`:

- Manifest file count: `5,577`; independent actual count: `5,577`.
- Manifest total bytes: `807,617,264`; independent actual total: `807,617,264`.
- Expected paths: `5,577`; actual paths: `5,577`.
- Missing/unexpected paths: `0` / `0`.
- Length or SHA-256 mismatches: `0`.
- `dotnet.exe` independent SHA-256: `abce6623a6729059cf39bb0f728c4a7804f625895099c88c17e6e704661e09eb`; recorded digest matched.

### 3. Direct archive-to-install comparison

I independently opened the local ZIP, hashed each decompressed file entry, and compared ZIP entry path, uncompressed length, and SHA-256 directly with the installed tree:

- ZIP file entries: `5,577`.
- Installed files: `5,577`.
- Missing installed paths: `0`.
- Unexpected installed paths: `0`.
- Length or content mismatches: `0`.
- Direct archive-to-install result: **PASS**.

### 4. Fresh absolute-path dotnet CLI measurements

Each command was launched by absolute path, without changing PATH or global environment settings:

```text
C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe --info
C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe --list-sdks
C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe --list-runtimes
```

The only verifier-injected process variables were:

```text
DOTNET_CLI_HOME=C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\verification\sdk-component-L7GDB-20261024-1717\evidence\temporary-home
DOTNET_CLI_TELEMETRY_OPTOUT=1
```

All three commands exited `0`; all emitted empty stderr. Owned PIDs were recorded as `36292`, `25864`, and `16876`, and all had exited by final cleanup inspection.

Observed `--info` values:

- SDK: `.NET SDK 10.0.402`; SDK commit `a8dd0577c`; MSBuild `18.9.15+a8dd0577c`.
- Host/runtime: `10.0.13`; architecture `x64`; host commit `4099f83977`.
- OS/RID: Windows `10.0.26200`, `win-x64`.
- SDK base path: the task-local `.work\tools\dotnet\sdk\10.0.402\`.
- `--list-sdks`: `10.0.402` only.
- `--list-runtimes`: `Microsoft.AspNetCore.App 10.0.13`, `Microsoft.NETCore.App 10.0.13`, and `Microsoft.WindowsDesktop.App 10.0.13` under the task-local root.
- Other architectures: none.
- Workloads: none installed.
- `global.json`: not found.

Informational stdout included the SDK's Learn More and Download URLs; those are printed text only. No download or restore was requested, and stderr contained no warnings.

## Baseline/default-entry-point observation

The real measurable baseline condition is an absence, not a fabricated old run: the frozen baseline has no tracked project, no `src`, no `Program.cs`, no `App.xaml`, and no `App.xaml.cs`. Therefore no baseline product/default entry point exists to launch or compare. This verifier did not temporarily remove the SDK or alter the worktree to manufacture a baseline.

The absence of a product entry point is recorded as a baseline condition only; it is not claimed as an application test or as evidence for any criterion beyond the SDK component boundary.

## Separate no-global-install regression guards

These are explicitly regression guards, not baseline behavioral proof. After the local absolute-path commands:

- `Get-Command dotnet`: not found.
- `where.exe dotnet`: exit `1`; `INFO: Could not find files for the given pattern(s).`
- `C:\Program Files\dotnet\dotnet.exe`: absent.
- `C:\Program Files (x86)\dotnet\dotnet.exe`: absent.
- Process, user, and machine `DOTNET_ROOT`, `DOTNET_ROOT(x86)`, `DOTNET_CLI_HOME`, and `NUGET_PACKAGES`: empty.
- Process/user/machine PATH scopes contained neither `dotnet` nor the task-local tool path.
- No-global-install guard result: **PASS**.

The verifier's private CLI home was under the owned evidence directory and contained zero files after the commands. No global PATH, registry, environment, security, or network setting was changed.

## Evidence retained

- Independent archive/install manifest comparison: `evidence\independent-hash-comparison.txt`
- Direct ZIP-entry/install comparison: `evidence\archive-to-install-content-comparison.txt`
- Fresh absolute CLI transcript, stdout/stderr/exits/PIDs: `evidence\verifier-dotnet-commands.txt`
- Source integrity, baseline absence, separate global guards, PID cleanup: `evidence\final-integrity-guards-and-cleanup.txt`
- Private CLI home: `evidence\temporary-home\`
- Immutable acquisition manifest: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\dotnet10-sdk-acquisition-2026-10-24T08-53-15-541Z.json`
- Recorded install manifest audited independently: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-install-file-manifest.json`
- Owner install handoff audited as provenance only: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-install-report.md`

## Unrun checks and boundaries

The following were intentionally not run and are not passes: NuGet/package restore or lock generation; WPF probe/product source creation; compile/build/test/publish; native sherpa/ONNX enumeration or loading; model acquisition, hash, or license verification; microphone/device access; inference; network/socket behavior; credential/provider/cloud calls; app launch/default-entry-point behavior; C2–C8; full v2/B0; and M1–M9. A later stage needs a separately admitted implementer/verifier for those checks under the frozen contract.

## Final process state

All verifier-owned dotnet PIDs exited. Remaining task-owned processes observed: **none**. No cleanup action beyond the safe per-PID exit inspection was required.
