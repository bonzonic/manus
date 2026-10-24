# B0 Speech Recognition and Audio Feasibility Implementation Plan
> **For implementation workers:** Use checkbox (`- [ ]`) syntax for tracking. Implement sequentially in this task-specific worktree only after coordinator admission. Do not infer a solution, SDK, provider tier, corpus, or command from this plan when the repository has not proved it. No commit, push, deployment, provider call, microphone capture, or secret read is authorized by this owner packet.

**Goal:** Prove the risky audio and Azure real-time recognition boundaries for the approved desktop voice-input architecture without weakening the mixed-language release gate or changing the F0/provider decision.

**Architecture:** Keep the provider-neutral boundary from the approved architecture: explicit microphone capture produces owned, bounded `AudioFrame` values; an Azure adapter consumes those frames and emits session-scoped partial/final events; a segment aggregator and cancellation/finalization fence produce at most one finalized utterance for a future `SessionCoordinator`. Partials are preview-only; no text reaches insertion in B0. A separate local-only microphone-level path has no provider sink and is allowed before cloud consent.

**Tech Stack:** C# / .NET 10 LTS / WPF target, `NAudio.Wasapi` 3.x for shared-mode microphone capture, current Azure Cognitive Services Speech SDK for C#, xUnit for deterministic tests. These are approved choices, not installed or version-locked facts. The first implementation step must discover the actual SDK/tooling and lock package versions after a real restore/build check.

**Spec:** Approved architecture [`research.md`](../../../research.md), approved scope [`decision.md`](../../../decision.md), and original brief [`task.md.txt`](../../../task.md.txt). The retained F0 notes and official-source evidence are in [`evidence/provenance.md`](evidence/provenance.md).

## Global Constraints
- Azure Standard real-time Speech on Free F0 is the only initial provider path: 5 free audio hours/month and one concurrent real-time request; do not switch to S0, Voice Live, Azure LLM Speech, batch, fast transcription, custom speech, or another vendor.
- The proposed release remains English (`en-US`), Mandarin Simplified (`zh-CN`), and measured mixed Mandarin-English. A locale table is not a mixed-language pass.
- Microsoft documents continuous language identification as unable to detect language changes within the same sentence. Multilingual post-stream refinement supports switching but is public preview. Neither fact authorizes enabling preview or a paid path; mixed release eligibility stays blocked until an approved, non-preview F0 configuration passes the 90-utterance corpus.
- One active session only. Capture is explicit; no idle microphone open, no provider upload before provider-specific consent, and no audio, transcript, provider payload, or content-bearing diagnostic file by default.
- Audio queues are bounded to at most two seconds of provider-format audio. Queue overload is a visible typed failure; never silently drop audio or grow memory without limit.
- Every callback carries a session identity and generation/fence. Cancellation and finalization are at-most-once boundaries. A late callback cannot update a newer session or create insertion input.
- The real-time pipeline must use partial and final events from the Azure Speech SDK. Batch transcription and a fake transcript are not substitutes for B0 evidence.
- Provider credentials are user-owned and must be entered locally into a secure UI/control and protected using Windows CurrentUser DPAPI in a separate credential blob. No key may appear in source, command lines, ordinary settings, logs, build artifacts, or this packet.
- This worktree is detached at baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; the original checkout and other worktrees are out of scope. No source project or solution exists in this worktree at owner time.
- All builds, package restores, audio capture, provider calls, and live benchmarks require a fresh coordinator admission. This owner packet records future commands only; it does not claim any execution.

## Review Focus
1. **Callback-buffer lifetime:** a reused/mutated NAudio callback buffer must never change an already queued frame; test with a mutable source buffer and assert byte-for-byte ownership after callback return (Task 2).
2. **Boundedness under slow/failing recognition:** a producer faster than the provider must receive an explicit overload result while accepted frames retain contiguous sequence numbers and queue duration never exceeds two seconds (Task 2).
3. **Partial/final confusion:** intermediate text may revise the overlay but must produce zero final/commit notifications until Stop and the finalization fence (Task 3).
4. **Cancellation/final race:** after cancel or a sealed finalization fence, late provider events must be ignored and exactly one terminal result emitted (Task 3).
5. **Mixed-language scope drift:** continuous LID must not be represented as support for same-sentence code-switching; preview multilingual post-stream refinement must remain release-ineligible unless the user approves a change (Task 5).

## 1. Problem statement

