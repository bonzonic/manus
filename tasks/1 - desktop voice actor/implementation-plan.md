# B0 Integration Implementation Plan

> **For implementation workers:** Use checkbox (`- [ ]`) syntax for tracking. Implement sequentially in the current Manus task unless an execution method is selected. For workflow-orchestrated execution, read the current `workflow-composer` skill and inspect the live workflow schema at execution time; use a selected subagent workflow only when the parent chooses it. Do not assume a model, unsupported messaging API, or resume API. This is a coordinator-dispatch packet, not authorization to implement product code in this owner stage.

**Goal:** Join the three frozen B0 owner contracts into an ordered, mechanically dispatchable feasibility sequence that establishes toolchain truth first, then independently measures Windows activation/insertion and speech/audio boundaries without weakening any approved M1–M9 or B0-before-B1 gate.

**Architecture:** B0 remains three disposable, separately owned feasibility spikes. The toolchain spike proves a task-local .NET 10/WPF, locked package, self-contained `win-x64`, and native-load boundary; the Windows spike proves active-only cancellation, non-activating feedback, target/caret evidence, and clipboard-free Unicode dispatch; the speech spike proves bounded microphone frames, local sherpa-onnx Paraformer partial/final/fencing behavior, local-only mic testing, model/runtime asset provenance, punctuation measurement, and network-disabled inference. No B0 spike is production source and no spike is merged automatically. A later approved product worktree may adopt the verified contracts behind the four-project boundary from `research.md`.

**Tech Stack:** C# / .NET 10 LTS / WPF; `net10.0-windows`; Windows x64 `win-x64`; task-local SDK under `.work\tools\dotnet`; exact restored `NAudio.Wasapi` 3.x and `org.k2fsa.sherpa.onnx` C#/native package versions; the official `sherpa-onnx-streaming-paraformer-bilingual-zh-en` int8 model candidate; Win32 `RegisterHotKey`/`SendInput`; Windows UI Automation; xUnit-style deterministic tests. Exact SDK/package/native/model versions are pending real restore and asset inspection and must not be invented. ONNX Runtime package/native identity is recorded from the resolved sherpa dependency graph; it is not assumed to be a separate direct reference.

**Spec:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md`, `decision.md`, and `task.md.txt`; frozen child contracts at `plans\runs\b0-toolchain-L7GDB\plan.md`, `plans\runs\b0-windows-L7GDB\plan.md`, and the historical `plans\runs\b0-speech-L7GDB\plan.md`. The new offline contract is `plans\runs\b0-offline-L7GDB\plan.md`; owner handoffs are in the matching `handoff.md` files. This plan preserves the frozen v1 documents; it does not replace or rewrite them.

**Amendment boundary:** The frozen B0-T v1 contract remains unchanged for provenance. Its Azure package/native checks are not mandatory for the new local-first B0-S path. Parent dispatch must use the versioned offline toolchain-amendment proposal and obtain a separately frozen B0-T v2 contract before the offline implementation begins; no owner may silently rewrite the B0-T worktree or v1 reports.

## Global Constraints

- Baseline for every worktree is detached, clean SHA `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; candidate SHA remains pending because no commit is authorized.
- The parent remains coordinator-only. A distinct implementer writes each disposable spike; a fresh verifier writes only its own report under a separate `plans\verification\<unique-run-id>` directory.
- Every heavy stage—SDK download, restore, build, publish, test execution, native probe, supervised desktop interaction, microphone open, or provider benchmark—requires fresh parent/coordinator admission. This plan does not schedule descendants implicitly.
- No original checkout, other owner worktree, global Git configuration, global SDK registration, credential store, cloud key, microphone, model asset, live account, provider request, or cloud consent may be touched by this join owner.
- B0 must not create or imply a production `src/` implementation in the toolchain or Windows worktrees. The speech packet may scaffold its explicitly disposable B0 test boundary only; it must not be promoted automatically.
- Local sherpa-onnx bilingual streaming Paraformer is the selected initial path. Model/runtime assets require a separately admitted network preparation step, but inference must prove operation with networking disabled. No Azure/cloud prerequisite, paid service, automatic provider fallback, final-only Whisper simplification, runtime model fetch, telemetry, or unreviewed punctuation asset is authorized. Azure is an optional later provider feature only.
- No plaintext key, region secret, session credential, raw audio, product transcript/history, provider payload, window title, or content-bearing diagnostic may enter source, command lines, ordinary settings, logs, build artifacts, or evidence.
- The approved three-surface M5 matrix is Windows Notepad, Microsoft Edge local standard textarea/plain `contenteditable`, and VS Code untitled plain-text editor. Missing VS Code requires installation/confirmation or an explicitly approved named substitution; silent matrix reduction is forbidden.
- Clipboard mutation, paste, whole-value UIA assignment, forced refocus, Enter/Tab/control-key synthesis, automatic retry, automatic undo, privilege elevation, and target reactivation are forbidden.
- Missing tooling, package incompatibility, native-load failure, missing model/asset hash or license evidence, missing matrix surface, missing locally consented corpus, network-dependent inference, or an unmeasured punctuation/quality dependency is a blocker—not a reason to weaken a gate.
- No commit, push, merge, deploy, account/signup, billing, or configuration change is part of B0.

