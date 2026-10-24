# B0 Toolchain v2 Owner Metadata Report — 2026-10-24

**Work item:** `b0-toolchain-L7GDB`  
**Role:** Same-role successor / toolchain feature owner  
**Scope:** Public official metadata only; no download, SDK mutation, restore, build, probe, model, microphone, or inference action.  
**Status:** `METADATA RESOLVED; C1-C8/B0 NOT VERIFIED`

## Inputs and boundary

This is an additive owner record. It preserves `contract-version-v2.md`, `handoff-v2.md`, all v1 records, and the SDK installation evidence. The installed task-local SDK is already recorded as `.NET SDK 10.0.402`, host/runtime `10.0.13`, Windows x64, with `Microsoft.WindowsDesktop.App 10.0.13`; that SDK record is not regraded here. The independent C1 verification run remains parent-owned and separate.

Only public primary pages and metadata were read:

- NuGet Gallery: <https://www.nuget.org/packages/NAudio.Wasapi/3.3.0>
- NuGet registration/catalog: <https://api.nuget.org/v3-registration5-gz-semver2/naudio.wasapi/3.3.0.json> and its catalog entry <https://api.nuget.org/v3/catalog0/data/2026.10.19.21.30.18/naudio.wasapi.3.3.0.json>
- NuGet Gallery: <https://www.nuget.org/packages/org.k2fsa.sherpa.onnx/2.0.0>
- NuGet registration/catalog: <https://api.nuget.org/v3-registration5-gz-semver2/org.k2fsa.sherpa.onnx/2.0.0.json> and its catalog entry <https://api.nuget.org/v3/catalog0/data/2026.10.23.15.31.08/org.k2fsa.sherpa.onnx.2.0.0.json>
- NuGet Gallery: <https://www.nuget.org/packages/org.k2fsa.sherpa.onnx.runtime.win-x64/2.0.0>
- Official C# API: <https://k2-fsa.github.io/sherpa/onnx/csharp-api/index.html>
- Official online Paraformer model page: <https://k2-fsa.github.io/sherpa/onnx/pretrained_models/online-paraformer/paraformer-models.html>

The Linux-hosted `deep-research` skill file was inaccessible from this Windows device root; the shared `om-feature`/README safeguards were read and followed. No unsupported source or guessed version was used.

## Resolved stable package identities

| Purpose | Exact identity | Official metadata result | Compatibility / dependency note |
|---|---|---|---|
| WASAPI capture boundary | `NAudio.Wasapi` **3.3.0** | NuGet page says current listed version; catalog says `isPrerelease=false`, `listed=true`, MIT, package size 253,152 bytes, published `2026-10-19T21:25:48.387Z`, SHA-512 package hash (base64) `d/o+03WLl562oe0SBZ6nAc/25nXIY6ABfBPsO2uCtaH/jaXuPOrFDX3oUi+Ako8BSvFhj3ZBFLIpclLbfsHduA==`. | Package target `net9.0`; NuGet computes compatibility for `net10.0`/`net10.0-windows`. Exact dependency is `NAudio.Core >= 3.3.0` (`[3.3.0, )`). Real `net10.0-windows` locked restore remains mandatory. |
| C# sherpa binding | `org.k2fsa.sherpa.onnx` **2.0.0** | NuGet registration says `listed=true`, published `2026-10-23T15:27:00.307Z`; catalog says `isPrerelease=false`, Apache-2.0, package size 210,453 bytes, SHA-512 package hash (base64) `2ar7CUQHssmBVep28paUPegf6PHTRk6Fddijr53eNa2FQyHWYBWMu612jC5imRaq8PBaCjhC6XokbAzn5dqmrg==`, repository commit `8abb7c8f87eae85b2e75f9a4115236c978980add`. | Catalog has a `net10.0` dependency group. It requires each platform runtime package at `[2.0.0, )`, including the Windows x64 package. This is an observed official graph, not a claim that only one runtime package will be restored. The implementer must record the actual lock/assets graph and publish selection under RID `win-x64`. |
| Windows x64 native runtime | `org.k2fsa.sherpa.onnx.runtime.win-x64` **2.0.0** | Official NuGet page lists 2.0.0 as the current stable listed version, published/updated `2026-10-23`, Apache-2.0, package page size about 8 MB, owner `k2-fsa`. The page reports no supported-framework dependencies and includes a `net10.0` computed view. | This is the exact Windows x64 runtime identity required by the 2.0.0 binding graph. Do not substitute the older 1.13.x runtime and do not invent a separate Microsoft ONNX Runtime package. Local package SHA-256/SHA-512, native filenames, architecture and load results remain acquisition/restore evidence, not public metadata evidence. |
| Direct ONNX Runtime package | **None declared** | No separate direct `Microsoft.ML.OnnxRuntime` identity was found or needed in the official sherpa 2.0.0 dependency metadata. | The resolved native ONNX/sherpa payload must be identified from the actual lock file, package cache and publish output. Adding a guessed direct ONNX package is prohibited. |

### Version rationale and correction

The earlier public search surfaced `org.k2fsa.sherpa.onnx.runtime.win-x64 1.13.8`, but the official 2.0.0 binding catalog requires runtime packages at `>=2.0.0`, and the official runtime page now lists 2.0.0 as stable/current. Therefore the bounded intended graph is binding **2.0.0** plus Windows x64 runtime **2.0.0**, not a mixed 2.0.0/1.13.8 graph. `NAudio.Wasapi 3.3.0` is the current stable 3.x release and is not a preview. This is a metadata-resolution addendum, not a product-behavior, privacy, paid-service, or license-policy change; no user decision is required.

## Model identity status

The official sherpa page confirms the frozen candidate exactly:

`csukuangfj/sherpa-onnx-streaming-paraformer-bilingual-zh-en` (Chinese + English)

The official archive URL is:

`https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-paraformer-bilingual-zh-en.tar.bz2`

The official page documents the int8 files:

- `sherpa-onnx-streaming-paraformer-bilingual-zh-en/encoder.int8.onnx`
- `sherpa-onnx-streaming-paraformer-bilingual-zh-en/decoder.int8.onnx`
- `sherpa-onnx-streaming-paraformer-bilingual-zh-en/tokens.txt`

The page also states that the model does not support timestamps and is converted from the ModelScope Paraformer source; the source/conversion information is recorded there. The human-readable file sizes on the page are planning clues only. Archive byte length, SHA-256/SHA-512, release revision/commit, complete file list, token-file hash, package/model notices and license evidence are **still pending**. No model archive was fetched. The optional punctuation model remains not selected.

## Findings and non-findings

1. The frozen v2 pending package identities are now factually available as stable official packages: `NAudio.Wasapi 3.3.0`, `org.k2fsa.sherpa.onnx 2.0.0`, and `org.k2fsa.sherpa.onnx.runtime.win-x64 2.0.0`.
2. NuGet metadata alone does not prove `net10.0-windows` restore, lock resolution, native asset selection, x64 architecture, DLL loading, self-contained publish, or offline side-effect safety. Those remain hard implementation/verifier gates.
3. The model candidate is officially listed, but its exact archive revision, hashes, notices and license manifest remain absent. The next worker must not claim C7 or C8 from this report.
4. The parent’s explicit network route and historical Schannel records are not reclassified by this metadata-only report. No terminal acquisition was attempted.

**Owner conclusion:** `READY FOR A DISTINCT IMPLEMENTER'S METADATA-MANIFEST/PACKAGE-ACQUISITION PREPARATION; NOT READY FOR PASS, VERIFICATION, OR DOWNSTREAM B0 ADMISSION.`
