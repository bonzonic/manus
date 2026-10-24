# B0 Offline Speech Recognition and Audio Feasibility Plan

**Work item:** `b0-offline-L7GDB`  
**Decision:** approved offline-first amendment at 2026-10-24 16:15:39+08:00  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Assigned owner worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-offline-L7GDB`  
**Canonical documents:** root `research.md`, `decision.md`, `implementation-plan.md`, `offline-speech-models.md`  
**Status:** frozen planning contract; no code, install, restore, model download, microphone call, build, benchmark or product PASS.

## 1. Problem statement

The approved product is a Windows-native C#/.NET 10 LTS/WPF tray input tool whose first recognition path is local sherpa-onnx bilingual streaming Paraformer. It must retain live partial preview, safe keyboard/cancel/focus behavior, the defined Notepad/Edge/VS Code insertion matrix, editable recovery, no-default-audio/history behavior, and all M1–M9 release gates. The prior B0-S packet was Azure/F0-specific and asked again for cloud credentials/consent. The user's explicit offline-first decision replaces that initial-provider gate; the frozen Azure packet remains historical and must not be rewritten.

At this baseline there is no product solution, SDK/package graph, sherpa/ONNX runtime, model asset, corpus result, microphone result, or measured hardware quality/latency. The official sherpa documentation establishes Windows/C#/streaming capability and a Chinese-English Paraformer catalog example, but does not establish .NET 10 packaging, native-load success, same-sentence mixed quality, punctuation fidelity, no-telemetry behavior or this desktop's CPU/RAM/latency. These are change-defining feasibility gates, not assumptions.

The first benchmark must therefore prove a bounded local capture-to-final path: owned PCM frames; online partial revisions; segment/final aggregation; Stop/final/cancel fencing; no silence-only or hallucinated insertion; CPU-first configuration; English/Mandarin/mixed quality and latency; model/runtime license and hash manifests; explicit asset installation boundaries; and a complete network-disabled execution proof. Speech output must remain separate from input dispatch: B0 never types, refocuses, pastes, sends Enter, or claims insertion verification.

## 2. Architecture changes

No M1–M9 safety or input architecture is removed. The provider seam changes from the historical Azure adapter to a local `SherpaOnnxParaformerProvider` behind the existing provider-neutral speech contract. The disposable B0 boundary is:

```text
explicit microphone start
  -> NAudio.Wasapi shared-mode capture (DataFlow.Capture)
  -> owned bounded AudioFrame copies (<= 2 seconds queued)
  -> sherpa-onnx online Paraformer stream (Windows x64, CPU-first)
  -> revised SpeechPartial events (overlay-only)
  -> ordered SpeechFinalSegment events
  -> Stop/finalization/cancel fence and one terminal result
  -> benchmark metrics only; no input dispatch in B0
