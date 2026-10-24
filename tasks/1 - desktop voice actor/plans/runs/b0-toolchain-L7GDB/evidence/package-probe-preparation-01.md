# B0-T v2 Package/Probe Preparation — `package-probe-prep-01`

**Work item:** `b0-toolchain-L7GDB`  
**Role:** distinct implementer, preparation stage only  
**Status:** **PREPARED_NOT_ACQUIRED_NOT_BUILT_NOT_VERIFIED**  
**Prepared:** 2026-10-24 17:33 +08:00

## Scope and admission

Work was confined to the assigned detached worktree:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`

The fresh finite-stage admission was:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\coordination\implementation-20261024-L7GDB\evidence\admission-package-probe-prep-start-01.json`

It recorded `go=true`, device `device:26d10d73-0966-4b78-b72f-9a97d38e8663`, 34,193,793,024 physical bytes, and samples within the stated 30-second age. The observed baseline remained detached `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; final `git status --porcelain=v1 --untracked-files=all` was empty for tracked state. No commit, merge, push, deployment, production `src/` tree, credential, environment/TLS/proxy change, microphone, model, provider, or cloud action occurred.

This stage used only local Node.js unit/dry-fixture validation. No NuGet metadata request, package-body transfer, restore, build, publish, native load, or probe launch was performed.

## Prepared artifacts

- Fixed direct-seed manifest: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget\nuget-direct-manifest-v2.json`
- Helper source: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget\nuget-acquisition-helper.js`
- Helper tests: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget\nuget-acquisition-helper.test.js`
- Source/hash manifest: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\package-probe-preparation-01-source-manifest.json`
- RED/GREEN receipt: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\package-probe-preparation-01-test-receipt.json`
- Metadata-only dry receipt: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\package-probe-preparation-01-metadata-dry-run.json`
- Disposable probe scaffold: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\b0-probe`

The scaffold contains only the WPF project/configuration and a content-free marker: `net10.0-windows`, `win-x64`, self-contained, nullable and implicit usings enabled, x64 platform, lock-file enabled, and the three owner-approved direct seeds. It has no microphone, recognizer/model construction, hotkey, insertion, onboarding, telemetry, network, credentials, audio/transcript/history, or user-facing workflow. No `.sln`, lock file, assets file, build output, or publish output was generated.

## Fixed package identities and provenance

The manifest records only the approved direct seeds:

1. `NAudio.Wasapi` `3.3.0`, MIT, listed stable, official registration/catalog/flat-container URLs, owner-retained official package size `253152` bytes and Base64 SHA-512.
2. `org.k2fsa.sherpa.onnx` `2.0.0`, Apache-2.0, listed stable, official registration/catalog/flat-container URLs, owner-retained official package size `210453` bytes and Base64 SHA-512.
3. `org.k2fsa.sherpa.onnx.runtime.win-x64` `2.0.0`, Apache-2.0, listed stable, exact official registration and flat-container URL, with the catalog leaf URL, package length, and package hash intentionally left pending because they were not retained in the owner evidence. No catalog URL or hash was guessed.

The helper accepts only HTTPS `api.nuget.org` prefixes for v3 index, registration, catalog, and flat-container routes. It derives registration/content paths from the fixed ID/version, requires `listed=true` and `isPrerelease=false`, accepts official SHA-512 as Base64 or 128-character hex, rejects foreign hosts/non-HTTPS/query/fragment/path-confused URLs, bounds redirects and response bytes, rejects unexpected content types, streams to an outside-source archive, reuses only an exact official hash match, preserves mismatches without overwrite, and never invokes `dotnet`, extracts archives, or executes package content. `metadata-only` and explicit `download` are separate CLI modes; download requires a fresh admitted JSON receipt with `go=true`, device, and samples and performs metadata-first resolution before bounded package transfer.

The binding’s platform/runtime graph is explicitly **not** claimed complete from these three direct seeds. The manifest requires a later actual SDK resolution to retain every package in `packages.lock.json`, `obj/project.assets.json`, and `dotnet list package --include-transitive`; no platform runtime is to be hand-pruned and no direct `Microsoft.ML.OnnxRuntime` package is added without proof.

## Test evidence