The current repository baseline is an empty greenfield shell: the assigned worktree contains only `.git`, `.gitignore`, `AGENTS.md`, and a seven-byte `README.md`; there is no `.sln`, `.slnx`, `.csproj`, test runner, package lock, installed SDK evidence, audio adapter, provider adapter, or benchmark harness. Therefore no implementation command can honestly be presented as already runnable and no baseline product test can be reported.

B0 exists to establish whether the approved real-time pipeline can be built safely before B1–B6 depend on it. The hard question is not whether Azure lists English and Mandarin locales. It is whether a current C# Speech SDK streaming session can consume bounded microphone PCM, expose partial and final events, aggregate finalized segments once, fence cancellation/late callbacks, and support the approved mixed-language gate on the no-paid F0 path. Official Microsoft documentation confirms the C# SDK and real-time `Recognizing`/`Recognized` lifecycle, `en-US` and `zh-CN` real-time locales, F0's five-hour allowance and one concurrent request. It also explicitly limits continuous LID for language changes within one sentence. The last fact is a B0 release blocker, not a reason to silently change the scope.

B0 does not implement the tray app, hotkeys, WPF overlay, insertion, onboarding, DPAPI store, or final product session coordinator. It produces disposable spikes and deterministic evidence that later owners can either integrate behind the approved contracts or discard.

## 2. Architecture changes

No approved global architecture change is proposed. B0 freezes the following provider/audio boundary for later implementation:

```text
Explicit local mic test or future SessionCoordinator
        -> NAudio shared-mode microphone callback
        -> copy into owned AudioFrame
        -> bounded audio queue (<= 2 seconds)
        -> Azure Speech SDK adapter (one active F0 request)
        -> SpeechPartial / SpeechFinal / SpeechError
        -> ordered SegmentAggregator
        -> FinalizationFence / SessionResult
        -> benchmark sink only in B0; insertion is a later B3/B4 consumer
```

The expected post-scaffold project organization remains the approved four-project split. It is not present at this baseline and must not be claimed present until created and inspected:

- `src/VoiceInput.Core/Contracts/` — `AudioFrame`, `SpeechEvent`, `SpeechOptions`, `SessionId`, `FinalizationFence` and provider-neutral result types.
- `src/VoiceInput.Windows/Audio/` — NAudio/WASAPI microphone adapter and local-level test; no cloud dependency.
- `src/VoiceInput.Speech/Azure/` — Azure Speech SDK adapter, F0 configuration, partial/final event mapping and ordered segment aggregation.
- `src/VoiceInput.App/` — future WPF composition only; B0 may expose a non-production benchmark/local-test entry point but must not add insertion or focus behavior.
- `tests/VoiceInput.Core.Tests/`, `tests/VoiceInput.Windows.Tests/`, and `tests/VoiceInput.Speech.Tests/` — deterministic contract tests; live provider tests are explicitly separate and credential/corpus gated.

Required contract decisions:

- `IAudioCapture.StartAsync(AudioCaptureOptions options, string sessionId, CancellationToken cancellation)` yields owned `AudioFrame` instances and `CaptureStatus` values. `AudioFrame` carries format, monotonic sequence, sample timing, and bytes whose lifetime outlives the native callback. The implementation must use microphone capture (`DataFlow.Capture`), not loopback/render capture.
- `ISpeechProvider.StartAsync(SpeechOptions options, IAsyncEnumerable<AudioFrame> frames, string sessionId, CancellationToken cancellation)` emits `SpeechEvent` values with `SessionId`, provider sequence/segment sequence when available, event kind (`Partial`, `FinalSegment`, `NoMatch`, `Error`, `Stopped`, `Cancelled`), text, locale metadata, and timestamps. No provider payload is persisted.
- `ISpeechSegmentAggregator.Accept(SpeechEvent e)` updates overlay-only partial state or ordered final-segment state. `CompleteAfterStop()` returns one `FinalTranscript` or a typed no-speech/error result. It must reject duplicate final segment IDs and ignore events for another session.
- `IFinalizationFence` has explicit `Cancel`, `BeginStop`, `Seal`, and `TryAccept(sessionId, generation, event)` semantics. After cancel or seal, late events are ignored. Exactly one terminal outcome is observable. The future insertion boundary remains outside B0; B0 must not claim that input was sent or inserted.
- `ILocalMicTest.StartAsync(deviceId, durationLimit, cancellation)` yields level/status only. It must have no `ISpeechProvider` reference, no transcript sink, and no file sink. It is the sole pre-consent capture exception approved by M2/M7 and does not complete onboarding.
- `IF0BenchmarkHarness` accepts a consented corpus manifest and a provider-run result stream, computes English WER, Mandarin CER, mixed-token error, designated proper-name exact rate, severe mixed semantic-error count, p95 first partial, and p95 final-ready latency. With no credentials or corpus, it returns an explicit pending/blocker status, never a pass.

