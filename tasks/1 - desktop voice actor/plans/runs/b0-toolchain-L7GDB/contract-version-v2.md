# B0 Toolchain Contract v2 — Offline-first local Paraformer path

**Version:** `contract-version-v2`  
**Supersedes:** only the mandatory provider/toolchain interpretation of B0-T v1 for the initial local path  
**Preserves:** v1 `plan.md`, `handoff.md`, `evidence/provenance.md`, `evidence/implementation-report.md`, `evidence/network-diagnosis.md` byte-for-byte  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Current verdict:** **BLOCKED / NOT IMPLEMENTED / NOT VERIFIED**

## Contract identity

The approved first release is offline-first with live partials and bilingual streaming Paraformer. This contract authorizes a disposable feasibility probe only; it authorizes no product source, SDK/model installation, restore, build, test, microphone access, inference, cloud/provider call, credential read, commit or deployment in the owner stage.

## Frozen target identities

| Boundary | Approved identity | Exact value/status |
|---|---|---|
| Framework/UI | C# / .NET 10 LTS / WPF | `net10.0-windows`; exact SDK patch **PENDING_TOOLCHAIN_V2** |
| Runtime | Windows x64 | RID `win-x64`; self-contained folder publish |
| Capture boundary | `NAudio.Wasapi` | stable 3.x exact version **PENDING_RESTORE** |
| Local binding/runtime | `org.k2fsa.sherpa.onnx` | exact stable version **PENDING_RESTORE** |
| ONNX runtime | exact direct/transitive package or native payload from resolved sherpa graph | package ID/version **PENDING_RESTORE**; do not guess |
| Native assets | actual sherpa/ONNX Windows x64 DLLs in resolved graph/publish | names, architecture, hashes **PENDING_ASSET_MANIFEST** |
| Model candidate | `sherpa-onnx-streaming-paraformer-bilingual-zh-en` official int8 encoder/decoder variant | archive revision/files/tokens/hashes/notices **PENDING_OFFICIAL_ARCHIVE** |
| Punctuation | optional official sherpa Chinese-English family | **NOT_SELECTED_FOR_BASELINE**; separate evidence required if admitted |
| Azure | optional later provider only | **REMOVED FROM INITIAL B0 MANDATORY GATE** |

No exact package version, archive filename, hash, native DLL name or license notice may be fabricated. Approximate catalog sizes are hypotheses, not evidence.

## v2 criterion change ledger

- **C1 retained, provider-neutral:** task-local official SDK URL/hash/install/`dotnet --info`; v1’s SDK criterion was not passed and remains historical.
- **C2 changed:** replace mandatory `Microsoft.CognitiveServices.Speech` with exact `NAudio.Wasapi` 3.x + `org.k2fsa.sherpa.onnx` graph and exact ONNX identity if resolved. Locked restore is still mandatory.
- **C3 retained with local graph:** WPF `net10.0-windows` Release build, `win-x64`, task-local SDK; no Azure reference is required.
- **C4 retained:** self-contained `win-x64` folder, not framework-dependent or single-file.
- **C5 changed:** enumerate/load actual sherpa/ONNX/native DLLs from publish output; Azure-native loading is removed.
- **C6 changed:** replace `--no-mic --no-cloud` with `--no-mic --no-network --no-telemetry`; prove no socket/runtime fetch, mic, content file or credential side effect. A no-cloud-only result is insufficient.
- **C7 retained and expanded:** preserve source/build/output provenance and add model archive, token, license/notice, URL/revision, byte length and SHA-256 evidence. Candidate SHA remains pending.
- **New C8, scoped follow-on:** after assets are prepared, separate local implementer/verifier prove network-disabled streaming partial/final Paraformer load and fencing. This is not a toolchain-owner pass or accuracy claim.

## Required implementation boundary

A distinct implementer may create only `.work\b0-probe`, task-local SDK/tool paths, acquisition evidence and manifests. No production `src/` tree or user-facing behavior may be created in B0. The probe must not open a microphone, instantiate a live recognizer, read a key/region, call a provider, create audio/transcript/history files or make network connections.

The SDK, package and model source must be official. SDK archives remain outside source under `.work\tools\acquisition` or `.work\acquisition`, with URL and SHA-256. Model assets require an exact official archive/revision and license/notice record before local inference. No unofficial mirror, proxy/VPN/TLS override, browser login, secret, or environment-policy bypass is permitted.

## Required evidence and stop conditions

The implementer must retain command lines, exit codes, stdout/stderr, source hashes, SDK info, package graph/lock, publish manifest, native path/architecture/hash/load result, model manifest, licenses/notices and the offline side-effect observation. A failed SDK/package compatibility/native-load/offline guard is a hard blocker. Do not lower targets, switch to Azure, replace streaming with final-only Whisper, or claim English-only feasibility.

A fresh verifier must use a separate verification directory and independently rerun the frozen v2 checks. The owner’s records are not a verifier verdict. No downstream B1–B6 admission occurs until C1–C7 are either verified or a named decision changes the contract.

## Parent-only network assistance

The parent may run `evidence\parent-network-head-check.ps1` only through an explicitly network-enabled route. It performs bounded HEAD/metadata checks against:

- `https://dot.net/v1/dotnet-install.ps1`
- `https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json`

It does not download bodies, install/extract an SDK, restore packages, access credentials, change proxy/VPN/TLS settings, or touch product source. It captures curl stdout, stderr and numeric exit code without letting verbose stderr become a PowerShell terminating error. The receipt is diagnostic only; success does not authorize heavy acquisition, and failure must distinguish DNS/TCP/TLS/HTTP only as far as the captured evidence supports.

## Status

V2 is ready for the first distinct implementer packet but is not a result. Current evidence proves only that v1 was blocked before SDK installation and that the prior device-terminal route was blocked at TCP. The parent routing receipt is incomplete and must be rerun with the safe script if capability assistance is still needed.
