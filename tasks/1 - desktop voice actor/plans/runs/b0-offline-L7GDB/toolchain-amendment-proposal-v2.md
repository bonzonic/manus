# Toolchain amendment proposal v2 — offline B0 dependency metadata

**Proposal ID:** `b0-toolchain-offline-v2-proposal`  
**Supersedes for the initial local path:** mandatory Azure payload/provider checks in the historical B0-T v1 packet  
**Does not modify:** `plans/runs/b0-toolchain-L7GDB/plan.md`, `handoff.md`, `evidence/provenance.md`, implementation report or network-diagnosis artifacts  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Status:** dependency metadata proposal only; actual toolchain owner must freeze v2 after restore/asset inspection before new implementation.

## Purpose and boundary

The approved initial provider is local sherpa-onnx bilingual streaming Paraformer. The historical B0-T contract was written for Azure and requires `Microsoft.CognitiveServices.Speech`/Azure native payload checks. This proposal removes those mandatory Azure payload checks for the offline path without editing the frozen v1 contract. The parent relays this proposal to the toolchain owner, who writes a separate actual v2 manifest/report. No package install, SDK download, model download, restore, build or native probe was performed here.

The v2 probe remains disposable and must target C#/.NET 10 LTS/WPF, `net10.0-windows`, Windows x64 `win-x64`, self-contained folder publish. It must prove managed restore, native load, model asset manifest handling and `--no-mic --no-network` behavior without creating product `src/` or calling a provider.

## Dependency/artifact inventory

| Role | Exact identity to resolve/freeze | Source/release support already verified | Status and required proof |
|---|---|---|---|
| SDK/runtime | Official .NET 10 SDK x64; exact patch/version | Existing retained .NET lifecycle evidence supports .NET 10 LTS; local SDK absent | `PENDING_TOOLCHAIN_V2`; record installer URL/hash, `dotnet --info`, host/x64 and task-local path only |
| Microphone | `NAudio.Wasapi`, stable 3.x exact version | Retained NAudio evidence verifies the modern WasapiRecorder/callback-copy guidance; exact compatibility not built | `PENDING_RESTORE`; resolve exact version and lock file; prove `DataFlow.Capture`, format and native/runtime assets |
| sherpa C# binding/runtime | `org.k2fsa.sherpa.onnx`, exact stable version | Official sherpa C# docs verify NuGet/prebuilt C# libraries, Windows architectures and online microphone APIs; examples reviewed target `net6.0` | `PENDING_RESTORE`; record exact package graph, target compatibility, native RID assets and hashes |
| ONNX runtime | The exact direct/transitive ONNX runtime package or native payload declared by the resolved sherpa package; do not guess a direct package ID | Official docs establish local ONNX deployment, not the exact package graph for this worktree | `PENDING_RESTORE`; record exact package ID/version if present, every `onnxruntime`/sherpa DLL path, architecture, SHA-256 and `NativeLibrary.Load` result |
| Native Windows x64 | All `org.k2fsa.sherpa.onnx`/ONNX Runtime native DLLs actually shipped by the resolved package graph | Windows x64 support is documented; filenames/versions for this restore are not | `PENDING_ASSET_MANIFEST`; enumerate rather than hard-code; load from publish output in the v2 probe |
| Model candidate | `sherpa-onnx-streaming-paraformer-bilingual-zh-en`, official int8 encoder/decoder variant | Official catalog verifies Chinese-English streaming, Windows path, mixed example and approximate int8 encoder/decoder sizes; model card declares Apache-2.0 | `PENDING_OFFICIAL_ARCHIVE`; exact archive revision, file names, tokens, sizes, SHA-256 and license/notice must be recorded after admitted preparation |
| Optional punctuation | Official sherpa Chinese-English punctuation model family (exact release only if benchmark-admitted) | Official punctuation docs verify post-ASR stage/model family, not quality or exact asset revision | `NOT_SELECTED_FOR_BASELINE`; never a hidden dependency; if evaluated, record exact files/hash/license/latency/revision behavior |

The official catalog's approximate int8 Paraformer files are 158 MB encoder plus 68 MB decoder before tokens/runtime. This is a planning hypothesis, not a local measurement or an exact archive manifest. The proposal does not invent filenames, package versions or hashes.

## Required v2 changes from Azure v1

Remove from the offline v2 mandatory payload/build gate:

- `Microsoft.CognitiveServices.Speech` package/reference and Azure native payload enumeration/load.
- Azure F0/Standard tier, region, key, provider request, cloud consent, quota and Azure privacy checks.
- `--no-cloud` as the sole provider guard; replace with `--no-mic --no-network --no-telemetry` offline self-check semantics.
- Any DPAPI/user-key prerequisite for initial local inference.
- Any assumption that Azure `Recognizing`/`Recognized` APIs define the local event contract.

Add to v2:

- `org.k2fsa.sherpa.onnx` exact package/native graph and Windows x64 load evidence.
- Exact model archive/token/punctuation (if any) asset manifest with source revision, byte length, SHA-256, architecture, license and notices.
- Offline self-check that loads the local model/runtime without opening the microphone, writing audio/transcript/history or making network connections.
- Network-disabled capture-to-final proof after assets are prepared; inspect sockets/process/network evidence and runtime fetch configuration.
- CPU-first model configuration, partial revision, endpoint/Stop/reset/fence behavior, no-speech/hallucination policy and benchmark manifest hooks.

Retain unchanged: task-local SDK, `net10.0-windows`, Windows x64, self-contained folder publish, locked restore, native load from publish, exact source/build/output manifests, no product source in the probe, no credential reads, no microphone in the toolchain probe, no commits/pushes/merges, and fresh independent verification.

## Toolchain owner handoff requirements

The toolchain owner must produce a separately frozen v2 contract/report before offline implementation. It must state exact package IDs/versions, target/RID, runtime graph, native DLL names/architectures/hashes, model-asset preparation boundary, license/notice evidence, commands/exit codes, no-mic/no-network side-effect proof and unresolved blockers. If official SDK connectivity remains unavailable, report `BLOCKED` and do not substitute a guessed package, archive, proxy, mirror or Azure dependency. This proposal is not a toolchain result.