## 3. User flow

The future cold-start flow for B0 evidence is deliberately narrow:

1. The user creates or selects their own Azure Speech resource and confirms it is Standard real-time F0 in an allowed region. The user does not upgrade to S0, enable Voice Live, or provide a Manus/session credential.
2. In a local settings/onboarding control implemented later by the implementer, the user enters the Azure key through a secure password-style field and selects the region/endpoint. The app writes only a DPAPI-protected CurrentUser credential blob under `%LOCALAPPDATA%\\VoiceInput`; the key is never printed, placed in command arguments, included in ordinary settings, or logged. If a setup tool is provided, it must read the key interactively on the user's machine and must not echo it.
3. Before cloud consent, the user explicitly chooses **Microphone level test → Start**. The app opens the selected microphone, shows level/status, sends zero frames to Azure, creates no transcript, and closes/disposes capture on Stop, timeout, device loss, lock/sleep, or cancellation. Opening settings or onboarding alone does not open the mic.
4. After the user has verified the device, the app presents provider-specific disclosure and obtains affirmative cloud consent. Missing key, missing region, denied mic, or absent consent blocks the cloud recognition path with a visible typed reason and no upload.
5. The user chooses English, Mandarin, or Mixed. English and Mandarin use fixed locale configurations for the live feasibility run. Mixed may be exercised only as the documented F0 continuous-LID candidate and is not release-eligible if the utterance changes languages within a sentence. The preview multilingual post-stream refinement path remains disabled and visibly out of the release configuration.
6. For a supervised live benchmark, the user explicitly starts a run against the consented 90-utterance corpus: 30 English, 30 Mandarin, 30 mixed, including names, numbers, dates, negations, technical terms, and ordinary punctuation. The harness records content-free metrics and provenance, not default product history. A missing corpus or consented live credentials leaves the run **PENDING**, not PASS.
7. During a future dictation session, partials may update a non-focus-stealing overlay only. Stop closes capture, waits up to the approved 15-second finalization boundary, aggregates ordered final segments, and exposes one final transcript to the later formatter/session core. Escape/cancel invalidates the session and suppresses late events. B0 never sends text to a target application.

## 4. Solution chosen

### Chosen feasibility path

Use the current C# Azure Speech SDK continuous recognition lifecycle with an explicit audio input stream fed by bounded provider-format PCM. Fixed-language modes use `en-US` and `zh-CN`. The mixed candidate uses `AutoDetectSourceLanguageConfig` with those two locales and the continuous LID property (`SpeechServiceConnection_LanguageIdMode = Continuous`) only as a measured candidate path. The implementer must verify the exact current SDK API and package version during restore; this plan does not pin an unverified version.

The adapter maps Microsoft `Recognizing` to overlay-only partial events and `Recognized` with recognized speech to final segments. `Canceled`, `SessionStopped`, `NoMatch`, transport errors, Stop, and cancellation all cross the typed provider boundary. Final output is produced only after Stop/finalization and the session fence, not when any one `Recognized` event happens during ongoing capture.

### Feasibility finding that freezes the release gate

The official documentation makes the following distinction:

- Standard real-time Speech SDK/C# plus `en-US` and `zh-CN` is a viable F0 implementation candidate. F0 has a five-hour monthly real-time allowance and one concurrent base-endpoint request; this matches one local desktop stream.
- Continuous LID can identify multiple languages during audio, but Microsoft states it does not support changing languages within the same sentence. That does not satisfy the approved mixed Mandarin-English release claim by itself.
- Multilingual post-stream refinement is explicitly documented as public preview and supports language switching with open-range automatic detection. It is not a permitted default dependency. Enabling it, accepting any preview limitation, or moving to a paid/Voice Live/LLM Speech path requires a new user decision. B0 must stop the mixed release gate rather than ship English/Mandarin-only or silently adopt it.

### Rejected alternatives

