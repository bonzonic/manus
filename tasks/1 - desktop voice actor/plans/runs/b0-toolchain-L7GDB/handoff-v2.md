# B0 Toolchain Handoff v2 — Distinct offline implementer packet

**Work item:** `b0-toolchain-L7GDB`  
**Assigned worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`  
**Canonical docs:** this file, `plan-v2.md`, `contract-version-v2.md`  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` detached and clean at last owner evidence  
**Recipient:** one distinct implementation worker, followed by a fresh independent verifier

## First exact distinct-implementer prompt

> You are the distinct B0-T offline toolchain implementer for work item `b0-toolchain-L7GDB`. Work only in `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB` at baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`. Read the approved `research.md`, `decision.md`, historical `plan.md`/`handoff.md`/`evidence/provenance.md`/`evidence/network-diagnosis.md`, and v2 `plan-v2.md`/`contract-version-v2.md` before acting. Do not edit those historical files or canonical main docs.
>
> First confirm detached HEAD, clean status, no global `dotnet`, and whether parent acquisition receipts exist. If official network access is not actually enabled, stop with `BLOCKED`; do not unset `MANUS_TERMINAL_NETWORK_DISABLED`, use a mirror/proxy/VPN/TLS override, browser login, secret, or unchanged retry. Use only official Microsoft/NuGet/sherpa endpoints. Request fresh coordinator admission for any SDK/archive download, restore, build or publish.
>
> After admission, acquire the official .NET 10 x64 SDK only if absent, keep SDK ZIP/archive outside source under `.work\tools\acquisition` or `.work\acquisition`, and record exact URL, retrieval timestamp, SHA-256, install path, SDK patch and `dotnet --info`. Install only under `.work\tools\dotnet`; do not alter global PATH or require admin rights. Do not request a heavy model archive during this owner handoff unless the parent separately admits it.
>
> Create only a disposable WPF probe under `.work\b0-probe`; do not create product `src/`. Resolve and lock exact stable `NAudio.Wasapi` 3.x and exact stable `org.k2fsa.sherpa.onnx` versions for `net10.0-windows`/`win-x64`. Record the exact direct/transitive ONNX Runtime package/native identity if present; never guess a package ID/version. Restore locked, build Release, and publish a self-contained `win-x64` folder. Enumerate every actual sherpa/ONNX/native DLL, record x64 architecture and SHA-256, and prove `NativeLibrary.Load`/`Free` from publish output.
>
> Record the official model candidate `sherpa-onnx-streaming-paraformer-bilingual-zh-en` only after an admitted preparation step supplies an exact archive revision, filenames, tokens, byte lengths, SHA-256 and Apache-2.0 license/notice. Do not invent filenames/hashes or silently add punctuation. The optional punctuation model is not a baseline dependency.
>
> The probe must support `--no-mic --no-network --no-telemetry` and must not open a microphone, instantiate a live recognizer, read credentials, create audio/transcript/history files, make a network/socket connection or runtime fetch, or emit content-bearing logs. Preserve commands, stdout/stderr, exit codes, source/output hashes and all unresolved blockers in a new implementation-owned evidence file. Do not commit, push, merge, deploy, or claim product/release PASS.
>
> Stop and report a hard blocker on missing SDK/package compatibility, unresolved native load, absent exact model/licensing evidence, or failed offline side-effect guard. Return the status and evidence paths to the toolchain owner. A separate verifier will repeat all gates from a separate directory. No code retry was consumed by the prior environmental network failure.

## Phase separation

1. **Parent-scoped acquisition assistance:** bounded official endpoint checks using the supplied safe script; if capability is admitted, parent may route official SDK/model/package downloads but does not implement or run product tests.
2. **Distinct worker local extraction/setup/code:** local SDK placement, disposable probe, no product source, no mic/cloud/network behavior.
3. **Required dependency metadata/download assistance:** exact package graph and, under separate admission, official model archive/license/hash acquisition only.
4. **Separate worker restore/build/publish:** locked restore, WPF build, self-contained x64 publish and native loading.
5. **Fresh independent verifier:** repeat v2 criteria with separate evidence; owner and implementer logs are not verification.

## Required evidence outputs

Create new files under `plans\runs\b0-toolchain-L7GDB\evidence\` without overwriting v1 records:

- `implementation-manifest-v2-<timestamp>.md`
- `sdk-v2-<timestamp>.md` with official URL/hash/SDK info
- `package-graph-v2-<timestamp>.md` and lock-file hash
- `native-assets-v2-<timestamp>.md` with path/architecture/hash/load result
- `model-assets-v2-<timestamp>.md` with official revision/files/tokens/hashes/license/notices, or an explicit blocked record
- `offline-guard-v2-<timestamp>.md` with process/network/file observation and exit codes

Do not fabricate candidate SHA. Leave the disposable probe for the verifier unless cleanup is explicitly authorized after manifests are complete.

## Current blocker and network evidence

The prior distinct implementer’s report and diagnosis show `MANUS_TERMINAL_NETWORK_DISABLED=1`, DNS resolution, and immediate `Bad access`/curl exit 7 before TLS for both frozen official hosts. The parent’s `network:true` receipt contains only a heading/timestamp; PowerShell’s curl verbose stderr was treated as a terminating native-command error before a clean receipt. This parent attempt is **inconclusive**, so do not report it as a successful or failed TCP test. Run the supplied safe script only via the parent’s explicit network-capability route if needed.

No SDK, package, model, probe, build, publish, microphone, inference or cloud action has been performed in this v2 owner stage. V1 remains blocked and historically preserved; v2 is a changed contract, not a retroactive pass.

## Final parent-route receipt — 2026-10-24 16:30

The exact receipt is preserved at `evidence/parent-network-head-check-20261024-1630/receipt.json`. The safe script completed with `owner_script_exit=1`; no network check was rerun by this successor. Its `EnvironmentNetworkDisabled` value is `0`, and both frozen official endpoints resolved DNS, began connection attempts, then failed with curl exit `35` at Windows Schannel credential acquisition: `SEC_E_NO_CREDENTIALS (0x8009030e)`. Both stdout files are empty and no HTTP status, redirect result, or response body was captured.

This classifies the parent-route failure as a local TLS/Schannel client-credential failure, not the prior network-disabled/TCP `Bad access` condition. It does not prove an independent TCP handshake, and it provides no evidence about HTTP status or source availability. The fixed route is therefore **NOT USABLE** for official acquisition. Historical v1 evidence remains unchanged; no proxy/VPN/TLS/registry/policy change, credential read, download, restore, build, test, or retry was performed.

The final evidence report is `evidence/network-routing-final.md`. The next exact resume stage is a fresh exact-device route with functioning Schannel credential acquisition, followed by one bounded official HEAD/metadata check. Only after that succeeds may the coordinator admit the official .NET 10 x64 SDK retrieval, exact NuGet local runtime graph restore, and official Paraformer model/archive preparation. A manual SDK file alone is insufficient; the package graph and model evidence are also mandatory. No user cloud billing or Azure action is needed. Until then, remain **BLOCKED / NOT IMPLEMENTED / NOT VERIFIED** and do not dispatch verifier or downstream stages.