The required TDD sequence is retained in `package-probe-preparation-01-test-receipt.json`:

- **RED:** the focused Node test command exited `1` with all eight tests running against the intentional `NotImplemented` seam.
- **GREEN:** the same command exited `0`, with 9/9 tests passing.
- Coverage includes realistic registration leaf/catalog-shaped fixtures, identity/listed/prerelease/license checks, Base64/hex SHA-512, URL and redirect fencing, bounded streaming cleanup, exact reuse/mismatch preservation, no-execution metadata-only receipts, and explicit admitted fake-stream download hashing.
- The metadata-only CLI exited `0` over three bounded local fixtures. Its receipt records `executionAttempted=false`, `downloadAttempted=false`, and zero network/package-body transfer.

## Hard blockers and pending checks

This record does **not** pass C1-C8 or B0. The following remain pending or blocked until separately admitted:

- Official package acquisition on the parent’s explicitly network-enabled route; this worker did not use a network workaround or modify `MANUS_TERMINAL_NETWORK_DISABLED`, TLS, CA, proxy, or environment policy.
- Exact runtime registration/catalog metadata and official hash/length for `org.k2fsa.sherpa.onnx.runtime.win-x64 2.0.0`.
- Complete actual transitive/runtime graph under `net10.0-windows`/`win-x64`, including all platform entries the binding lists; `packages.lock.json`, `project.assets.json`, and `dotnet list package --include-transitive` are absent.
- Local package byte hashes/signature status, locked restore exit code, compatibility warnings, build/publish outputs, native DLL inventory/PE x64 evidence, and `NativeLibrary.Load`/`Free` results.
- The no-mic/no-network/no-telemetry guard, process/network/file/credential side-effect observation, model archive acquisition/hash/license manifest, and all recognizer/inference/quality work.

The visible final process inspection showed one `node.exe` PID `52788` without an ownership/command-line attribution available through this worker’s permitted inspection. It was not terminated because it was not safely attributable to this stage. No `dotnet.exe` process was visible. The parent should re-check and release/clean any task-owned process before the next admitted heavy stage.

## Exact invocations for the parent/coordinator

The already completed local metadata-only invocation was:

```powershell
node "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget\nuget-acquisition-helper.js" metadata-only --manifest "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget\nuget-direct-manifest-v2.json" --out "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\package-probe-preparation-01-metadata-dry-run.json" --fixture-dir "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget"
```

The parent-only diagnostic route remains separate and must be run only through the explicitly network-enabled parent path:

```powershell
node "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\parent-network-node-head-check.js" --receipt "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\parent-network-node-head-check-20261024-1635\receipt.json"
```

Only after a fresh parent admission and successful official-route check should the parent invoke the explicit transfer mode, with the fresh admission receipt substituted verbatim:

```powershell
node "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget\nuget-acquisition-helper.js" download --manifest "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget\nuget-direct-manifest-v2.json" --admission "<fresh-parent-package-acquisition-admission.json>" --out-dir "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\acquisition\nuget" --out "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\package-probe-preparation-01-download-receipt.json"
```

After acquisition, under a separate restore admission, the parent/next implementer must use the task-local SDK and process-scoped paths only:

```powershell
$env:DOTNET_ROOT="C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet"
$env:DOTNET_CLI_HOME="C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\dotnet-cli-home"
$env:NUGET_PACKAGES="C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\nuget-packages"
& "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe" restore "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\b0-probe\B0.ToolchainProbe.csproj" --locked-mode --runtime win-x64 --configfile "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\b0-probe\nuget.config" --packages $env:NUGET_PACKAGES
& "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe" list "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\b0-probe\B0.ToolchainProbe.csproj" package --include-transitive
```

Restore must stop on any unresolved package, incompatible target, missing lock, or warning/graph inconsistency. Build/publish/native-load/offline guard are separate later admissions; this preparation report must not be promoted to any of those verdicts.

## Final conclusion

This stage produced the permitted helper, fixed official metadata manifest, bounded source fixtures, and content-free WPF scaffold. It is **prepared only**. It did not acquire packages, resolve the full graph, build or publish the probe, load native libraries, run the offline guard, acquire the model, or verify B0.