- **Voice Live / Azure LLM Speech:** not the approved Standard real-time F0 path; F0 quotas mark Voice Live and Azure LLM Speech as not applicable, and the approved scope explicitly rejects a paid/provider switch.
- **Batch or fast transcription:** not streaming dictation, not supported on the F0 path for this scope, and cannot provide the required partial/final session lifecycle.
- **Preview multilingual post-stream refinement as the default:** technically relevant to same-sentence switching but public preview; it is a user-decision blocker, not an implementation shortcut.
- **Automatic provider fallback or a second vendor:** violates the Azure-only initial adapter and hard mixed-language release gate.
- **LLM rewrite/translation after recognition:** changes the faithful-dictation boundary and is explicitly deferred; B0 measures provider text only.
- **Unbounded buffering or silently dropped frames:** hides microphone/provider backpressure and violates M8.

## 5. Acceptance criteria

The following are frozen, binary gates. They are change-defining B0 criteria, not existing regression checks. All are pending implementation and, where marked live, pending credentials/corpus. A verifier must use a fresh report path and may not treat this owner plan as its own test result.

### B0-A — Repository/toolchain truth

- [ ] After coordinator admission, discover the actual solution/project files, .NET SDK/runtime, package versions, and test commands in the assigned worktree. If no solution exists, scaffold only the approved four-project layout and record the exact created paths; do not invent a command before that check.
- [ ] Future PowerShell preflight, to be run only after implementation scaffolding exists, must fail closed if no solution is found:
  ```powershell
  $solution = Get-ChildItem -LiteralPath (Get-Location) -Recurse -File -Include *.sln,*.slnx | Select-Object -First 1
  if (-not $solution) { throw 'No solution found; do not claim a build or test.' }
  dotnet --info
  dotnet restore $solution.FullName
  dotnet test $solution.FullName --no-restore
  ```
  These commands were not run by the owner and are not a current baseline pass.

### B0-B — Owned bounded microphone frames

- [ ] `AudioFrameQueue_RejectsWhenTwoSecondBudgetExceededWithoutSilentDrop` proves that at 16 kHz, mono, 16-bit PCM the queue's accepted buffered duration never exceeds `TimeSpan.FromSeconds(2)`, an over-budget enqueue returns a typed overload result, and accepted frame sequence numbers remain contiguous. The test must assert no implicit drop or unbounded allocation.
- [ ] `WasapiCallback_CopiesBytesBeforeCallbackReturns` mutates/reuses the source callback buffer after enqueue and asserts the dequeued frame bytes remain the original bytes. No native callback span/reference may escape into the queue.
- [ ] `Capture_UsesMicrophoneNotLoopback` asserts the real adapter requests capture input and rejects render/loopback mode. `DisposeAsync`/stop must release the device and complete the frame stream on every terminal path.
- [ ] Implementer must add bounded queue overload, device loss, cancellation, and disposal evidence without writing audio to disk.

### B0-C — Azure partial/final aggregation

- [ ] `PartialEvents_NeverCommitOrReachFutureInsertion` feeds two revised partial events and asserts overlay state changes are observable only through the partial channel; final transcript/commit count remains zero before Stop.
- [ ] `FinalSegments_AreOrderedAggregatedOnceAfterStop` feeds final segments with explicit sequence IDs (including a duplicate) and asserts one ordered final transcript, one completion event, and no duplicate segment text. The exact final text is a test fixture, not a live provider claim.
- [ ] `ProviderErrorsAndNoMatch_AreTypedAndTerminal` asserts `NoMatch`, cancellation, transport error, and session stop become distinct typed outcomes and never create a final transcript from absent/partial text.
- [ ] `F0Config_UsesOneStandardRealtimeStream` asserts the configuration model selects Standard real-time Speech, one active stream, no batch/fast/Voice Live/LLM path, and the two approved locales. A configuration unit test is not a provider success claim.

### B0-D — Cancel/final fencing

- [ ] `CancelThenLateRecognized_IsIgnored` sends a final provider event after cancellation and asserts zero final-output callbacks, zero benchmark commits, and one `Cancelled` terminal outcome for the cancelled session.
- [ ] `SealThenLateRecognized_IsIgnored` sends events after the finalization fence seals and asserts no state mutation; a second seal/terminal attempt is rejected or idempotent without duplicate output.
- [ ] `OldSessionEvent_CannotUpdateNewSession` reuses a provider callback after a new session starts and asserts the new session receives no stale text.
- [ ] The later insertion boundary must preserve the approved rule that cancellation after accepted OS input cannot retract already-dispatched text. B0 records only the provider-side fence; it must not claim insertion semantics.

### B0-E — Explicit local-only microphone test