## Review Focus

- **Toolchain provenance:** exact task-local SDK, package graph, lock file, target/RID, self-contained publish, and native DLL hashes must be tied to one source snapshot; covered by B0-T C1–C7 and its independent verifier.
- **Cross-worktree boundary:** disposable artifacts must remain in their assigned worktree and later interfaces must be transferred as manifests/contracts, never by shared-file editing; covered by the join review and each verifier's source manifest audit.
- **Active-only cancellation and focus safety:** Escape is fail-closed during Arming through dispatch and passes through idle; overlay show/update cannot alter foreground/focus/caret; covered by B0-W L1–L5 and F1–F3.
- **Observed insertion truth:** `InputSent` is not `Verified`; all 12 B0 positive cases and all 14 refusal/race/cancel classes must be independently observed with zero wrong-target, duplicate, or submission mutations; covered by B0-W matrix evidence and verifier.
- **Audio/provider fencing:** callback buffers are copied, queues stay at or below two seconds, partials never commit, and stale/cancelled finals are ignored; covered by B0-S B–E deterministic gates and verifier.
- **Mixed-language scope:** a catalog/demo cannot prove same-sentence code-switching; live partials remain mandatory; punctuation and network-disabled behavior are separate gates; covered by offline B0-S F and its pending/blocked status.

---

## Problem statement

The approved product is a greenfield Windows-native tray input method, not a speech-to-text page. The approved release requires every M1–M9 must-have: a single-instance global toggle and active-only cancellation (M1), local model/microphone/permission setup and practice (M2), non-focus-stealing state feedback with live partials (M3), faithful English/Mandarin/mixed recognition (M4), safe caret insertion across the named matrix (M5), explicit recovery (M6), local privacy/no-telemetry/content-free diagnostics with protected future cloud credentials only if later added (M7), bounded cancellation-safe sessions (M8), and a runnable independently verified Windows x64 handoff (M9).

The three owner packets agree that the baseline has no solution, product source, test runner, SDK evidence, provider integration, or measured application behavior. The toolchain owner found no .NET SDK/compiler/MSBuild/Visual Studio/Windows SDK or visible NuGet cache; the Windows owner found Notepad and Edge but no VS Code in inspected standard locations; the offline speech owner has no installed sherpa/ONNX runtime, model assets, corpus, or measured hardware result. No implementation, restore, build, publish, app activation, typing, microphone capture, model inference, provider call, secret read, commit, push, or verification was performed.

B0 therefore has to be joined as a dependency graph rather than three simultaneous guesses. Tooling/build truth is the earliest eligible stage. Only after it is independently verified may the two domain spikes be admitted, each in its own worktree and evidence path. B1–B6 remain blocked until all required B0 facts are recorded; the absent speech inputs and absent VS Code surface are current hard blockers.

## Architecture changes

No production architecture change is authorized by this packet. The B0 artifact map is:

| Stage | Assigned worktree | Disposable artifact location | Owns | Must not own |
|---|---|---|---|---|
| B0-T toolchain | `...\\.work\\worktrees\\voice-b0-toolchain-L7GDB` | `.work\\tools\\dotnet\\`; `.work\\b0-probe\\` | SDK/package/build/publish/native-load facts | product source, mic, cloud, credentials |
| B0-W Windows | `...\\.work\\worktrees\\voice-b0-windows-L7GDB` | `probes\\b0-windows\\` | hotkeys, mutex, Escape, overlay, UIA/native focus, Unicode dispatch | audio, sherpa/ONNX, onboarding, DPAPI, product core |
| B0-S speech | `...\\.work\\worktrees\\voice-b0-offline-L7GDB` | this amendment's explicitly disposable B0 project/test paths; confirm actual paths after scaffold | owned audio frames, sherpa-onnx Paraformer adapter events, aggregator/fence, local mic path, model/runtime/asset manifest, punctuation benchmark | tray, hotkeys, overlay, insertion, recovery, onboarding |

