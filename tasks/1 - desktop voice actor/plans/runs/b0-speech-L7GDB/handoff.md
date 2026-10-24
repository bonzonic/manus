# B0 Speech/audio feasibility — implementer handoff

**Work item:** `b0-speech-L7GDB`  
**Owner status:** Contract frozen; ready for a separately admitted implementer; no product PASS claimed.  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Assigned worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-speech-L7GDB`  
**Canonical task documents:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md` and `decision.md`  
**Owner packet:** [`plan.md`](plan.md)  
**Provenance:** [`evidence/provenance.md`](evidence/provenance.md)

## Mission

Prove only the B0 Azure recognition/audio boundaries:

1. NAudio shared-mode microphone capture with copied/owned bounded frames.
2. Azure C# Speech SDK partial/final events behind a provider-neutral adapter.
3. Ordered finalized-segment aggregation with no partial-to-insertion leakage.
4. Cancellation and finalization fencing against late/stale callbacks.
5. An explicit local-only microphone-level test with zero provider sink.
6. A serialized F0 benchmark harness for the approved 90-utterance corpus.

Do not implement the tray shell, global hotkey, overlay, focus/insertion, recovery, onboarding, DPAPI UI, or M1–M9 integration in this work item. The B0 spike may be disposable; do not quietly promote it to production architecture without the later owner’s review.

## Non-negotiable contract

- Initial provider is Azure Standard real-time Speech on **F0**. F0 is documented at five audio hours/month and one concurrent base-endpoint request. There is no automatic S0, Voice Live, Azure LLM Speech, batch, fast transcription, custom-speech, or second-provider fallback.
- Use fixed `en-US` and `zh-CN` configurations for English and Mandarin feasibility. A Mixed candidate may measure `AutoDetectSourceLanguageConfig` + continuous LID, but Microsoft documents that continuous LID does not detect language changes within the same sentence. This cannot be reported as passing the approved mixed-language requirement.
- Multilingual post-stream refinement is documented as public preview and may support language switching, but it is **not** an authorized default. Keep it disabled and label it `PreviewOnly`; surface a user decision blocker rather than enabling it or moving to paid service.
- Partials are overlay-only. No final text is available to insertion until Stop, finalization, ordered aggregation, and the session fence all complete.
- One active session; queue capacity is at most two seconds of provider-format audio. Queue overload is typed and visible; no silent drop or unbounded growth.
- Every callback carries `SessionId` and generation/fence identity. Cancelled/sealed/stale callbacks produce no final output and cannot affect a newer session.
- Local mic-level testing is the only pre-consent capture exception. It must send zero provider frames, create no transcript, and write no audio/history file.
- Do not put credentials in files, command lines, logs, test fixtures, source, build artifacts, or this handoff.

## Preconditions and admission

Before any restore, package install, build, test, microphone-open, or provider operation:

1. Request fresh coordinator admission for the heavy stage and retain the assigned evidence path. Do not run builds merely because this handoff exists.
2. Inspect the worktree and prove the actual solution/project/test layout. At owner time it contains no solution or project; expected `src/VoiceInput.Core`, `VoiceInput.Windows`, `VoiceInput.Speech`, `VoiceInput.App`, and tests are planned—not existing facts.
3. Discover the installed .NET SDK and actual commands. Use PowerShell on Windows. If a tool, solution, package restore, or test runner is missing, record `BLOCKED`; do not invent a package version or substitute a provider.
4. Preserve the detached baseline/worktree boundary. Do not use the original checkout, do not touch other worktrees, and do not change global Git configuration.
5. Keep all live provider work disabled until the user has locally supplied an Azure F0 key/region, given explicit Azure cloud consent, and supplied/approved the 90-utterance corpus. The current task has none of these.

## Frozen interfaces for the implementer

These are provider-neutral contracts; exact C# syntax and file placement may be refined only after the actual scaffold is inspected.

- `IAudioCapture.StartAsync(AudioCaptureOptions options, string sessionId, CancellationToken cancellation)` → owned `AudioFrame` stream plus typed `CaptureStatus`. `AudioFrame` includes format, monotonic sequence, timing, and copied bytes. Core must not expose NAudio callback spans/types.
- `ISpeechProvider.StartAsync(SpeechOptions options, IAsyncEnumerable<AudioFrame> frames, string sessionId, CancellationToken cancellation)` → `SpeechEvent` stream. Events include session identity, event kind (`Partial`, `FinalSegment`, `NoMatch`, `Error`, `Stopped`, `Cancelled`), text/locale metadata, and provider/segment sequence when available.
- `ISpeechSegmentAggregator.Accept(SpeechEvent)` → partial overlay state or ordered final-segment state; `CompleteAfterStop()` → one `FinalTranscript` or typed no-speech/error. Duplicate final segment IDs and other sessions are ignored.
- `IFinalizationFence` → explicit `Cancel`, `BeginStop`, `Seal`, and `TryAccept(sessionId, generation, event)`. After cancel/seal, late callbacks are ignored. Terminal outcome is exactly once.
- `ILocalMicTest.StartAsync(deviceId, durationLimit, cancellation)` → level/status only. It cannot reference `ISpeechProvider`, transcript/history, or insertion.
- `IF0BenchmarkHarness` → accepts a consented 90-item manifest and provider result stream; emits content-free metrics and `PENDING`/`BLOCKED`/`PASS`/`FAIL`. Missing credentials/corpus is `PENDING`, never a synthetic pass.

## Ordered implementation slices

### 1. Scaffold truth and disposable spike boundary

Record actual solution, target framework, SDK, package versions, restore command, and test command. Create only the smallest approved project/test layout needed by B0. Keep a clear disposable-spike marker. Do not claim any command was run until its output is captured.

### 2. NAudio bounded capture

