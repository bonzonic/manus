# B0 Toolchain / Build Prerequisites Handoff

**Work item:** `b0-toolchain-L7GDB`  
**Owner:** om-feature owner (contract only)  
**Assigned worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`  
**Canonical work-item directory:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB`  
**Approved architecture:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md`  
**Approved scope:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\decision.md`  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (detached HEAD; candidate identity pending)

## Recipient and separation

This packet is for a **distinct implementation agent**. The owner did not create a solution, install an SDK, restore packages, compile, publish, open a microphone, call Azure, or change product source. A fresh verifier must later rerun the gates in a separate `plans\verification\<unique-run-id>` directory and must not edit this owner packet or rely on the implementer's self-check as an independent verdict.

## What is frozen

B0 owns only toolchain/build feasibility:

1. Use C#/.NET 10 LTS/WPF targeting `net10.0-windows` and Windows x64 RID `win-x64`.
2. Install .NET only under the task worktree's `.work\tools\dotnet` if absent; no admin/global mutation.
3. Scaffold only a disposable probe under `.work\b0-probe`; do not create production `src/` projects.
4. Pin exact restored versions of `NAudio.Wasapi` 3.x and `Microsoft.CognitiveServices.Speech`; record them in the project and lock file. Version values are intentionally pending until real restore metadata exists.
5. Prove restore, Release build, self-contained `win-x64` publish, and native dependency loading without microphone or cloud calls.
6. Preserve Azure as the only initial provider and F0 default (5 audio hours/month, one stream). Do not introduce paid S0/Voice Live, a challenger provider, backend, fake transcript, or English-only fallback.
7. Stop on any hard gate failure. Do not silently weaken target framework, RID, self-contained behavior, native-load proof, or portability claim.

The complete criteria and future PowerShell command proposals are in [plan.md](plan.md).

## Current source/build reality

The detached worktree is an empty greenfield baseline: tracked files are only `.gitignore`, `AGENTS.md`, and `README.md`; there is no solution, project, `src/` directory, test runner, or existing build command. The baseline status was clean. `.gitignore` ignores `.work`, so disposable probe/tool outputs can remain task-local without broad staging. Do not assume the original checkout is safe to edit.

Current read-only inventory found:

- `dotnet`, `csc`, `msbuild`, and `vswhere`: not found on PATH.
- Standard .NET SDK, Visual Studio, and Windows Kits locations: not found.
- Task-local `.work\tools`, visible user NuGet cache, and local Microsoft dotnet cache: not found.
- Windows PowerShell and Git are available; Git reported `2.47.1.windows.1`.
- `tar.exe` is available; `7z`, `signtool`, and `dumpbin` are not available.
- Host reports Windows version `10.0.26200.0`, `PROCESSOR_ARCHITECTURE=AMD64`, and `Is64BitOperatingSystem=True`.
- VC runtime registry keys are present with version `v14.44.35211.00`; this does not prove the Azure package's native payload can load.
- WMI OS-caption inventory returned Access Denied and must not be treated as a product/toolchain pass.

## Implementer instructions

1. Request fresh coordinator admission for network/CPU/IO-heavy SDK download, restore, build, and publish. Do not start these heavy steps under stale capacity.
2. Reconfirm worktree path, detached baseline SHA, clean status, and absence of global `dotnet`. Record the commands and outputs in an implementation-owned evidence file.
3. Download the official `dotnet-install.ps1` only if the local SDK is still absent; record URL, retrieval timestamp, SHA-256, and exact installed SDK. Install into `.work\tools\dotnet` only. Do not print credentials or inspect unrelated secret stores.
4. Scaffold a WPF disposable probe in `.work\b0-probe`; do not implement speech/session/product behavior. Keep any generated source out of production directories.
5. Resolve and lock exact package versions for `NAudio.Wasapi` 3.x and `Microsoft.CognitiveServices.Speech`. Record the feed, package IDs/versions, dependency assets, and lock-file hash. If a package is incompatible with `net10.0-windows` or `win-x64`, report the hard blocker instead of changing the approved stack without approval.
6. Add deterministic no-mic/no-cloud checks. A valid check can inspect package assemblies and load actual native payloads with `NativeLibrary.Load`/`NativeLibrary.Free`; it must not create a recognizer, start `WasapiRecorder`, open a device, read a key, or make an HTTP/provider call.
7. Restore with locked metadata, build Release for `net10.0-windows`/`win-x64`, publish self-contained to a clean folder, launch the probe directly from that folder, and retain exit codes/stdout/stderr. Do not call this a clean-machine result unless a fresh verifier runs it on the required baseline.
8. Produce exact source/build manifests in new evidence files, for example `evidence/implementation-manifest-<timestamp>.md`, without overwriting `evidence/provenance.md`. Include source file hashes, SDK/package versions, commands, output file hashes, native DLL hashes/load status, architecture, RID, and self-contained setting.
9. Leave the disposable probe and manifests for the verifier, or clean only transient files after all manifests are complete. Do not commit, push, merge, deploy, or modify the original checkout.

## Independent verifier packet

The coordinator should dispatch a fresh verifier with the frozen `plan.md`, baseline SHA, implementer source/build manifests, published output path or byte archive, and a new verifier-owned path. The verifier must:

- Confirm baseline/candidate source manifests refer to the same claimed bytes and no unplanned product files.
- Re-run local SDK `--info`, locked restore, Release `win-x64` build, self-contained publish, and direct probe launch.
- Audit native DLL enumeration, x64 architecture, load results, file hashes, and any missing transitive dependency. `dumpbin` is optional, not a gate; the probe's exact loader evidence is required.
- Confirm no mic device open, no audio/transcript files, no credential reads, and no network/provider call in the no-cloud self-check.
- Distinguish the B0 toolchain verdict from all later M1–M9 product gates. Do not approve B1 on a missing SDK/package/native gate.

## Blockers and next-stage resource request

Current blockers are missing .NET 10 tooling/compiler, missing package cache/solution, and missing Azure key/region plus the consented evaluation corpus. The first three are B0 implementation prerequisites; the Azure inputs are not needed for offline toolchain probing but block later live speech/mixed-language gates.

The next stage needs coordinator admission for task-local SDK download, NuGet restore, compilation, and publish; writable `.work\tools` and `.work\b0-probe`; official package-feed access without user secrets; and a fresh independent verifier slot. No administrator elevation is requested.

**Focused user question:** When B0 reaches the later provider gate, can you provide your own Azure Speech resource key and region plus a consented 90-utterance evaluation corpus (30 English, 30 Mandarin, 30 mixed), or should the parent return that gate as blocked until those inputs exist?

**Status:** Ready for distinct implementation; not implemented, not built, not verified, and not shipped.