The toolchain manifest is a dependency artifact, not a source tree to be copied. Later implementers receive the verified exact SDK/package/native identities and re-establish them in their own worktree with their own evidence. The Windows and speech spikes do not edit each other or the toolchain worktree. B0-W's `DispatchOutcome`/`FocusSnapshot` and B0-S's `AudioFrame`/`SpeechEvent`/`FinalizationFence` are separate provider-neutral contracts; B1 may reconcile them only through a new approved implementation packet after B0.

**Subsequent source-project proposal, not yet approved or created:** after B0 gates are resolved, the parent may request a fresh product worktree from the same baseline at `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-product-L7GDB`. The proposed production boundary is `src\VoiceInput.Core`, `src\VoiceInput.Windows`, `src\VoiceInput.Speech`, and `src\VoiceInput.App`, with deterministic tests under `tests\VoiceInput.Core.Tests`, `tests\VoiceInput.Windows.Tests`, and `tests\VoiceInput.Speech.Tests` (plus any explicitly approved app/integration tests). This is a proposal for later approval/implementation, not a current source location or permission to create it.

## User flow

This is the implementation/verification flow, not a claim of an end-user run:

1. The parent records a fresh resource/device admission for B0-T implementation and dispatches the exact first prompt below to a distinct implementer.
2. B0-T confirms its assigned worktree, detached baseline SHA, clean tracked status, and absent/global-toolchain reality; it installs the official .NET 10 SDK only under `.work\\tools\\dotnet` if still absent.
3. B0-T creates only the disposable WPF probe, resolves exact package versions from an approved feed, enables locked restore, builds Release `net10.0-windows`/`win-x64`, publishes self-contained, runs the explicit `--no-mic --no-cloud` check, and writes manifests. Every command is future work until the implementer records it.
4. The parent admits a fresh B0-T verifier. The verifier uses a separate report path, audits the same claimed bytes, repeats the locked build/publish/native-load/no-side-effect checks, and returns a precise verdict.
5. If B0-T C1–C7 pass, the parent may separately admit B0-W implementation and this offline B0-S deterministic implementation. They may be parallel only if the parent independently reserves resources; this plan does not dispatch them implicitly.
6. B0-W builds and tests its disposable native probe, then—only with a fresh supervised admission and controlled unsent fields—runs the 12 positive and 14 refusal/race/cancel cases on the exact approved matrix. Missing VS Code or an unapproved substitution blocks exit.
7. Offline B0-S builds deterministic audio/provider/fence/benchmark tests, then—only with separate admission—prepares and verifies local sherpa/ONNX/model assets and runs the network-disabled benchmark. A real local microphone run requires explicit local consent and a separate device admission. No cloud credentials, cloud consent or Azure call is required; any future cloud provider is outside this B0 packet.
8. Each owner returns a source/build/evidence manifest and explicit `PASS`, `FAIL`, or `BLOCKED` result. A fresh verifier is dispatched separately for each completed implementation packet.
9. The parent performs the non-heavy B0 join review using the three verifier packets. No B1–B6 implementation is admitted unless all mandatory B0 gates pass; unresolved hard blockers return to the user rather than being hidden in a scope reduction.

## Solution chosen

The joined solution preserves B0-native/toolchain ownership and adds the approved offline B0-S contract plus dependency sequencing:

- **First:** B0-T task-local toolchain/build probe, because no later C# restore/build/test/publish stage has a proven executable boundary.
- **Second:** a fresh B0-T verifier, because owner toolchain output cannot authorize descendant work by itself.
- **Third:** separately admitted B0-W and B0-S implementations after B0-T verification. Their code/evidence remain isolated; their interfaces are exchanged as reviewed contracts/manifests, not shared files.
- **Fourth:** separate fresh verifiers for B0-W and offline B0-S. B0-W's native matrix verdict and B0-S's local model/mic/network-disabled speech verdict are independent; neither can substitute for the other.
- **Finally:** a parent-only join review. It may classify the aggregate as B0-PASS only if all required gates are independently verified. Current inputs guarantee at least a speech live blocker and a Windows matrix blocker, so the honest current state is `B0-BLOCKED`, not PASS.

Rejected alternatives are: dispatching all three implementers immediately (no toolchain fact and unsafe resource overlap); sharing one worktree or generated source (breaks authorship/provenance); using owner self-checks as verification (not independent); dropping VS Code or replacing it silently (violates M5); treating a model card/demo as mixed-language proof (not a same-sentence benchmark); replacing live partials with final-only Whisper; allowing runtime network fetch/telemetry; silently adding a punctuation model; enabling Azure/cloud automatically; and creating production `src` projects during the toolchain/Windows probes (promotes unverified spikes and widens scope).

