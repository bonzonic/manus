# B0 Toolchain and Build Prerequisites Plan v2 — Offline-first

**Work item:** `b0-toolchain-L7GDB`  
**Version:** `v2`  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (detached)  
**Owner stage:** toolchain contract only; no product implementation  
**Status:** **BLOCKED/PENDING admitted acquisition**; no v2 SDK, package restore, model archive, build, probe, microphone, or inference run has occurred.

## 1. Problem statement

The frozen B0-T v1 packet was written for an Azure-first release and made `Microsoft.CognitiveServices.Speech` plus Azure-native payload loading mandatory. The approved architecture and decision are now amended to **offline-first with live partials and bilingual streaming Paraformer**. This v2 packet is a new, explicitly versioned toolchain contract; it does not rewrite `plan.md`, `handoff.md`, `evidence/provenance.md`, `evidence/implementation-report.md`, or `evidence/network-diagnosis.md`. The v1 packet remains historical and did not pass.

The initial local path must use a task-local official .NET 10 SDK, C#/.NET 10 LTS/WPF, `net10.0-windows`, and `win-x64`, with a disposable probe only. It must establish exact package/native/model identities before any product owner proceeds. Local inference must later run with networking disabled after assets are prepared; this is an execution gate, not a claim already demonstrated.

## 2. Architecture changes (v2 delta from v1)

**Retained unchanged:** task-local SDK under the assigned worktree’s `.work\tools\dotnet`; disposable probe under `.work\b0-probe`; `net10.0-windows`; WPF; `win-x64`; locked restore; self-contained folder publish; native loading from the publish directory; exact source/build/output manifests; no product `src/`; no microphone or credentials in the probe; no commits/pushes/merges; and fresh independent verification. C1–C7 provenance and no-mic/no-cloud safety principles remain, but their provider-specific meanings are revised below.

**Removed from the offline v2 mandatory gate:** `Microsoft.CognitiveServices.Speech`; Azure native payload loading; Azure tier/region/key/quota/consent/privacy/provider-request checks; DPAPI/user-key prerequisites; and any assumption that Azure `Recognizing`/`Recognized` defines the local event contract. `--no-cloud` alone is no longer sufficient.

**Added/replaced for v2:**

- Approved local microphone dependency identity: `NAudio.Wasapi`, exact stable 3.x version after real restore.
- Approved local recognizer identity: `org.k2fsa.sherpa.onnx`, exact stable version after real restore, with its actual dependency graph and Windows x64 native assets.
- ONNX Runtime identity is the exact direct/transitive package or native payload resolved by the sherpa graph; no direct package ID or version may be invented.
- Approved model candidate: `sherpa-onnx-streaming-paraformer-bilingual-zh-en`, official int8 encoder/decoder variant. Exact archive revision, filenames, tokens, byte lengths, hashes, Apache-2.0 license/notice evidence remain pending admitted preparation.
- Offline self-check flags: `--no-mic --no-network --no-telemetry`; no audio/transcript/history writes, no credential read, no runtime fetch, and no socket connection.
- Later network-disabled inference gate after assets are prepared: local model/runtime load, bounded PCM-to-partial/final path, partial revision, Stop/reset/session fencing, no-speech behavior, and benchmark hooks. This gate belongs to a distinct implementer and verifier; it is not a toolchain-owner result.
- Optional punctuation remains **not selected for baseline**. If benchmarked, it needs its own exact release, files, hashes, license/notice, latency and revision evidence; it is never silently added.

The product provider-neutral event contract remains outside this disposable probe. The probe may inspect assembly identities and load native dependencies, but must not instantiate a live recognizer or open a microphone.

## 3. User/developer flow

1. A parent-only acquisition phase, under an explicitly network-enabled route, performs bounded official endpoint HEAD/metadata checks and—only after a fresh distinct implementer admission—downloads the official SDK/model/package inputs. SDK ZIP/archive files stay outside source under `.work\tools\acquisition` or the worktree’s `.work\acquisition`, with URLs and SHA-256 hashes. No heavy archive is requested in the owner stage.
2. A separate implementer confirms the assigned detached worktree and baseline, installs the SDK only under `.work\tools\dotnet`, and records exact `dotnet --info`.
3. The implementer scaffolds only `.work\b0-probe`, resolves exact `NAudio.Wasapi` and `org.k2fsa.sherpa.onnx` package identities, records any exact ONNX Runtime package/native payload, and enables locked restore.
4. The implementer records a model asset manifest without guessing filenames, revision, hash, license or notice. Model preparation is a separate admitted boundary; it must not be confused with package restore.
5. The implementer builds and publishes the disposable WPF probe as a self-contained `win-x64` folder, enumerates every actual native DLL, records architecture/hash, and loads each from publish output.
6. The implementer launches the probe with `--no-mic --no-network --no-telemetry`; it must prove no mic, network, telemetry, credential, audio, transcript or history side effects.
7. Only after assets are prepared does a distinct local speech implementer perform the network-disabled Paraformer partial/final feasibility run. A fresh verifier repeats toolchain and offline gates from a separate evidence path.

