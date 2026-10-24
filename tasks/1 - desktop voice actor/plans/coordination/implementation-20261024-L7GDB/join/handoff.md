# B0 Integration Join Handoff

**Join key:** `implementation-20261024-L7GDB`

**Role:** B0 integration feature owner. Parent remains coordinator-only; this handoff supplies the ordered dispatch packet and does not authorize descendant work by itself.

**Canonical task root:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor`

**Approved architecture:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md`

**Approved scope:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\decision.md`

**Root implementation plan:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\implementation-plan.md`

**Baseline/source identity required in every child:** detached clean SHA `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; candidate SHA remains pending; no original checkout edits; no commit/push/merge/deploy.

## 1. Frozen child contracts

| ID | Contract | Worktree | Owner handoff | Required implementation report |
|---|---|---|---|---|
| B0-T | Toolchain/build prerequisites | `...\\.work\\worktrees\\voice-b0-toolchain-L7GDB` | `plans\\runs\\b0-toolchain-L7GDB\\handoff.md` | `plans\\runs\\b0-toolchain-L7GDB\\evidence\\implementation-report.md` |
| B0-W | Windows activation/focus/insertion | `...\\.work\\worktrees\\voice-b0-windows-L7GDB` | `plans\\runs\\b0-windows-L7GDB\\handoff.md` | `plans\\runs\\b0-windows-L7GDB\\evidence\\implementation-report.md` |
| B0-S | Speech/audio/provider feasibility | `...\\.work\\worktrees\\voice-b0-speech-L7GDB` | `plans\\runs\\b0-speech-L7GDB\\handoff.md` | `plans\\runs\\b0-speech-L7GDB\\evidence\\implementation-report.md` |

All child owner `evidence\\provenance.md` files are frozen and must not be overwritten. Implementer reports and verifier reports are separate records.

## 2. Artifact and file-sharing contract

- B0-T tool artifact location is task-local `.work\\tools\\dotnet\\`; disposable probe is `.work\\b0-probe\\`. Its exact SDK/package/native manifest is copied as metadata to later dispatches; the toolchain worktree is not a shared source location.
- B0-W disposable source is only `probes\\b0-windows\\` in its assigned worktree. Its Windows contracts and evidence do not enter B0-T or B0-S.
- B0-S may create only its frozen disposable B0 speech/test boundary in its assigned worktree after inspecting the actual scaffold. It must not add tray, overlay, insertion, recovery, onboarding, DPAPI UI, or production release behavior.
- No child writes to another child’s worktree. No verifier edits owner source or owner handoff. Verifier evidence is always under `plans\\verification\\<unique-run-id>\\`.
- Later product proposal, not created: fresh worktree `...\\.work\\worktrees\\voice-product-L7GDB` with `src\\VoiceInput.Core`, `src\\VoiceInput.Windows`, `src\\VoiceInput.Speech`, `src\\VoiceInput.App`, and matching tests. B0 spikes are not automatically promoted into it.

## 3. Dispatch graph and admission rules

```text
D0  Parent admits B0-T implementer
 |   report: plans/runs/b0-toolchain-L7GDB/evidence/implementation-report.md
 v
D1  Parent admits fresh B0-T verifier
 |   verifier: plans/verification/<unique-b0-toolchain-verifier-id>/
 |   prerequisite: B0-T implementation report and artifacts
 v
D2  Parent admits B0-W implementer       D3  Parent admits B0-S implementer
 |   prerequisite: D1 PASS,               |   prerequisite: D1 PASS,
 |   VS Code decision, UI admission       |   fresh build admission;
 |   and controlled fields                |   live inputs remain separate
 v                                      v
D4  Parent admits fresh B0-W verifier    D5  Parent admits fresh B0-S verifier
 |                                      |
 +-------------------+------------------+
                     v