### First implementer prompt ready for parent dispatch

The following B0-T prompt is retained for the frozen v1 toolchain owner and is not the offline v2 contract. For the new local provider, the parent must dispatch the separate versioned toolchain-amendment proposal and freeze actual sherpa/ONNX/mic/native identities before B0-S implementation. Do not add mandatory Azure payload checks to v2 merely because the historical prompt below contains them.

Copy this prompt exactly after the parent records a fresh admission for this heavy stage:

> You are the distinct B0 toolchain implementer. Parent admission is required and must already be recorded before you begin any download, restore, build, publish, or test. Work only in `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`; do not use the original checkout or either other B0 worktree. Read the approved `research.md`, `decision.md`, `plans\runs\b0-toolchain-L7GDB\plan.md`, and `handoff.md` first. Your source/build baseline must be detached clean SHA `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; record `git rev-parse HEAD`, `git status --short`, and the exact source manifest before changes. Do not commit, push, merge, deploy, alter global Git/config/hooks, read credentials, open a microphone, create audio, call Azure, or make any provider/network request other than the approved official SDK/package download and restore. If .NET is absent, install the official .NET 10 SDK only under the worktree-local `.work\tools\dotnet` (no admin/global install), recording installer URL, retrieval time, SHA-256, exact `dotnet --info`, host, and x64 architecture. Scaffold only `.work\b0-probe\B0.ToolchainProbe.sln` and its disposable WPF `net10.0-windows` app; do not create production `src` projects. Resolve exact stable `NAudio.Wasapi` 3.x and `Microsoft.CognitiveServices.Speech` versions from the permitted feed after checking compatibility; replace placeholders only with versions proven by restore, record the package graph and lock-file hash, and do not invent versions. Add deterministic checks named `ToolchainProbeReportsSdkAndTarget`, `PackageAssemblyReferencesResolve`, `NativeDependenciesLoadFromPublish`, and `NoMicOrCloudSideEffects`. Restore locked metadata, build Release for `net10.0-windows`/`win-x64`, publish a clean self-contained `win-x64` folder, and run the probe directly with `--no-mic --no-cloud`. Enumerate actual native payloads, record every path/hash/architecture/load result, and retain stdout/stderr/exit codes. Do not claim a clean-machine or product pass. Mark B0-C1 through B0-C7 individually PASS, FAIL, or BLOCKED; stop descendant work on any hard failure. Write the implementation report exactly at `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\implementation-report.md` and supporting manifests beside it without overwriting `evidence\provenance.md`. Return the report path, exact source/build/native artifact paths, baseline identity, unrun/blocked checks, and a concise recommendation to the parent. A fresh verifier will use a separate `plans\verification\<unique-run-id>` path; your report is not an independent verdict.

## Acceptance criteria

### Joined B0 exit gates

B0 is not complete until the following frozen child gates are independently measured. Every item is pending unless a future implementer/verifier records evidence; current owner packets are contracts only.

**B0-T toolchain/build gates:**

- [ ] **C1:** task-local `.work\tools\dotnet\dotnet.exe`, installer URL/hash, SDK/host/x64 identity recorded; no global PATH dependency.
- [ ] **C2:** exact `NAudio.Wasapi` 3.x and `Microsoft.CognitiveServices.Speech` versions recorded in project and lock file; `net10.0-windows` restore has no unresolved assets.
- [ ] **C3:** Release WPF probe builds for `net10.0-windows`/`win-x64` with retained output and source manifest.
- [ ] **C4:** clean self-contained `win-x64` publish runs without a separately installed runtime and reports x64.
- [ ] **C5:** every actual native dependency is enumerated, hash-recorded, and loaded from publish output; missing transitive/native dependencies fail the gate.
- [ ] **C6:** no-mic/no-cloud self-check opens no device, creates no audio/transcript, reads no credential, opens no network connection, and writes no content-bearing log.
- [ ] **C7:** source, SDK/package, restore/build/publish, output, RID, self-contained, and native-load manifests are complete and tied to one snapshot; candidate SHA remains pending.

**B0-W Windows gates:**

- [ ] **L1–L5:** one instance; real Ctrl+Alt+Space collision reporting; active-only Escape ownership; fail-closed Escape registration; at-most-once/busy handling.
- [ ] **F1–F3:** non-activation across five show/update/hide cycles; stable target/focus/caret evidence; permanent invalidation after focus/caret/target/modifier races.
- [ ] **Positive matrix:** exactly P1–P4 on Notepad, Edge local controlled field, and VS Code untitled plain-text editor—12 total, all `Verified`, never `InputSent`-only.
- [ ] **Refusal matrix:** N1–N14, including unknown/sensitive/read-only/elevated/terminal/remote/focus/caret/closed/modifier/Escape/partial dispatch/busy cases; zero wrong-target, duplicate, Enter/Tab, or cancellation-before-dispatch mutations.
- [ ] **Outcome truth:** `NotAttempted`, `InputSent`, `Verified`, and `Uncertain` meanings and no-retry behavior are evidenced independently.

**B0-S speech/audio gates:**

- [ ] **A:** actual solution/SDK/package/test truth discovered after admission; no guessed command or version.
- [ ] **B:** owned callback bytes; microphone not loopback; bounded queue never exceeds two seconds; overload, device loss, cancellation, and disposal are typed.
- [ ] **C:** partials are overlay-only and may revise; final segments order once after Stop; no-speech/errors are typed; local sherpa-onnx online Paraformer configuration is one CPU-first Windows x64 stream with English/Mandarin/Mixed policy and no final-only fallback.
- [ ] **D:** cancel/seal/stale-session late events are ignored; exactly one terminal outcome.
- [ ] **E:** local mic-level test requires explicit start, sends zero provider/model frames without model use, writes no audio/transcript/history, and stops on cancel/device loss/timeout.
- [ ] **F:** benchmark accepts exactly 30 English/30 Mandarin/30 mixed only with explicit local consent and unique IDs; frozen quality/latency/punctuation metrics are computed; model-demo claims are not same-sentence proof; any separate punctuation asset is measured and license/hash recorded; missing corpus remains `PENDING_MISSING_CONSENTED_LOCAL_CORPUS`.
- [ ] **G:** exact implementation/build/test/device/provider/corpus provenance and per-gate PASS/FAIL/BLOCKED status are retained without secrets or content-bearing evidence.

### Approved M1–M9 release gates retained after B0

B0 does not satisfy or demote any release gate. Later work remains blocked until B0 is resolved and the parent admits each stage in dependency order.

- [ ] **M1:** per-user single-instance tray app; configurable global toggle; collision/rebind handling; active-only Escape; no duplicate sessions.
- [ ] **M2:** local model/asset/microphone/shortcut setup, explicit Windows permission, device selection/level test, explicit practice Start, and repair paths.
- [ ] **M3:** non-focus-stealing overlay with Listening/Processing/Sent/Cancelled/Error, elapsed time, level, partial preview only, keyboard operation, and no caret movement.
- [ ] **M4:** faithful English, Simplified Mandarin, and measured mixed code-switching; proposed thresholds remain WER/CER/mixed-token error <=15%, names >=90%, at most one severe mixed semantic error in 30; no automatic rewrite/translation.
- [ ] **M5:** zero observed misses/incorrect insertions in 60 positive attempts—20 each on Notepad, Edge, VS Code—and at least 40 refusal/race/cancel cases with zero wrong-target/duplicate writes; `InputSent` alone is not pass.
- [ ] **M6:** session-scoped editable recovery with explicit Copy/Discard; no automatic retry or blind paste; uncertain dispatch warns text may already be present.
- [ ] **M7:** no idle capture, no runtime network/telemetry/model fetch, no default audio/transcript/history files, local-only indicator, local permission/consent behavior, content-free diagnostics, and DPAPI CurrentUser credentials only if a future cloud provider is separately added.
- [ ] **M8:** one active session, 60-second recording cap, 15-second finalization boundary, <=2 seconds queued audio, no-speech/device/network/sleep/lock/shutdown handling, stale callback rejection, and cancellation boundary.
- [ ] **M9:** runnable self-contained Windows x64 folder with native/model dependencies and notices, instructions, automated checks, network-disabled local-model/cross-app acceptance, and known limitations on the clean baseline; no unsupported zero-install claim.

### Task 1: B0-T toolchain implementer

**Files:**
- Create only in `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\` if absent and `.work\b0-probe\`.
- Write report: `plans\runs\b0-toolchain-L7GDB\evidence\implementation-report.md`.
- Do not modify `research.md`, `decision.md`, owner `provenance.md`, or production `src\`.

**Interfaces:**
- Consumes: frozen B0-T plan/handoff, detached baseline SHA, fresh parent admission, approved official package-feed access without secrets.
- Produces: exact SDK/package/source/build/publish/native manifest, disposable probe path, C1–C7 statuses, and a report ready for a fresh verifier.

- [ ] **Step 1: Establish baseline/source identity and preflight reality.** Record assigned worktree, detached SHA, clean tracked status, PATH/global SDK absence or presence, host/architecture, and unrun checks.
- [ ] **Step 2: Install only task-local .NET 10 if needed and record URL/hash/`dotnet --info`.** Do not install globally or request elevation.
- [ ] **Step 3: Scaffold only the disposable WPF probe and resolve exact package versions after a real restore.** Record project, lock file, dependency graph, and package assets.
- [ ] **Step 4: Add deterministic no-mic/no-cloud and native-load checks.** Never instantiate a live recognizer, open a device, read a key, or call a provider.
- [ ] **Step 5: Restore locked metadata, build Release `win-x64`, publish self-contained, launch the probe, and record all exit codes/output/hashes.**
- [ ] **Step 6: Complete C1–C7 status table and write the exact implementation report.** Stop on a hard failure; do not claim B1 eligibility.

### Task 2: Fresh B0-T verifier

**Files:**
- Create only `plans\verification\<unique-b0-toolchain-verifier-id>\report.md` and verifier-owned evidence beneath it.
- Read but do not edit the B0-T owner packet or implementation report.

**Interfaces:**
- Consumes: B0-T frozen contract, baseline SHA, implementer report/manifests, disposable probe/published bytes, fresh parent admission.
- Produces: independent C1–C7 verdict; explicit source/build/native/no-side-effect audit; no product PASS claim.

- [ ] **Step 1: Prove verifier path is separate and compare claimed source/build identities.** Reject missing byte/hash/provenance.
- [ ] **Step 2: Re-run task-local SDK info, locked restore, Release build, self-contained publish, direct no-cloud probe, and native enumeration/load.**
- [ ] **Step 3: Audit no mic, no audio/transcript files, no credential read, and no network/provider call during the no-cloud check.**
- [ ] **Step 4: Write `PASS`, `FAIL`, or `BLOCKED` per C1–C7 and an aggregate verdict.** Any hard failure blocks B0-W/B0-S implementation admission.

### Task 3: B0-W Windows probe implementer

**Files:**
- Create only under `...\.work\worktrees\voice-b0-windows-L7GDB\probes\b0-windows\` and the assigned B0-W evidence directory.
- Do not create `src\VoiceInput.*`; do not use the toolchain or speech worktree.
- Write implementation report under `plans\runs\b0-windows-L7GDB\evidence\implementation-report.md`.

**Interfaces:**
- Consumes: verified B0-T toolchain/package manifest, frozen B0-W contract, fresh parent admission, VS Code confirmation or explicit named substitution approval, and controlled-unsent-field authorization for supervised cases.
- Produces: disposable lifecycle/focus/target/input probe, deterministic tests, 12-positive/14-negative matrix evidence, outcome classifications, and a verifier-ready manifest.

- [ ] **Step 1: Reconfirm baseline and actual toolchain/project paths; write failing contract tests for outcomes, fences, cancellation, and no-retry.**
- [ ] **Step 2: Implement/test mutex, `RegisterHotKey`/`WM_HOTKEY`, active Escape registration/unregistration, collision, busy, and fail-closed behavior.**
- [ ] **Step 3: Implement/test `WS_EX_NOACTIVATE`/`ShowActivated=false`, UIA/native focus snapshots, and permanent invalidation after focus/caret races.**
- [ ] **Step 4: Implement/test allow-listed target policy and direct Unicode `SendInput` packet builder with surrogate and command-key exclusion.**
- [ ] **Step 5: With separate admission, run only controlled unsent fields across the complete approved matrix; record exact versions, expected/observed content, event trace, cleanup, and all blocked cases.**
- [ ] **Step 6: Mark L/F/positive/refusal gates and write the implementation report.** Missing VS Code/native driver is BLOCKED, never a counted pass.

### Task 4: Fresh B0-W verifier

**Files:**
- Create only `plans\verification\<unique-b0-windows-verifier-id>\report.md` and verifier-owned evidence.

**Interfaces:**
- Consumes: frozen B0-W plan/handoff, baseline/source/build manifests, disposable probe, app/version inventory, and separate controlled-field admission.
- Produces: independent lifecycle/focus/matrix verdict and explicit matrix blocker if VS Code or a named approved substitution is unavailable.

- [ ] **Step 1: Compare source/build bytes and planned files; reject product-source scope creep.**
- [ ] **Step 2: Re-run deterministic tests and native lifecycle/focus checks under fresh conditions.**
- [ ] **Step 3: Independently observe P1–P4 on all three named surfaces and N1–N14; classify `NotAttempted`, `InputSent`, `Verified`, and `Uncertain` exactly.**
- [ ] **Step 4: Confirm zero wrong-target/duplicate/submission/cancel mutations and issue B0-W `PASS`, `FAIL`, or `BLOCKED`.**

### Task 5: B0-S speech/audio implementer

**Files:**
- Use only the explicitly disposable B0 offline paths in `C:\\Users\\wongn\\Documents\\Interview\\Manus\\tasks\\1 - desktop voice actor\\.work\\worktrees\\voice-b0-offline-L7GDB`; confirm actual scaffold paths before writing them.
- Write implementation report under `plans\\runs\\b0-offline-L7GDB\\evidence\\implementation-report.md`.
- Do not create the tray shell, overlay, insertion, recovery, onboarding, DPAPI UI, cloud credentials, or a final product source tree in this slice.

**Interfaces:**
- Consumes: verified B0-T toolchain/package manifest, this frozen offline B0-S contract, fresh parent admission, local model/runtime asset preparation admission, and a locally consented 90-item evaluation corpus when live measurement is attempted.
- Produces: owned `AudioFrame`/bounded queue, provider-neutral `SpeechEvent`/aggregator/fence, local-only mic path, sherpa-onnx Paraformer adapter seam, model/runtime/asset/license/hash manifest, deterministic benchmark harness, network-disabled execution evidence, and verifier-ready evidence.

- [ ] **Step 1: Confirm actual solution/project/test paths and write repository/toolchain truth; do not invent commands or versions.**
- [ ] **Step 2: Write/run failing B0-B tests, then implement owned callback copying, two-second queue budget, capture-only device selection, overload, disposal, cancellation, and device-loss behavior.**
- [ ] **Step 3: Write/run failing B0-C/D tests, then implement revised-partial/final mapping, ordered deduplicated aggregation, typed local recognizer outcomes, and cancel/seal/stale-session fencing.**
- [ ] **Step 4: Write/run failing B0-E tests, then implement explicit local-only level-test semantics with zero provider/file/transcript sink.**
- [ ] **Step 5: Write/run failing B0-F tests, then implement exact 30/30/30 manifest validation and frozen quality/latency/punctuation/status computation; keep any unverified punctuation asset out of the release path.**
- [ ] **Step 6: Only after separate local-consent/resource admission, install/verify the pinned model/runtime assets and run the local mic/benchmark path; otherwise retain `PENDING_MISSING_CONSENTED_LOCAL_CORPUS_AND_ASSETS`.**
- [ ] **Step 7: Mark A–G and write the implementation report without secrets, raw audio, transcripts, or provider payloads.**

### Task 6: Fresh B0-S verifier

**Files:**
- Create only `plans\\verification\\<unique-b0-offline-verifier-id>\\report.md` and verifier-owned evidence.

**Interfaces:**
- Consumes: frozen offline B0-S contract, implementation source/build/test/model manifests, disposable artifacts, and—only if separately admitted—local mic/network-disabled evidence with local consent/corpus provenance.
- Produces: independent B0-B–G verdict; exact pending/blocker status where assets/corpus are absent; no product or release PASS.

- [ ] **Step 1: Audit source/project/package/build identities against the implementer manifest and confirm no product-scope creep.**
- [ ] **Step 2: Re-run deterministic bounded-frame, partial/final, fence, local-only, and benchmark fixture tests.**
- [ ] **Step 3: If and only if pinned assets, local consent, corpus, and admission exist, audit the serialized network-disabled run; otherwise verify the explicit pending status without synthesizing results.**
- [ ] **Step 4: Confirm mixed same-sentence scope is not claimed from a catalog/demo, live partials remain present, punctuation evidence is separate, and runtime network/telemetry is absent; issue offline B0-S `PASS`, `FAIL`, or `BLOCKED`.**

### Task 7: Parent-only B0 join review

**Files:**
- Update only `plans\coordination\implementation-20261024-L7GDB\join\status.md` and retain the child records unchanged.
- No product source, worktree, build, test, app, microphone, or provider operation.

**Interfaces:**
- Consumes: three owner reports and three fresh verifier reports, each with baseline/source/build identities and explicit unrun/blocked checks.
- Produces: aggregate B0 status and the single next-stage decision; does not invent a candidate SHA or turn child blockers into passes.

- [ ] **Step 1: Check that B0-T verifier PASS precedes any admitted B0-W/B0-S implementation; reject implicit or stale admission.**
- [ ] **Step 2: Check every B0-T, B0-W, and B0-S gate is PASS, FAIL, or BLOCKED with evidence paths; preserve child verdicts.**
- [ ] **Step 3: Aggregate only `B0-PASS` when all mandatory B0 gates pass.** Current known result remains `B0-BLOCKED` because VS Code confirmation, offline model/runtime assets, and the locally consented evaluation corpus are absent.
- [ ] **Step 4: If aggregate PASS becomes possible, stop and request a new parent-approved B1 packet; never schedule B1–B6 from this plan implicitly.**

## Risk

- **Toolchain acquisition:** official .NET 10 download/restore/build/publish is heavy and currently unavailable. Queue/admit it first; no downstream implementation can claim readiness before independent C1–C7 verification.
- **Windows matrix availability:** VS Code was not found in the read-only inventory. This is a hard B0-W blocker until confirmed or explicitly substituted by the user; Notepad/Edge inventory is not behavior evidence.
- **Native/API variability:** UIA providers, UIPI, caret signatures, surrogate handling, and `SendInput` races can make safe insertion unavailable. Refuse/mark uncertain rather than whole-field mutate, refocus, retry, or call accepted OS events verified.
- **Speech privacy and assets:** no local model/runtime is installed or hashed, no consented corpus is available, and no network-disabled execution has been proven. Asset downloads/preparation, native dependency loading and live microphone evaluation each require separate admission; runtime network fetch/telemetry is forbidden.
- **Mixed-language feasibility:** the official bilingual example is not a same-sentence quality guarantee. A failed local mixed gate returns a measured blocker, not a silent English-only release or final-only fallback; punctuation remains a separately measured fidelity dimension.
- **Optional diagnostics:** WMI OS caption query was Access Denied; `signtool`, `dumpbin`, and `7z` are absent. Future proof must rely on exact publish/native manifests and in-probe load evidence, clearly recording unavailable optional diagnostics.
- **Release integration:** B0 probes do not prove M1–M9. B1–B6 remain dependency-blocked until this joined gate is independently resolved and the parent admits each later stage.

## Later stage prompts and references

The parent should use the exact child handoffs rather than inventing new scope:

1. **B0-T verifier:** `plans\runs\b0-toolchain-L7GDB\handoff.md`, independent report `plans\verification\<unique-b0-toolchain-verifier-id>\report.md`; only after B0-T implementation report exists.
2. **B0-W implementer:** `plans\runs\b0-windows-L7GDB\handoff.md`; requires B0-T verifier PASS, fresh admission, and VS Code confirmation or named substitution approval before claiming matrix exit.
3. **B0-W verifier:** fresh path `plans\verification\<unique-b0-windows-verifier-id>\`; requires B0-W implementation artifacts and separate supervised admission.
4. **Offline B0-S implementer:** `plans\runs\b0-offline-L7GDB\handoff.md`; requires B0-T verifier PASS for build work, the separately frozen v2 toolchain manifest, and fresh local asset/mic admissions as applicable.
5. **Offline B0-S verifier:** fresh path `plans\verification\<unique-b0-offline-verifier-id>\`; verifies deterministic results, model/native/license manifests, network-disabled proof, and exact pending/blocked local status.
6. **B1 and later:** no prompt is dispatched from this packet. Parent must create a new stage packet only after the aggregate B0 gate is independently resolved.

## Current blockers and admission inputs

- Official .NET 10 SDK/compiler/runtime, solution, Visual Studio/Windows SDK, and visible NuGet cache are absent; this blocks all heavy implementation until B0-T is admitted.
- VS Code is absent from the inspected standard locations/registry; the approved three-surface B0-W matrix cannot exit until the user installs/confirms a supported build or explicitly approves one named substitution.
- Local sherpa/ONNX runtime and Paraformer model assets are not installed or benchmarked; the locally consented 90-utterance corpus and hardware quality result are absent. No live microphone/model evaluation is permitted before separate admission, and the offline mixed-language gate remains pending/blocked.
- Same-sentence mixed-language support cannot be claimed from a model-card example; punctuation, CPU-first latency, asset licenses/hashes and network-disabled execution must be measured. Azure/cloud is not an initial prerequisite or approval question.

**User-decision status:** The offline-first provider decision is already approved. No additional Azure approval pause is requested. Remaining inputs are operational prerequisites for separately admitted local evaluation: a locally consented 90-item corpus (30 English, 30 Mandarin, 30 mixed), explicit microphone/evaluation consent, and the future toolchain owner's verified v2 sherpa/ONNX/native/model asset manifest. These are not permission to lower gates or claim a result.

**Status:** `READY_FOR_PARENT_DISPATCH_B0_TOOLCHAIN`; implementation, restore, build, provider call, app interaction, verification, and shipment are not done. Aggregate release state is `B0-BLOCKED` pending the listed inputs and future independently verified results.
