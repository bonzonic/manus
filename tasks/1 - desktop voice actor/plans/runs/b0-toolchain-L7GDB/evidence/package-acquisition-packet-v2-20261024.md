# B0 v2 Distinct Implementer Packet — Package Acquisition and Disposable Probe

**Work item:** `b0-toolchain-L7GDB`  
**Packet version:** `package-acquisition-packet-v2-20261024`  
**Recipient:** one distinct implementer; a fresh verifier must use a separate verification directory.  
**Status:** ready for fresh coordinator admission; no implementation or acquisition is authorized by this packet alone.

## Exact scope

Work only in:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`

Use the already verified task-local SDK:

`<worktree>\.work\tools\dotnet\dotnet.exe`

SDK evidence path:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-install-report.md`

Create only the disposable probe directory:

`<worktree>\.work\b0-probe`

Acquisition files and caches must stay outside source, for example:

- `<worktree>\.work\acquisition\nuget\`
- `<worktree>\.work\acquisition\model\`
- `<worktree>\.work\nuget-packages\`

Do not create or modify a production `src/` tree, product solution, user settings, registry/environment policy, global PATH, proxy/VPN/TLS configuration, credentials, microphone state, or cloud/provider resource.

## Required admission and baseline

Before any restore/download/build/publish operation, obtain a fresh coordinator/device admission for that finite heavy stage. Record detached HEAD, baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`, clean status, local SDK absolute path, process-scoped `DOTNET_*`/`NUGET_PACKAGES` values, and the admission receipt. The independent SDK C1 verification belongs to the parent and must not be reused as this implementer’s verdict.

If the explicit official HTTPS route is unavailable, stop `BLOCKED`. Do not unset `MANUS_TERMINAL_NETWORK_DISABLED`, bypass Schannel/certificate policy, install a CA, use a mirror/proxy/VPN, use browser login, read credentials, or retry an unchanged failed route.

## Exact intended package manifest

Prepare a machine-readable manifest before restore. It must contain package ID, exact version, official page, official registration/catalog URL, official flat-container content URL, listed/prerelease state, license, metadata retrieval timestamp, and fields for locally observed byte length, SHA-256, SHA-512, package signature status and acquisition timestamp.

The intended direct entries are:

```text
NAudio.Wasapi                                      3.3.0
org.k2fsa.sherpa.onnx                              2.0.0
org.k2fsa.sherpa.onnx.runtime.win-x64              2.0.0  (explicit Windows x64 pin)
```

The official package content URL patterns are:

```text
https://api.nuget.org/v3-flatcontainer/naudio.wasapi/3.3.0/naudio.wasapi.3.3.0.nupkg
https://api.nuget.org/v3-flatcontainer/org.k2fsa.sherpa.onnx/2.0.0/org.k2fsa.sherpa.onnx.2.0.0.nupkg
https://api.nuget.org/v3-flatcontainer/org.k2fsa.sherpa.onnx.runtime.win-x64/2.0.0/org.k2fsa.sherpa.onnx.runtime.win-x64.2.0.0.nupkg
```

Use only `https://api.nuget.org/v3/index.json`/official NuGet v3 registration and flat-container endpoints. Do not substitute a feed mirror. Resolve the complete transitive graph with the task-local SDK; record every package in `packages.lock.json`, `obj/project.assets.json`, and `dotnet list package --include-transitive`. The sherpa binding’s official `net10.0` group lists multiple platform runtime dependencies at `[2.0.0, )`; do not hand-edit that graph or claim that a direct Windows x64 pin removed other restored packages. Publish/RID selection must be proven from actual assets.

Do not add `Microsoft.ML.OnnxRuntime` or any other ONNX package unless the actual official resolved graph proves it is a dependency. If the package graph cannot resolve cleanly for `net10.0-windows`/`win-x64`, stop with the exact restore error and do not downgrade or replace the binding.

## Mechanical metadata/acquisition helper boundary

A distinct implementer may author a small Node or PowerShell helper under `<worktree>\\.work\\acquisition\\` only. It must:

1. Accept a fixed JSON package list and fixed allowlist of `api.nuget.org` HTTPS URL prefixes.
2. Read registration metadata first and require the requested version to be `listed=true` and `isPrerelease=false` where provided.
3. Reject non-HTTPS URLs, hosts outside the allowlist, redirects outside the allowlist, oversized responses, unexpected content type, and any path not derived from the fixed ID/version.
4. Download only after an admitted acquisition stage; stream to a file outside source, enforce a finite byte limit, compute SHA-256 and SHA-512, and compare against the recorded official metadata when available.
5. Emit JSON with URL, final URL, redirects, timestamps, byte count, hashes, exit code and error class. Never print package/model contents or secrets.
6. Never alter TLS/CA/proxy/environment settings, never invoke `dotnet restore`, never build, and never delete or overwrite an existing archive unless an exact hash match has been proven.

Because official feed metadata was readable in this owner stage, no executable helper is authored here. The implementer must record the helper source hash and a dry-run metadata receipt if it authors one.

## Probe scaffold and locked restore milestones

The implementer may scaffold only a minimal WPF project under `<worktree>\\.work\\b0-probe` targeting:

```xml
<TargetFramework>net10.0-windows</TargetFramework>
<RuntimeIdentifier>win-x64</RuntimeIdentifier>
<SelfContained>true</SelfContained>
<Nullable>enable</Nullable>
<ImplicitUsings>enable</ImplicitUsings>
<Platforms>x64</Platforms>
```

The probe is a toolchain/native-load probe, not product code. It must not open a microphone, instantiate a live recognizer, read credentials, load model weights, make a socket call, create audio/transcript/history files, emit content-bearing logs, or implement hotkeys/insertion/overlay/user behavior.

Use a locked restore only after the exact package manifest is recorded. Record the full restore command, exit code, stdout/stderr, `packages.lock.json` hash, `project.assets.json` hash, package graph, target/RID and local cache path. A missing package, warning promoted to incompatibility, unresolved native asset or non-reproducible lock is a hard blocker.

Then, only under separate build/publish admission:

1. Release build for `net10.0-windows` and `win-x64` with task-local SDK.
2. Self-contained folder publish, not single-file.
3. Enumerate every sherpa/ONNX/native file actually present in restore/publish output, with source package/path, byte length, SHA-256, PE architecture and any license/notice file.
4. Prove `NativeLibrary.Load` and `NativeLibrary.Free` for each required x64 native DLL from the publish directory. The probe may inspect/load native libraries but must not instantiate a recognizer or process model/audio.
5. Run only the deterministic guard `--no-mic --no-network --no-telemetry`; observe process/network/file/credential side effects with content-free logs. A clean command exit is not enough.

Required evidence files are new implementation-owned records, never overwrites of owner/verifier records:

- `implementation-manifest-v2-<timestamp>.md`
- `package-graph-v2-<timestamp>.md`
- `native-assets-v2-<timestamp>.md`
- `offline-guard-v2-<timestamp>.md`
- `model-assets-v2-<timestamp>.md` (blocked explicit record until model acquisition)

## Model preparation boundary

The official model source is the exact release archive:

`https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-paraformer-bilingual-zh-en.tar.bz2`

Model preparation is separate from package restore and requires separate admission. Before any later local inference worker uses it, record archive final URL, revision/release identity, archive byte length, SHA-256/SHA-512, complete extracted file list and hashes, `tokens.txt` hash, int8 encoder/decoder hashes, Apache-2.0/license/notice evidence, and source/conversion attribution. Do not treat the official page’s human-readable approximate file sizes as hashes or a complete manifest. Do not add punctuation.

## Stop conditions

Stop and return `BLOCKED` on unavailable official route, missing exact metadata, prerelease-only identity, failed locked restore, incompatible target, missing/incorrect x64 native payload, failed native load, network/file/credential side effect, or absent model licensing/hash evidence. Never fake a pass, use a preview, switch to Azure, use final-only Whisper, or lower the live-partial/bilingual/offline gates.
