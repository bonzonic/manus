# B0 Toolchain Contract v2 — Owner Addendum 2026-10-24

**Supersedes:** none; this is additive to `contract-version-v2.md`.  
**Purpose:** record official stable package identities resolved after v2 was frozen.  
**Decision status:** no user decision required; no product behavior, privacy, paid-service, provider, or license-policy change.

## Frozen contract remains in force

`contract-version-v2.md` remains the governing contract. Its `PENDING_RESTORE`, `PENDING_ASSET_MANIFEST`, `PENDING_OFFICIAL_ARCHIVE`, C1-C8, no-product-source, no-mic, no-network, no-telemetry, live-partial, bilingual, offline-first and independent-verifier requirements are unchanged. This file must not be used as a verifier verdict.

## Resolved official stable identities

| v2 boundary | Additive exact metadata result | Remaining gate |
|---|---|---|
| Capture | `NAudio.Wasapi 3.3.0`, listed stable (`isPrerelease=false`), MIT; official NuGet page/catalog. | Locked restore on `net10.0-windows`; actual transitive `NAudio.Core` version and graph evidence. |
| Sherpa C# binding | `org.k2fsa.sherpa.onnx 2.0.0`, listed stable (`isPrerelease=false`), Apache-2.0; official NuGet catalog has `net10.0` group. | Locked restore and assets graph under `win-x64`; no hand-edited dependency graph. |
| Windows x64 runtime | `org.k2fsa.sherpa.onnx.runtime.win-x64 2.0.0`, listed stable/current official NuGet page, Apache-2.0. | Local package hash, actual native DLL list, PE architecture, publish inclusion and `NativeLibrary.Load`/`Free`. |
| Direct ONNX package | None declared. | Record whatever the actual official sherpa graph resolves; do not guess or add a direct Microsoft ONNX package. |
| Model | Official docs confirm `csukuangfj/sherpa-onnx-streaming-paraformer-bilingual-zh-en`, archive URL ending `sherpa-onnx-streaming-paraformer-bilingual-zh-en.tar.bz2`, int8 encoder/decoder and `tokens.txt`. | Separate archive admission, revision, complete files, byte lengths, SHA-256/SHA-512, tokens hash and Apache-2.0/notices. |

## Rationale

The official `org.k2fsa.sherpa.onnx 2.0.0` catalog requires runtime package version range `[2.0.0, )`; therefore the intended Windows x64 graph uses runtime `2.0.0`. A previously visible `1.13.8` runtime page is an older stable release and must not be mixed with binding 2.0.0. `NAudio.Wasapi 3.3.0` is the current stable 3.x page result, not a preview. This resolves identity uncertainty without claiming local availability, restore success or native compatibility.

## Required next action

Dispatch the distinct implementer packet:

`evidence/package-acquisition-packet-v2-20261024.md`

The worker may scaffold only `.work\\b0-probe`, prepare a fixed official NuGet acquisition manifest/helper, and—after fresh admission—perform the locked restore/build/publish/native-load milestones. The worker must not implement the product, touch `src/`, open a microphone, load model weights, call a provider, read credentials, or claim a pass.

**Owner amendment result:** no pending package identity is factually unavailable; no contract repair or user choice is required. All v2 behavior/security/live-partial/quality gates remain frozen.