Expected files after scaffold: `src/VoiceInput.Windows/Audio/WasapiAudioCapture.cs`, core `AudioFrame`/bounded queue contracts, and focused core/Windows tests.

TDD assertions:

- At 16 kHz mono 16-bit PCM, accepted buffered duration never exceeds two seconds.
- An over-budget enqueue returns typed overload; accepted sequence numbers remain contiguous; no silent discard occurs.
- Mutating/reusing a callback source buffer after enqueue does not change queued frame bytes.
- Capture uses microphone input, not render/loopback; stop, cancellation, device loss, and disposal complete the stream and release resources.

### 3. Azure adapter and fencing

Expected files after scaffold: `src/VoiceInput.Speech/Azure/AzureSpeechProvider.cs`, segment aggregator/fence, and core/speech tests.

TDD assertions:

- Partial revisions alter partial state only and produce zero final/commit callbacks before Stop.
- Final segments aggregate in sequence order exactly once; duplicate final events do not duplicate text.
- No-match, cancellation, transport errors, and session stop are typed outcomes.
- A late final after cancel or fence seal is ignored; a stale session event cannot update a new session; exactly one terminal outcome is emitted.
- Configuration model selects Standard real-time Speech, one active stream, `en-US`/`zh-CN`, and no batch/fast/Voice Live/LLM path.

When the real SDK is restored, map the documented C# events (`Recognizing`, `Recognized`, `Canceled`, `SessionStopped`) to the provider-neutral events. Keep current SDK package/native dependency identities in implementation evidence.

### 4. Local-only mic-level path

Expected file after scaffold: `src/VoiceInput.Windows/Audio/LocalMicLevelTest.cs` plus focused tests.

TDD assertions:

- Settings/onboarding construction does not open the microphone; only explicit Start does.
- With cloud consent absent, the local test yields levels/status but a spy provider receives zero frames/calls and no transcript/audio/content-bearing file is written.
- Stop, cancellation, device loss, and timeout dispose capture and do not switch devices or restart silently.
- User-facing status explicitly says local-only and not onboarding completion.

### 5. F0 benchmark harness

Expected benchmark fixture/harness path must be confirmed after scaffold; do not assume an existing runner.

TDD assertions:

- Manifest is exactly 30 English, 30 Mandarin, and 30 mixed utterances, with consent and unique IDs. Missing consent/corpus returns a blocker/pending result.
- Metrics use frozen thresholds: English WER <= 15%; Mandarin CER <= 15%; mixed-token error <= 15%; designated proper-name exact rate >= 90%; at most one severe meaning-changing error in 30 mixed utterances; p95 first partial <= 1.2 seconds from speech onset; p95 final-ready <= 2.5 seconds from Stop.
- A 15-second finalization timeout is a failure boundary, not a latency pass.
- Continuous LID is marked measured-but-not-release-eligible for same-sentence code-switching. Multilingual post-stream refinement is labelled preview-only and disabled.
- No credentials/corpus means `PENDING_MISSING_USER_CREDENTIALS_AND_CONSENTED_CORPUS`; no fixture may synthesize a live PASS.

## Safe credential and user-input route (later, not now)

The user must perform these steps on their own device when ready:

1. Create/confirm an Azure Speech resource on the **Free F0 Standard real-time** tier and note its region. Do not upgrade to S0 or enable Voice Live/LLM Speech.
2. In the local app’s secure setup control, paste/type the key into a password-style field. The app must protect it with Windows CurrentUser DPAPI in a separate blob under `%LOCALAPPDATA%\\VoiceInput`; region/endpoint may be non-secret preferences. The key must never be printed, echoed, passed on a command line, stored in ordinary JSON, logged, included in a test fixture, or sent to the parent/agent.
3. Grant explicit provider-specific cloud consent after reading the data-handling disclosure. Consent is distinct from the local-only microphone-level test.
4. Provide or approve a 90-item consented evaluation corpus (30 English, 30 Mandarin, 30 mixed, including names/numbers/dates/negations/technical terms). Do not upload or capture it in this owner stage. The future supervised harness must record only the agreed metrics/provenance by default, not product history.
5. Tell the coordinator that credentials, consent, and corpus are ready; the coordinator admits the live benchmark separately. If the only way to pass mixed code-switching is preview or paid, stop and ask the user whether to evaluate that change—do not choose it automatically.

## Exit packet required from the implementer

Return to the parent and owner:

- Candidate revision/build manifest and exact source/project file list.
- Actual restore/build/test commands and outputs, with blocked/unrun checks explicit.
- Package/SDK/native dependency versions and Windows/runtime prerequisites.
- Deterministic B0-B through B0-F test results.
- Local mic test result, if separately admitted; no audio/transcript content in evidence.
- Live provider benchmark result only if credentials, consent, corpus, F0 tier, and admission existed; otherwise retain the exact pending status.
- Mixed-language decision: `PASS` only for a permitted non-preview F0 configuration that meets the frozen corpus gate; otherwise `BLOCKED` with the official limitation and one user decision request.
- No claim of insertion, runnable product, M1–M9 completion, or independent verification.

## Stop rules

Stop and return to the parent if: package/API behavior requires a different provider or paid tier; the mixed gate depends on preview; F0 refuses the approved real-time configuration; bounded capture cannot preserve frames; cancellation/final fencing cannot be made at-most-once; credentials/consent/corpus are requested from an agent; or a proposed change expands beyond B0. The owner retains technical responsibility and the fresh verifier must receive a separate evidence path.

**Current live status:** Azure live recognition is `PENDING_MISSING_USER_CREDENTIALS_AND_CONSENTED_CORPUS`; mixed-language release feasibility is `BLOCKED_PENDING_NON_PREVIEW_F0_RESULT`; implementation is not started in this owner stage.