D6  Parent-only join review; no heavy work and no implicit B1 dispatch
```

D2 and D3 may be admitted independently or in parallel only when the parent has separately reserved the device/resources for each. The graph does not submit descendants implicitly. If D1 fails or is blocked, D2/D3 are not eligible for build/test work. A deterministic B0-S implementation may still be explicitly admitted to record a missing-input blocker, but it cannot claim live/provider PASS.

## 4. D0 exact first-implementer prompt

> You are the distinct B0 toolchain implementer. Parent admission is required and must already be recorded before you begin any download, restore, build, publish, or test. Work only in `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`; do not use the original checkout or either other B0 worktree. Read the approved `research.md`, `decision.md`, `plans\\runs\\b0-toolchain-L7GDB\\plan.md`, and `handoff.md` first. Your source/build baseline must be detached clean SHA `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; record `git rev-parse HEAD`, `git status --short`, and the exact source manifest before changes. Do not commit, push, merge, deploy, alter global Git/config/hooks, read credentials, open a microphone, create audio, call Azure, or make any provider/network request other than the approved official SDK/package download and restore. If .NET is absent, install the official .NET 10 SDK only under the worktree-local `.work\\tools\\dotnet` (no admin/global install), recording installer URL, retrieval time, SHA-256, exact `dotnet --info`, host, and x64 architecture. Scaffold only `.work\\b0-probe\\B0.ToolchainProbe.sln` and its disposable WPF `net10.0-windows` app; do not create production `src` projects. Resolve exact stable `NAudio.Wasapi` 3.x and `Microsoft.CognitiveServices.Speech` versions from the permitted feed after checking compatibility; replace placeholders only with versions proven by restore, record the package graph and lock-file hash, and do not invent versions. Add deterministic checks named `ToolchainProbeReportsSdkAndTarget`, `PackageAssemblyReferencesResolve`, `NativeDependenciesLoadFromPublish`, and `NoMicOrCloudSideEffects`. Restore locked metadata, build Release for `net10.0-windows`/`win-x64`, publish a clean self-contained `win-x64` folder, and run the probe directly with `--no-mic --no-cloud`. Enumerate actual native payloads, record every path/hash/architecture/load result, and retain stdout/stderr/exit codes. Do not claim a clean-machine or product pass. Mark B0-C1 through B0-C7 individually PASS, FAIL, or BLOCKED; stop descendant work on any hard failure. Write the implementation report exactly at `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\implementation-report.md` and supporting manifests beside it without overwriting `evidence\\provenance.md`. Return the report path, exact source/build/native artifact paths, baseline identity, unrun/blocked checks, and a concise recommendation to the parent. A fresh verifier will use a separate `plans\\verification\\<unique-run-id>` path; your report is not an independent verdict.

## 5. D1 independent B0-T verifier packet