- [ ] `LocalMicTest_RequiresExplicitStart` asserts settings/onboarding construction does not open the microphone and only an explicit Start command creates capture.
- [ ] `LocalMicTest_SendsNoProviderFramesWithoutCloudConsent` uses a spy provider and asserts zero provider frames, zero provider calls, zero transcript events, and zero content-bearing log/file writes while the local level test runs without cloud consent.
- [ ] `LocalMicTest_StopsOnCancelDeviceLossAndTimeout` asserts capture disposal and terminal status for each condition; it must not silently switch devices or restart.
- [ ] The user-visible result must say that this is a local-only level test and does not complete cloud onboarding.

### B0-F — F0 mixed-language benchmark harness and hard release gate

- [ ] `BenchmarkManifest_RequiresExactlyThirtyPerLanguage` accepts only a consented manifest with 30 English, 30 Mandarin, and 30 mixed utterances. Missing consent, missing corpus, duplicate IDs, or wrong counts returns `BlockedMissingConsentCorpus`/typed validation failure, never PASS.
- [ ] `BenchmarkMetrics_UsesFrozenThresholds` computes and reports, without changing text, English WER <= 15%, Mandarin CER <= 15%, mixed-token error <= 15%, designated proper-name exact recognition >= 90%, and at most one severe meaning-changing error across 30 mixed utterances. It also reports p95 first partial <= 1.2 s from speech onset and p95 final-ready <= 2.5 s from Stop, separately from the 15 s finalization timeout.
- [ ] `MixedMode_DoesNotClaimSameSentenceSupportFromContinuousLid` marks the continuous-LID candidate as measured-but-not-release-eligible when the corpus includes same-sentence code-switching. If the implementer exposes multilingual post-stream refinement, the capability must be labelled `PreviewOnly` and disabled in the release configuration; no paid or Voice Live switch may be hidden behind the Mixed choice.
- [ ] `LiveBenchmarkWithoutCredentialsOrCorpus_IsPending` asserts that no live result is synthesized from fixtures. The current result must remain `PENDING_MISSING_USER_CREDENTIALS_AND_CONSENTED_CORPUS`.

### B0-G — Evidence and handoff

- [ ] Record the exact solution/project paths, package/SDK versions, PowerShell commands, build output, test output, audio format, device identifier class (not a secret), provider region, F0 tier, session count, and corpus manifest hash in a B0 implementation evidence file. Do not record key material, raw audio, transcripts, window titles, or provider payloads.
- [ ] Record each gate as `PASS`, `FAIL`, or `BLOCKED`; a skipped live provider/corpus gate is not PASS. A failed mixed gate stops B1–B6 provider release work and returns the user decision described in the handoff.

### Implementation tasks (TDD packet)

#### Task 1: Confirm the scaffold and lock the disposable spike boundary
**Files:** Expected additions only after inspection: approved `src/` and `tests/` project files plus a B0 spike README. No baseline path is assumed to exist.

- [ ] Write a repository inventory test/record that proves the actual solution, target framework, SDK, and test runner before any package install.
- [ ] Run the verified repository restore/test command. If the toolchain or network/package restore is unavailable, record BLOCKED rather than replacing it with a guessed command.
- [ ] Create only the smallest disposable B0 projects needed for Tasks 2–5, preserving the four-project architecture and current worktree boundary.

#### Task 2: Implement bounded NAudio capture
**Files:** Expected `src/VoiceInput.Windows/Audio/WasapiAudioCapture.cs`, provider-neutral `src/VoiceInput.Core/Contracts/AudioFrame.cs`, bounded queue files, and Windows/core tests; confirm exact paths after scaffold.

**Interfaces:** Consume `AudioCaptureOptions`, `CancellationToken`, selected microphone ID; produce owned `AudioFrame` values and typed `CaptureStatus`/overload. Do not expose NAudio types from the core contract.

- [ ] Write the B0-B tests first and run the verified focused test command to observe the expected failure.
- [ ] Implement only shared-mode microphone capture, callback-to-owned-frame copying, bounded duration/byte accounting, explicit overload, disposal, device-loss, and cancellation behavior. Do not add provider calls or disk recording.
- [ ] Run the same focused tests and preserve the output as implementation evidence. A real microphone check is separately supervised and requires coordinator admission.

#### Task 3: Implement Azure adapter, partial/final aggregation, and fence
**Files:** Expected `src/VoiceInput.Speech/Azure/AzureSpeechProvider.cs`, `SpeechSegmentAggregator.cs`, `FinalizationFence.cs`, and speech/core tests; confirm exact paths after scaffold.

