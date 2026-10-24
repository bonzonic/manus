# B0 Toolchain Owner Successor Handoff — v2 Additive

**Work item:** `b0-toolchain-L7GDB`  
**Owner role:** Same-role successsor / toolchain feature owner  
**Handoff timestamp:** `2026-10-24`  
**Current verdict:** `BLOCKED / NOT IMPLEMENTED / NOT VERIFIED` for B0 gates; package identities are metadata-resolved only.

## Preserve, do not rewrite

Preserve byte-for-byte and continue to treat as authoritative:

- `contract-version-v2.md`
- `handoff-v2.md`
- `plan-v2.md`
- historical v1 `plan.md`, `handoff.md`, `evidence/provenance.md`, `evidence/implementation-report.md`, `evidence/network-diagnosis.md`
- `evidence/sdk-install-report.md` and the SDK manifests
- parent-owned independent C1 verification evidence when delivered

This successor adds only:

- `evidence/owner-package-metadata-v2-20261024.md`
- `evidence/package-acquisition-packet-v2-20261024.md`
- this handoff
- `contract-v2-owner-addendum-20261024.md`

## What is now known

The official stable package identities are:

- `NAudio.Wasapi 3.3.0`, MIT, official NuGet, target `net9.0` with computed `net10.0` compatibility, dependency `NAudio.Core >=3.3.0`.
- `org.k2fsa.sherpa.onnx 2.0.0`, Apache-2.0, official NuGet, `net10.0` group, official runtime dependency range `[2.0.0, )` including `org.k2fsa.sherpa.onnx.runtime.win-x64`.
- `org.k2fsa.sherpa.onnx.runtime.win-x64 2.0.0`, Apache-2.0, official NuGet, current listed stable Windows x64 runtime package.

The direct ONNX package identity remains intentionally unset: use only what the actual official sherpa graph resolves; do not guess `Microsoft.ML.OnnxRuntime`. The official model page confirms `csukuangfj/sherpa-onnx-streaming-paraformer-bilingual-zh-en` and its archive URL/int8 filenames, but archive hashes, revision, complete manifest, token hash and notices are still pending.

The earlier surfaced runtime `1.13.8` is not the intended graph for binding `2.0.0`; do not mix those versions. This is a factual stable-version resolution, not a material user-feature, privacy, paid-service or license-policy decision.

## Exact next implementer dispatch

Send the distinct implementer the complete packet at:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\package-acquisition-packet-v2-20261024.md`

The packet authorizes no work by itself. The coordinator must separately admit finite official package acquisition/restore and then build/publish/native-load stages. The worker may create only `<worktree>\\.work\\b0-probe` plus task-local acquisition/manifests. No production source, microphone, model inference, cloud call, credentials, commit or deployment.

The implementer must record a fixed package acquisition manifest before downloads and use only official NuGet v3 HTTPS endpoints. It must restore the exact locked graph for `net10.0-windows`/`win-x64`, retain package/lock/assets hashes, publish self-contained `win-x64` folder output, enumerate actual native payloads and x64-load each from publish output, then run the no-mic/no-network/no-telemetry guard. The official model archive remains a separate admitted preparation stage.

## Non-pass and independence statement

This owner metadata work did not restore packages, author or run a probe, build, publish, load native libraries, acquire/extract a model, open a microphone, call inference, inspect sockets, or run a verifier. It does not satisfy C1-C8. The parent’s separate SDK C1 verification and any future verifier evidence must remain untouched and independently judged.

## Prerequisites before dispatch

1. Parent supplies/records fresh official HTTPS capability on the exact device route; historical Schannel/TCP appendices remain preserved and are not current package identity blockers.
2. Coordinator admits the finite package metadata/acquisition and restore stage.
3. Implementer confirms detached baseline and clean status, with task-local SDK path and process-scoped NuGet cache.
4. Implementer records package and model licensing/notice fields before any later model/inference admission.
5. Fresh independent verifier receives a separate verification directory and reruns C1-C7; C8 remains a scoped follow-on.

**Owner handoff conclusion:** package identities are ready for distinct implementation; the toolchain and product remain blocked pending admitted restore/native/offline evidence. No user decision is requested.