**Fresh path:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\verification\<unique-b0-toolchain-verifier-id>\`.

The verifier must be newly admitted after D0 and must not edit the owner packet. It receives the frozen B0-T plan/handoff, the implementation report, source/build/native manifests, disposable probe/publish path or byte archive, and baseline SHA. It must:

1. Compare source file list, byte hashes, baseline identity, target/RID, SDK/package versions, and publish flags; reject missing provenance or unplanned product files.
2. Re-run task-local `dotnet --info`, locked restore, Release `net10.0-windows`/`win-x64` build, self-contained publish, direct `--no-mic --no-cloud` launch, and native DLL enumeration/load.
3. Audit absence of mic device open, audio/transcript files, credentials, provider request, and network during the no-cloud self-check. Optional `dumpbin`/`signtool`/`7z` absence is recorded, not silently treated as evidence.
4. Write `report.md` with C1–C7 `PASS`/`FAIL`/`BLOCKED`, exact commands, exit codes, evidence paths, and aggregate verdict. A non-PASS blocks D2/D3.

## 6. D2 later B0-W implementer prompt/reference

Dispatch only after D1 independently passes, after a fresh parent admission, and after the parent resolves the VS Code prerequisite. Use the frozen `plans\\runs\\b0-windows-L7GDB\\handoff.md` as the contract. The prompt must state: work only in `voice-b0-windows-L7GDB`; use verified toolchain/package metadata but record local restore/build identity; create only `probes\\b0-windows\\`; write failing tests first; implement L1–L5, F1–F3, direct Unicode and outcome semantics; run exactly P1–P4 on Notepad, Edge local controlled field, and VS Code untitled plain-text; run N1–N14; use no clipboard/paste/refocus/command keys/retry; require controlled unsent fields; write `plans\\runs\\b0-windows-L7GDB\\evidence\\implementation-report.md`; and stop as `BLOCKED` if VS Code or a mandatory native driver is unavailable. No audio/Azure/credentials/product source.

**D4 verifier:** fresh `plans\\verification\\<unique-b0-windows-verifier-id>\\`; compare source/build manifests, rerun deterministic/native checks, independently observe all 12 positive cases and 14 refusal/race/cancel cases, and require all positives `Verified` with zero wrong-target/duplicate/submission/cancel mutations. `InputSent` is not a pass.

## 7. D3 later B0-S implementer prompt/reference

Dispatch only after D1 independently passes and after a fresh parent admission. Use `plans\\runs\\b0-speech-L7GDB\\handoff.md` as the contract. The prompt must state: work only in `voice-b0-speech-L7GDB`; confirm actual solution/project/test paths; create only the disposable B0 speech boundary; use exact package identities from real restore; implement B0-B through B0-E deterministic tests and B0-F benchmark validation; copy callback buffers into owned frames; cap queue at two seconds; keep partials overlay-only; fence stale/cancelled/sealed callbacks; local mic level has zero provider sink; no credential read or live provider call unless a later user-input and live-stage admission exists; retain `PENDING_MISSING_USER_CREDENTIALS_AND_CONSENTED_CORPUS` otherwise; disable preview mixed refinement; write `plans\\runs\\b0-speech-L7GDB\\evidence\\implementation-report.md`; and do not add tray/insertion/onboarding/DPAPI UI.

**D5 verifier:** fresh `plans\\verification\\<unique-b0-speech-verifier-id>\\`; audit source/build identity, rerun B0-B through B0-F fixtures, verify no live status is synthesized, and only inspect live F0 evidence if local credentials, explicit consent, exact F0 tier, corpus, and fresh admission are all present. Continuous LID cannot be reported as same-sentence mixed PASS.

## 8. D6 join verdict rules

The parent may mark aggregate `B0-PASS` only if all mandatory B0-T C1–C7, B0-W L/F/positive/refusal, and B0-S A–G gates have independent verifier PASS records. Any FAIL is a hard stop; any missing mandatory measurement is BLOCKED; missing VS Code, credentials/consent/corpus, or preview dependence cannot be converted to PASS. Until then, B1–B6 are not eligible for implementation dispatch.

## 9. Current blockers and one user question

1. No .NET SDK/runtime/compiler, solution, Visual Studio/Windows SDK, or visible NuGet cache is available. D0 needs fresh official .NET 10 task-local tooling admission.
2. VS Code was not found in standard paths or inspected uninstall locations. The approved B0-W matrix cannot exit until a supported VS Code build is installed/confirmed or the user explicitly approves one named substitution.
3. Azure F0 key/region, explicit provider consent, and the consented 90-item corpus are absent. No live provider request is permitted; live status must remain pending.
4. Same-sentence mixed recognition cannot be claimed from continuous LID. Preview multilingual refinement and paid/Voice Live alternatives require a new decision and are disabled.
5. WMI OS-caption query was Access Denied; `signtool`, `dumpbin`, and `7z` are absent. Future evidence uses exact manifests and in-probe native load evidence and labels optional diagnostics unavailable.

**Question:** When the provider gate is admitted, will you provide your own Azure Standard real-time F0 key/region through local secure setup, grant explicit cloud consent, and provide/approve the 90-item corpus (30 English, 30 Mandarin, 30 mixed)? If same-sentence mixed quality requires preview or paid Azure, should that be evaluated as a separate decision rather than enabled automatically?

**Handoff status:** ready for D0 parent dispatch; no implementation, verification, or shipment has occurred.