**Interfaces:** Consume `AudioFrame` and `SpeechOptions`; produce session-scoped `SpeechEvent` values and one post-Stop `FinalTranscript` or typed terminal result. Keep `Recognizing` partials separate from `Recognized` final segments.

- [ ] Write B0-C/B0-D deterministic tests first, using fake provider events and no network.
- [ ] Implement current SDK wiring only after package restore proves the APIs. Map SDK cancellation/error/session events to typed results; aggregate ordered final segments; ignore duplicate, stale, cancelled, and sealed events.
- [ ] Run deterministic tests. Do not report live recognition success from fixture tests.

#### Task 4: Implement the local-only microphone-level path
**Files:** Expected `src/VoiceInput.Windows/Audio/LocalMicLevelTest.cs` and focused tests; later WPF composition is outside B0.

**Interfaces:** Consume explicit `LocalMicTestRequest`; produce `MicLevelSample`/status only. It must have no provider, transcript, history, or insertion dependency.

- [ ] Write B0-E tests first with fake capture and spy provider/file sinks.
- [ ] Implement explicit start, bounded duration, stop/cancel/device-loss/timeout disposal, and visible local-only status.
- [ ] Run deterministic tests. A real microphone level run is not part of this owner stage and requires separate admission and user authorization.

#### Task 5: Implement the F0 benchmark harness and mixed-language decision report
**Files:** Expected `tests/VoiceInput.Speech.Tests/` metric fixtures and a disposable `spikes/B0Speech/Benchmark/` or equivalent harness path; confirm exact organization after scaffold.

**Interfaces:** Consume a consented 90-item manifest and provider result records; produce content-free `BenchmarkReport` with frozen metric thresholds, configuration metadata, and `PENDING`/`BLOCKED`/`PASS`/`FAIL` status. It must not write raw audio or transcripts by default.

- [ ] Write B0-F tests first, including exact 30/30/30 manifest validation and no-credential/no-corpus pending behavior.
- [ ] Implement deterministic WER/CER/mixed-token/name/severe-error/latency calculations and configuration labels. Keep the mixed preview path disabled and expose a hard release blocker when only continuous LID is available for same-sentence switching.
- [ ] Run fixture tests. Do not execute a provider call until the user has supplied credentials locally, granted provider-specific consent, and provided/approved the evaluation corpus.

#### Task 6: Preserve evidence for independent verification
**Files:** B0 implementation evidence under the implementer's assigned evidence directory; owner `evidence/provenance.md` is immutable owner provenance and must not be overwritten.

- [ ] Record commands only after verifying the actual solution/toolchain, plus exact build/test/package identities.
- [ ] Record live status as pending until the credentials and corpus exist; do not replace pending with a synthetic result.
- [ ] Return the candidate revision/build manifest to the parent for a fresh verifier. The owner and implementer must not self-verify release status.

## 6. Risk

- **Hard mixed-language feasibility risk:** F0/C# continuous LID is documented, but same-sentence switching is not. The approved mixed gate therefore remains unresolved until a permitted, non-preview F0 path passes the 90-item corpus. Preview multilingual post-stream refinement or a paid/Voice Live path is a user decision blocker.
- **Provider and SDK drift:** current APIs/package native dependencies are not installed or locked. A restore/build failure is a concrete implementation blocker; it is not permission to substitute another SDK or provider.
- **F0 quota:** one concurrent request means the harness must serialize live utterances and avoid hidden parallel streams. Five hours is a budget, not an unlimited test allowance; silence and tests consume allowance.
- **Audio lifetime/backpressure:** native callback spans are transient. Copying and bounded accounting must be proven before a real provider run; an overload must fail visibly rather than drop speech.
- **Cancellation race:** provider events can arrive after Stop/cancel. The fence must be tested with stale session IDs and late finals before any later insertion work.
- **Privacy/credential risk:** no agent has credentials or consent. The user must enter the key locally; DPAPI CurrentUser protects against other users, not same-user malware. Cancellation cannot recall bytes already transmitted, so consent and active cloud indication remain mandatory.
- **Environment risk:** no solution, SDK, or test command exists at baseline. The owner did not install, build, capture, call Azure, or interact with the app. All implementation and live results are pending.

**Owner decision:** B0 is ready for a separately admitted implementer, but the product is **not PASS**, the Azure live result is **PENDING**, and the mixed-language release gate is **BLOCKED** pending user credentials/consent/corpus and a non-preview F0 feasibility result.