```

The model candidate is `sherpa-onnx-streaming-paraformer-bilingual-zh-en`, initially the official int8 encoder/decoder variant. Exact archive revision, file names, tokens, hashes, runtime/native payload, NuGet version and license notices remain pending the separately admitted toolchain v2 freeze. A separate punctuation asset is not assumed. Raw ASR punctuation is measured first; any local punctuation asset enters the benchmark only with its own package/model/native hashes, license, latency, memory, revision behavior and network-disabled evidence.

The production boundary remains `VoiceInput.Core`, `VoiceInput.Windows`, `VoiceInput.Speech`, and `VoiceInput.App`, with deterministic tests. B0 may create only a disposable spike after admission. `AudioFrame`, `SpeechEvent`, `SpeechSegmentAggregator`, `FinalizationFence`, `LocalMicLevelTest` and `BenchmarkHarness` are provider-neutral contracts; NAudio and sherpa types do not leak into the core contract. Input/caret/focus/insertion remains owned by the Windows spike and later product stages.

M2 becomes local model/device setup, verified asset manifest, explicit Windows microphone permission, level test and practice. M3 live partial preview remains mandatory. M7 requires no idle capture, no runtime network fetch/telemetry, no default audio/transcript/history, local consent for actual evaluation recordings, and a future DPAPI cloud credential boundary only if a cloud provider is separately added. M8's one-session, queue, timeout, device-loss, cancellation and stale-callback rules remain unchanged.

## 3. User flow

This is a future admitted feasibility flow, not an end-user run completed by the owner:

1. The parent records fresh resource/device admission. The toolchain owner separately freezes actual v2 SDK/package/native identities; the offline implementer does not invent package versions or alter the frozen v1 toolchain contract.
2. The user or authorized local operator explicitly consents to any microphone/evaluation-corpus use. No cloud consent or Azure credential is needed for local inference. Setup downloads/prepares the pinned model/runtime only in the admitted asset boundary, verifies SHA-256, architecture, notices and license metadata, and disables runtime remote fetch/telemetry.
3. The app enumerates a selected microphone. Opening settings/onboarding does not open it. Only an explicit **Local microphone level test → Start** opens capture; it sends zero frames to a recognizer, writes no audio/transcript/history and reports local-only status. Device loss, cancel, timeout, lock/sleep and shutdown close it without switching devices or restarting.
4. After model and device readiness, the user explicitly starts a practice/benchmark session. Capture copies bounded 16 kHz mono PCM16 frames (or the exact validated input format recorded by the implementer) into one online Paraformer stream. Partials revise only the non-focus-stealing overlay; none can reach insertion.
5. Ctrl+Alt+Space Stop closes capture, begins finalization, aggregates ordered final segments once, and seals the fence before a benchmark transcript result exists. Escape/cancel invalidates the session, suppresses late events and discards uncommitted output. A finalization timeout is a typed failure, not a latency pass.
6. The admitted harness runs exactly 30 English, 30 Mandarin and 30 mixed locally consented utterances, including names, numbers, dates, negations, technical terms, punctuation and code-switch boundaries. It records content-minimizing metrics and provenance, not default product history.
7. The same complete path runs with networking disabled after asset installation. A successful local session, absence of network/telemetry/fetch, and all failure cases are independently observed. Missing assets, corpus or consent remain `PENDING`, never a synthetic PASS.

## 4. Solution chosen

Choose sherpa-onnx online bilingual Paraformer rather than a final-only Whisper/SenseVoice path because live partials are an explicit M3 MUST-HAVE and the retained official catalog gives the strongest direct Chinese-English streaming evidence. Use CPU-first int8 as the initial hypothesis, not a performance promise. Compare a larger/fp32 or Zipformer candidate only if the parent admits a bounded comparison; do not replace the required live-partial path with final-only output.

Use `NAudio.Wasapi` 3.x for copied microphone frames, `org.k2fsa.sherpa.onnx` for the resolved C#/Windows runtime package, and the exact official Paraformer int8 model archive after restore/asset inspection. The toolchain proposal records pins as pending rather than inventing versions. ONNX Runtime/native identity must be taken from the actual resolved package graph and native payload, not guessed from a package name. No Azure Speech SDK or Azure payload is mandatory for this initial local path; Azure remains an optional future provider feature.

Rejected alternatives are: silent final-only Whisper; SenseVoice simulated streaming as if it were causal live partials; continuous language/model-card examples as proof of same-sentence quality; an unreviewed punctuation asset; runtime model downloads or telemetry; automatic cloud fallback; clipboard/whole-value insertion; and any quality-threshold reduction. The existing WPF/.NET 10/Windows x64, hotkey/cancel, focus-safe direct input, recovery, no default persistence and cross-app acceptance contracts remain in force.

## 5. Acceptance criteria

These are frozen binary criteria for implementation and fresh verification. All are pending; no owner self-check is a product or release PASS.

### A — toolchain and asset truth

- [ ] Actual solution, SDK, target `net10.0-windows`, RID `win-x64`, exact `NAudio.Wasapi` version, exact `org.k2fsa.sherpa.onnx` version, resolved ONNX/native dependencies, model archive revision and asset files are recorded after real restore/inspection.
- [ ] Model/runtime/token/punctuation files, if any, have byte length, SHA-256, architecture, source URL/revision, declared license and notice manifest. Runtime has no unreviewed remote fetch/telemetry path.
- [ ] Disposable output is isolated from the original checkout, other owner worktrees and production `src`; no code is merged automatically.

### B — owned bounded microphone frames

- [ ] `AudioFrameQueue_RejectsWhenTwoSecondBudgetExceededWithoutSilentDrop` proves the accepted duration never exceeds two seconds, overload is typed, accepted sequence numbers remain contiguous and memory does not grow unbounded.
- [ ] `WasapiCallback_CopiesBytesBeforeCallbackReturns` mutates the callback source after enqueue and proves queued bytes remain unchanged.
- [ ] `Capture_UsesMicrophoneNotLoopback` proves capture input, not render/loopback; stop, cancel, device loss and disposal complete the stream without audio files.

### C — online partial/final behavior

- [ ] Revised partials update overlay-only state and produce zero final/commit notifications before Stop.
- [ ] Final segments aggregate in sequence order exactly once; duplicate segment IDs and other sessions are ignored.
- [ ] No-speech, empty/hallucinated/repetitive output, model-load failure, endpoint, transport and disposal states are typed and never become automatic insertion text.

### D — Stop/final/cancel fencing

- [ ] `CancelThenLateFinal_IsIgnored`, `SealThenLateFinal_IsIgnored` and `OldSessionEvent_CannotUpdateNewSession` prove no stale output and exactly one terminal outcome.
- [ ] Stop closes capture, begins bounded finalization and exposes one final result only after the fence. Cancel before dispatch discards uncommitted text; no retry is performed.

### E — explicit local microphone test

- [ ] Settings/onboarding construction does not open the mic; only explicit Start does.
- [ ] Without model use/cloud consent, the local level test emits levels/status only, sends zero recognizer frames, writes no audio/transcript/history and identifies itself as local-only/not onboarding completion.
- [ ] Cancel, device loss, timeout, lock/sleep and shutdown release capture without silent device switch or restart.

### F — 30/30/30 local benchmark

- [ ] Manifest validation requires exactly 30 English, 30 Mandarin and 30 mixed unique IDs with explicit local consent. Missing corpus/consent/assets returns `PENDING`/`BLOCKED`, never PASS.
- [ ] English WER ≤15%, Mandarin CER ≤15%, mixed-token error ≤15%, proper-name exact rate ≥90%, and at most one severe meaning-changing error across 30 mixed utterances remain proposed release thresholds.
- [ ] p95 first non-empty partial ≤1.2 s from speech onset and p95 final-ready ≤2.5 s from Stop are measured separately from the 15 s finalization boundary. Cold model load, CPU/RAM and queue duration are reported separately.
- [ ] Punctuation faithfulness is measured for raw ASR. Any punctuation model has independent asset/license/hash/latency/revision evidence and cannot be silently required.
- [ ] A complete run succeeds with networking disabled after installation, with no network socket, telemetry or runtime fetch observed.

### G — evidence and handoff

- [ ] Implementer report records exact files, commands, build/test outputs, manifests, resource admissions, device class, model/runtime identity and per-gate `PASS`/`FAIL`/`BLOCKED`/`PENDING` without secrets, raw audio, transcripts or provider payloads.
- [ ] Fresh verifier writes a separate report under `plans/verification/<unique-b0-offline-verifier-id>/report.md`; owner and implementer evidence cannot substitute for independent judgment.
- [ ] No product PASS, M1–M9 PASS, release claim, merge, push, deployment or automatic provider switch is made from this plan.

The safety/input regression guards remain mandatory: preserve the 12 positive B0-W cases, 14 refusal/race/cancel classes, 60 positive release attempts, 40 refusal/race/cancel cases, direct Unicode no-clipboard route, no Enter/Tab/forced refocus, recovery Copy/Discard, no default history, and all M1–M9 thresholds.

## 6. Risk

- **Toolchain/package drift:** sherpa examples target `net6.0`; .NET 10/WPF and Windows native packaging are unverified. A restore/native-load failure blocks the stage.
- **Model asset/license ambiguity:** runtime and model licenses are separate; exact ONNX/token/punctuation/native notices and hashes are unknown. Do not redistribute or claim legal clearance before review.
- **Quality and code switching:** catalog language support and a mixed example are not corpus quality. Missing corpus/hardware evidence is a pending gate, not permission to skip it or lower thresholds.
- **Punctuation fidelity:** ASR may omit or revise punctuation. A separate local punctuation model adds files, license, memory, latency and revision risk; raw and post-punctuation results must remain separate.
- **CPU/latency/memory:** catalog file sizes and reported real-time factors are not this desktop measurements. CPU-first is a hypothesis; record warm/cold load, p95 partial/final, CPU and peak memory.
- **Offline privacy:** initial asset preparation uses network. Runtime must be tested after installation with network disabled and inspected for fetch/telemetry/native surprises.
- **Hallucination/no-speech:** silence-only or repetitive decoder output must never be inserted. Empty/no-match/low-confidence policies are part of the gate.
- **Race and safety:** revised partials, Stop, cancel, endpoint, device loss and stale callbacks can arrive out of order. The fence and one-terminal-outcome rules are mandatory.
- **Cross-worktree/role separation:** the owner writes this contract; a distinct implementer writes code/evidence; a fresh verifier judges it. The parent remains coordinator-only. No nested agents, code authored by this owner, commits or merges.

**Owner conclusion:** Ready for parent resource admission after the separate toolchain v2 metadata is frozen. Current status is `OFFLINE_B0_BLOCKED_PENDING_TOOLCHAIN_V2_ASSET_MANIFEST_LOCAL_CORPUS_AND_HARDWARE_MEASUREMENT`; this is a plan amendment, not an approval pause and not a product PASS.