## 4. Solution chosen

Use the approved local C#/.NET 10 LTS/WPF stack with NAudio for the future capture boundary and sherpa-onnx C# binding/native runtime for the local recognizer. Keep B0 disposable and provider-free: package/native identity and loading are proven before product code. Use a self-contained `win-x64` folder rather than a framework-dependent or single-file claim so native payloads remain inspectable. Keep the model archive and package downloads in task-local acquisition storage, never in production source.

Rejected alternatives: retaining Azure as a mandatory v2 dependency would contradict the approved offline-first decision; inventing package/model versions would destroy provenance; silently using a mirror/proxy or a guessed ONNX direct package would invalidate source and licensing evidence; replacing the streaming bilingual candidate with final-only Whisper would violate the approved live-partials/mixed-language gate; and writing a product project in B0 would collapse implementation and toolchain ownership.

## 5. Acceptance criteria (v2-labeled and frozen before implementation)

The following are change-defining v2 criteria. None is a pass yet. The v1 criteria remain in the historical files and are not retroactively marked passed.

- [ ] **B0-v2-C1 — Task-local SDK:** exact official .NET 10 x64 SDK patch, URL, retrieval timestamp, SHA-256, install path, `dotnet --info`, host and x64 identity recorded under the worktree. No global SDK is used.
- [ ] **B0-v2-C2 — Locked local package compatibility:** exact restored `NAudio.Wasapi` 3.x and `org.k2fsa.sherpa.onnx` versions, exact direct/transitive ONNX Runtime identity if present, target compatibility, dependency graph, lock file and restore exit code recorded. No Azure package is mandatory or referenced for this v2 gate.
- [ ] **B0-v2-C3 — Windows x64 build:** disposable WPF probe builds Release for `net10.0-windows`/`win-x64` using the task-local SDK and frozen graph; source/build manifests and exit code are retained.
- [ ] **B0-v2-C4 — Self-contained publish:** clean self-contained `win-x64` folder contains a runnable probe without a separately installed .NET runtime; RID, flags, output hashes and launch result are retained. This is not a single-file claim.
- [ ] **B0-v2-C5 — Local native dependency load:** every actual sherpa/ONNX/native dependency in restore/publish output is enumerated with path, x64 architecture, SHA-256 and `NativeLibrary.Load`/`Free` result. Missing transitive dependencies are hard failures.
- [ ] **B0-v2-C6 — Offline side-effect guard:** `--no-mic --no-network --no-telemetry` opens no microphone, creates no audio/transcript/history file, reads no credential, performs no socket/network connection or runtime fetch, and emits content-free logs. The observation method and exit code are retained.
- [ ] **B0-v2-C7 — Portable provenance and asset licensing:** source/build/output manifests tie to one worktree snapshot; SDK/package/native/model identities, URLs/revisions, byte lengths, SHA-256 hashes, architecture, Apache-2.0 model notice and any package/native license notices are complete. Candidate SHA remains pending; no invented version/hash is accepted.
- [ ] **B0-v2-C8 — Network-disabled local inference (scoped follow-on):** after assets are admitted, a separate implementer and fresh verifier prove the Paraformer candidate loads and produces live partial/final events with networking disabled, including Stop/reset/fence/no-speech evidence. This is a later feasibility gate, not owner-stage proof and not a product accuracy PASS.

Regression/scope guards retained from v1: baseline and original checkout unchanged; no product source, global SDK/configuration, credentials or provider resources modified; no commit/push/merge/deploy; verifier-owned evidence remains separate; no mic/cloud/network action is represented as successful merely because a command exited.

## 6. Risk and blockers

Exact NuGet/native versions, .NET 10 patch, model archive revision/files, package/native licenses, CPU/RAM/latency and mixed-language quality are unresolved until actual official resolution/preparation. The model catalog’s approximate int8 encoder/decoder sizes are planning evidence only, not an asset manifest. No Azure credential or cloud check is required for v2, but Azure may be reconsidered only through a later provider decision.

The prior worker’s diagnosis records `MANUS_TERMINAL_NETWORK_DISABLED=1`, successful DNS, and `Bad access`/curl 7 before TLS on both `dot.net` and `dotnetcli.blob.core.windows.net`. The parent’s `network:true` routing receipt is incomplete: it contains only a timestamp/header because PowerShell treated curl verbose stderr as a terminating native-command error before a clean receipt. Therefore the parent route is **inconclusive**, not evidence of TCP success or failure. Use the bounded script delivered with this packet; do not unset the environment flag, override policy, use a proxy/VPN/mirror, or retry unchanged.

Required phase separation: **parent-scoped acquisition/endpoint checks → separate worker local extraction/setup/code → separate admitted dependency metadata/download assistance → separate worker restore/build/publish → fresh independent verifier**. No code retry was consumed by the environmental network blockage.
