---
title: Desktop voice input — architecture and must-have scope
status: approved-amended
updated: 2026-10-24
author: Manus AI
task_id: L7GDBgpjafN6JpLyExdHdJ
---

# Desktop voice input — architecture and must-have scope

> **Approved amendment — 2026-10-24 16:15:39+08:00:** “Offline-first; preserve live partials and benchmark bilingual streaming Paraformer.” This supersedes the Azure-only-first-release/provider-approval posture. The local model/runtime is not installed or benchmarked yet; this document records revised feasibility and implementation gates, not a product PASS or an accuracy promise. Azure/cloud remains an optional later provider and is not an initial prerequisite.

Build a Windows-native dictation tool that lives in the tray: focus a text field, press a shortcut, speak, press again, and receive faithful written text at the intended caret. It must feel like an input method across applications, not a speech-to-text page. The first release is complete only when **every M1–M9 must-have below passes its acceptance checks**. Nice-to-haves are explicitly outside that release. The initial recognition path is local sherpa-onnx with the bilingual streaming Paraformer candidate; inference must work with networking disabled after assets are installed.

You confirmed Windows-first, a native desktop app, and the amended offline-first decision with live partials and bilingual streaming Paraformer benchmarking. The stack, interaction details and release gates below are the revised feasibility plan. Your 30-minute budget is for this planning task; it is not a promise that the entire product can be built in 30 minutes. No product code, model/runtime assets, dependencies, cloud resources or account changes have been created.

[Short decision packet](decision.md) · [Retained source evidence](evidence/source-excerpts.md)

## 1. Existing context and what changes

The local brief is `task.md.txt`, lines 1–12. A file named `tasks.md` was not present in the task directory; I used the matching desktop voice-input brief and read the earlier `architecture/architecture.md` and `plans/plan.md` drafts. The brief's suggestions remain inputs to prioritization, not an automatic commitment to every possible feature.

There is no existing product solution, test runner or provider integration to preserve. The repository HEAD is `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`; the original checkout has unrelated/uncommitted material that remains untouched. Planning was done in a new detached worktree at the same HEAD. This is a greenfield product architecture, not a tested improvement to working software.

The earlier drafts correctly emphasize deliberate recording, cancellation, provider isolation and target safety. This proposal makes the scope actionable: select a concrete Windows stack, use toggle activation first, keep semantic rewriting out of the critical path, make mixed-language quality a release gate, and prefer clipboard-free insertion. It also adds explicit recovery, session limits, credential protection and a runnable-build gate.

## 2. Must-have features

### M1 — A real desktop input tool

A per-user, single-instance tray app must register one configurable global shortcut, detect registration/collision failures and let the user rebind it. Proposed default: **Ctrl+Alt+Space**, subject to an actual collision check. First press starts recording; second press stops and finalizes. Escape cancels an active session. Repeated key events cannot open duplicate sessions, and a second launch cannot create another recorder.

Toggle is the initial mode because it needs a simpler, testable activation lifecycle than reliable press-and-hold release detection. `RegisterHotKey` provides global activation and can fail on conflicts; it is not a complete push-to-talk implementation. [1] Register bare Escape only from Arming through the active processing/dispatch lifecycle, and consume it for cancellation during that interval; the target application does not also receive Escape. Unregister on every terminal path, before recovery takes focus, so idle Escape passes through normally. A failed Escape registration blocks microphone-open and reports the conflict; no alternate cancellation shortcut is silently substituted. Recovery handles Escape locally to close/discard. Starting while processing produces busy feedback, not a second session.

### M2 — First-use success and microphone setup

Onboarding must explain local model setup, asset provenance/license, local privacy/no-telemetry behavior, explicit Windows microphone permission, check the shortcut, enumerate/select a microphone and show a live level test. It finishes with local dictation into an app-owned practice field and a clear explanation of stop, cancel, and model readiness. The practice recording needs its own explicit Start action; opening settings or onboarding must not start the mic.

Missing model assets, failed asset verification, denied/revoked Windows microphone permission, or an unavailable local runtime blocks shortcut dictation and recognition practice, with no inference and no capture file. An explicitly started **local microphone-level test** may still run without model readiness: it sends nothing to a provider, creates no transcript and cannot count as completed onboarding. A future cloud provider, if added, needs separate provider-specific consent and protected credentials; it is not part of initial onboarding. These distinctions must be visible in copy and tests.

Windows permission guidance must reflect actual microphone-open failures and privacy settings. Do not present a fictitious macOS-style “accessibility permission” grant on Windows. Denied access, a missing device, bad credentials, no signal and a failed practice test each need a repair path. A device disappearing mid-session stops that session rather than silently recording from a different microphone.

### M3 — Clear, non-focus-stealing feedback

A small non-activating overlay must show Listening, Processing, Sent/Success, Cancelled and Error states, elapsed recording time, input level, and the stop/cancel shortcut. Live partial text is overlay-only and may revise; it never appears in the user's field before finalization. The local online recognizer must expose partial/final events through the provider-neutral contract; any later cloud provider must satisfy the same boundary.

The overlay must not activate, move the caret or become the insertion target. Interactive editing appears only in the deliberate recovery/settings surface after capture has stopped. Labels must distinguish recording from processing; color alone is insufficient. Onboarding, settings, recovery and primary session controls must be keyboard-operable.

### M4 — Faithful English, Mandarin and mixed-language output

The initial release must handle English, Mandarin with Simplified Chinese output, and representative Mandarin/English code-switching within one utterance. Offer English, Mandarin and Mixed choices. The selected feasibility path is local sherpa-onnx **`sherpa-onnx-streaming-paraformer-bilingual-zh-en`**, CPU-first, with streaming partials. Its catalog's bilingual example is capability evidence only; the mixed option is not released without the approved corpus benchmark.

Use model output plus a conservative deterministic local formatter for readable spacing. Punctuation faithfulness is an explicit benchmark dimension: the first spike must measure raw Paraformer output, any separately shipped local punctuation asset, its license/hash, added latency and revision behavior. Do not assume the ASR model supplies faithful punctuation or silently add an unreviewed punctuation model. Preserve names, numbers, negations and intent from the finalized transcript. The formatter must not paraphrase, translate, summarize, add facts or interpret speech as commands. For the initial safe insertion path, normalize line/tab/control characters to spaces rather than generating Enter or other command keys. Sentence punctuation remains when recognized; spoken multi-paragraph commands can come later.

Mixed-language quality is a **must-have feasibility and release gate**. The initial provider contract is local sherpa-onnx Paraformer; no Azure credentials, paid service, cloud prerequisite or provider call is required. If the local candidate does not pass, stop the gate and return the measured blocker; do not quietly ship an English-only subset, replace streaming with final-only Whisper, or lower thresholds. Recognition will still make mistakes in real use; the acceptance corpus establishes an honest supported scope, not perfect accuracy. A later cloud challenger requires a separate provider decision and disclosure.

### M5 — Safe caret insertion across a defined app matrix

The proposed launch matrix is Windows Notepad, Microsoft Edge standard textarea/plain contenteditable fields, and VS Code's untitled plain-text editor. This covers native, browser and Electron-style applications without claiming universal compatibility. Exact installed versions and accessibility/caret support must be established in the first insertion spike. A missing/unsupported application requires an approved substitution or a working tested adapter, not an unnoticed reduction of the matrix.

Text must go into the field captured when recording started, only while that field and caret/selection remain eligible. Normal selection replacement is allowed, like ordinary typing; whole-field replacement is not. Unknown targets, changed fields, sensitive/password controls, read-only controls, elevated/protected processes and remote-desktop/terminal surfaces must not receive automatic input. The app never raises its privilege, reactivates an old window, moves the user's caret or sends Enter to submit a message.

M5 acceptance requires **zero observed missed or incorrect insertions in the named positive test matrix**, with exact expected target contents observed independently of the OS API return. `InputSent` alone is not a passing acceptance result. Where a target adapter can verify mutation without collecting unrelated document contents, use it; otherwise the verifier observes the controlled test field. Production feedback remains “Text sent” unless insertion is genuinely verified. If direct input cannot pass, resolve the adapter approach in B0 or return the blocker for an explicitly approved scope change; do not disguise silent misses as success.

Use UI Automation for target identity, editability and selection/caret evidence. `TextPattern` is read-only and cannot insert text; generic whole-value mutation is not a universal caret-insertion solution. [4] Prefer a tested Unicode `SendInput` adapter without clipboard mutation. Its integrity restrictions and input-routing limitations remain real: Windows restricts injection into higher-integrity applications. [5]

### M6 — Recover the text without guessing a destination

If a completed transcript cannot be inserted safely, show an editable, session-scoped recovery preview with **Copy** and **Discard**. Copy is explicit and tells the user it changes the clipboard. It does not silently paste into a new field. The normal routine flow does not require this preview.

If an insertion was partially dispatched or its outcome is uncertain, say that text may already be present and ask the user to inspect the field before copying. Never automatically retry an uncertain insertion. Provider failure before a final result may offer clearly marked incomplete text if any exists; it must not disguise a partial transcript as final. Cancel discards uncommitted content rather than opening recovery with cancelled speech.

### M7 — Privacy, consent and credential protection

No recording while idle. No cloud audio before provider-specific consent. Show “Cloud · Azure” while recording/processing, and let the user revoke consent in settings. Existing consent covers later deliberate shortcut sessions; it is not repeated as a modal interruption every time. Changing provider or materially changing data handling requires renewed consent. Revocation stops active capture/transmission and suppresses pending insertion.

The app must not write audio, transcripts or history to disk by default. Store preferences/consent only, and keep diagnostics local and content-free. An explicit Copy exposes text to clipboard history/managers; that is separate from app-local no-history. Managed-memory disposal also cannot promise forensic erasure or control over OS crash dumps.

For this local/interview build, use the user's own Azure key and region, protected by Windows CurrentUser DPAPI in a separate credential blob. Never put a shared vendor secret, Manus session credential or plaintext key in source, the executable, ordinary settings, logs or the installer. This protects storage against other users, not malware running as the same user. A public product without user-supplied keys would need a token broker/account system; that is a different deployment scope.

Microsoft's current real-time speech documentation states that audio is processed in server memory, with no data at rest, and that Microsoft does not retain/store customer data for this mode. [6] Use that documented mode, not batch transcription, training, uploaded custom datasets or an unreviewed logging feature. Review actual Azure region/resource options before live use. Cancellation can stop new capture and suppress results, but cannot recall bytes already sent.

### M8 — Bounded, resilient sessions

One active session, bounded audio queues, no-speech handling, timeouts, stale callback rejection and cancellation at every pre-commit stage are mandatory. Proposed limits: 60-second maximum recording, 15-second finalization timeout, and at most two seconds of queued provider-format audio. Queue overload is a visible failure; do not silently drop audio or grow memory without limit.

Sleep, lock, shutdown and device loss terminate capture. Network/provider errors never create stale inserts. Do not automatically restart recording or switch providers/microphones. Escape stops capture and invalidates the session; cancellation that arrives after input has already been dispatched cannot retract it safely. That boundary must be explicit in the UI and tests.

### M9 — A runnable, verified handoff

Deliver a runnable Windows x64 build plus setup/usage instructions, all M1–M8 automated checks, supervised cross-app acceptance, bilingual evaluation results and known limitations. A portable self-contained folder/zip is sufficient for the local build; preserve required native SDK dependencies rather than assuming a single executable works. Public signing/MSIX/update services are deferred, but a runnable desktop artifact is not.

The clean-machine baseline is a supported, patched Windows 11 x64 system running as a standard user, without a .NET SDK or separately installed .NET runtime. Any additional native runtime prerequisite must be identified in B0 and explicitly detected/documented; a missing prerequisite is not a successful clean-machine run. Do not claim zero-install prerequisites until measured.

No must-have is complete based only on a fake transcript or an app-owned textbox demo. The real microphone/provider loop and the three approved external application surfaces must pass. No build or product test has been run in this planning task.

## 3. Nice-to-have features

**Recognition quality extensions.** Personal vocabulary/dictionary UI, additional languages, Traditional Chinese preferences, custom speech training and context hints can improve difficult names. A dictionary should supply provider hints, not blindly replace every matching substring. It comes after baseline recognition; if the selected provider cannot meet M4 without a particular hint mechanism, that minimal mechanism becomes part of M4 rather than an excuse to miss the gate.

**Interaction and writing extensions.** Push-to-talk, voice punctuation/paragraph commands, app-specific styles, opt-in grammar/tone rewriting and safe user-requested undo can follow. Rewriting remains a separate reviewed action with a faithful-original option. Never make an LLM cleanup call mandatory for ordinary dictation.

**Privacy and deployment extensions.** Optional encrypted history, startup integration, public signed installer/updater, managed credentials/accounts/billing, optional future cloud providers and cross-device sync can follow. Initial local inference must not fetch remotely or emit telemetry; an unavailable network is not an error after verified assets are installed. A future cloud provider remains opt-in and must not weaken local privacy defaults.

**Compatibility extensions.** Guarded clipboard paste, application-specific adapters, TSF/true OS input-method registration and macOS/Linux shells can expand coverage. Clipboard paste is not necessary for M5 if the approved direct-input matrix passes. Universal rich-editor, terminal and remote-desktop support is not a first-release claim.

## 4. Recommended stack and rejected directions

Use **C# + .NET 10 LTS + WPF**, with a small explicit MVVM layer, `NAudio.Wasapi` 3.x for microphone frames, sherpa-onnx's C# binding for local online Paraformer, isolated Win32 interop, and xUnit core/integration tests. Target `net10.0-windows`/Windows x64 and lock tested SDK/package/native/model versions during the first authorized implementation step. Microsoft's current policy lists .NET 10 as active LTS through November 2028; .NET 8/9 end support in November 2026. [7] .NET tooling was not found on PATH in this inspection, so SDK installation is an implementation prerequisite, not an accomplished fact.

NAudio's current recommended capture API is `WasapiRecorder`, not an assumed legacy `WasapiCapture`. Its documentation supports device selection, async capture and non-blocking disposal, and warns that callback spans are valid only during the callback. [8] Use microphone/shared-mode capture only; no speaker/loopback capture. Request the provider's validated PCM format and copy/lease frames into a bounded queue. Freeze the actual NAudio package version and sherpa/ONNX native dependencies after a real restore/build check; repository docs alone do not prove compatibility.

The initial provider is the local sherpa-onnx online Paraformer adapter. The catalog documents Windows/C# support, Chinese-English streaming and evolving results, but .NET 10 compatibility, native packaging, model files, punctuation, quality and latency remain unverified. Keep provider-neutral contracts so a future Azure/cloud adapter can be added only with fresh consent and a separate decision. Do not infer model/runtime behavior or license rights from memory; record exact restored versions and asset hashes.

WPF is preferred over Electron/Tauri here because most difficult work is Windows focus, input, tray, capture and overlay integration. A webview bridge adds another boundary without removing the native work. This is a design judgment, not a measured size/performance comparison. A browser dictation page fails the cross-application brief. Delegating entirely to Windows voice typing gives less control over session safety/recovery; its useful prior art is the shortcut-to-text-box interaction. [10]

Use one desktop process and no product backend for the user-key build. No SQLite database, local HTTP service, microservices, plugin engine, screen-content collector or mandatory LLM pipeline is justified by the must-have scope. Superwhisper's documentation separates voice/language/model choice from optional AI modes; adopt that separation, not its unverified “any app” coverage as our acceptance evidence. [11]

## 5. Component architecture

```text
Global hotkey / tray
        |
        v
SessionCoordinator ---- state events ----> Non-activating overlay / recovery UI
        |
        +-- FocusGuard: capture + monitor + final validation
        +-- AudioCapture -- bounded frames --> SpeechProvider -- final Transcript
        +-- FaithfulFormatter -------------------------------> WrittenText
        +-- InsertionRouter ---> validated target OR explicit recovery
        |
        +-- Settings / consent / protected credentials
        +-- Local content-free diagnostics
```

The core processes commands serially and owns one session ID, cancellation token and terminal-outcome decision. Audio/network work is asynchronous; UI state updates return to the WPF dispatcher. Never do network calls or slow UI Automation work on the UI message pump. Wrap UI Automation calls in a dedicated worker with bounded timeouts; a hung third-party provider makes the target uncertain, not a reason to block recording controls.

Use four projects. `VoiceInput.Core` owns contracts, state machine, formatting and insertion policy without WPF/provider dependencies. `VoiceInput.Windows` owns hotkey, focus, capture, input and local asset/permission adapters. `VoiceInput.Speech` owns the sherpa-onnx Paraformer configuration/events; a future cloud provider remains another adapter. `VoiceInput.App` owns WPF views/view models and composition. Tests split deterministic core cases, Windows adapter checks and supervised local-model/app acceptance.

### Core contracts

`SessionContext` contains `SessionId`, `CancellationToken`, `StartedAt`, `ConsentVersion`, language policy and ephemeral `FocusToken`. All callbacks carry `SessionId`. Old/cancelled callbacks cannot update UI for a new session or reach insertion.

`IAudioCapture.StartAsync(deviceId, format, sessionId, cancellation)` yields audio frames/status. `AudioFrame` carries format, sequence/timing and owned/leased bytes; its lifetime must outlive the native callback when queued. Capture status, not a speculative UI event, turns on the Listening indicator.

`ISpeechProvider.RecognizeAsync(frames, options, cancellation)` emits partial/final/error events. Capabilities expose locales, live partials, input format, duration and hint support. The adapter aggregates ordered finalized segments into one finalized utterance when capture ends; a mid-sentence `recognized` event alone must not cause insertion while recording continues. A cancellation/finalization fence ignores late events.

`IFocusGuard.CaptureAsync()` returns a token with HWND, process identity/integrity, UI Automation element identity, editability/sensitivity classification, focus epoch and caret/selection evidence. `ValidateAsync(token)` returns Eligible, Changed, Sensitive, Unsupported or Uncertain with a reason. Read identity/state only; do not collect surrounding document text or send app context to a provider. Where a control cannot expose enough caret/sensitivity evidence, automatic insertion requires a specific validated adapter or is unavailable.

`ITextFormatter.Format(finalTranscript, policy)` returns `WrittenText` with final text and the documented normalization applied. It is deterministic. Preserve recognized lexical content; normalize whitespace and block command-producing control characters. Do not invent missing punctuation by guessing intent.

`IInsertionRouter.TryInsertAsync(token, writtenText, sessionId, cancellation)` returns `NotAttempted`, `InputSent`, `Verified` or `Uncertain`, with route/reason. `InputSent` means all OS input events were accepted, not proof of field mutation. Use “Text sent” feedback unless a target adapter genuinely verifies insertion. Positive partial dispatch is Uncertain; never retry it. This honest distinction prevents false success and duplicate recovery.

`ISettingsStore` atomically writes a schema-versioned, validated JSON preferences file under `%LOCALAPPDATA%\VoiceInput`. It contains shortcut, device, locale, verified model manifest reference and local-permission metadata only. A future `ICredentialStore` owns a separate DPAPI-protected cloud credential blob only if a cloud provider is later added; no initial cloud credential is required. Unknown schema/corruption leads to recoverable reset/reconfiguration, not silent enablement of capture. `IDiagnostics` records durations, route, status and typed errors only; no transcript, audio, window title, raw provider payload or telemetry upload.

## 6. Session lifecycle and insertion policy

```text
Idle -> Arming -> Listening -> Finalizing -> Formatting -> Validating -> Inserting -> Done
           |          |            |            |            |
           +----------+------------+------------+------------+--> Cancelled / Error
                                      unsafe target -----------> Recovery
```

Arming checks consent, cancellation availability, target sensitivity and mic open. Known password fields are blocked before capture. Unknown or unsupported fields may use a clearly labelled **preview-only** session; they cannot auto-insert. Listening begins only when capture is live. Stop closes capture immediately, waits for a bounded final result and commits exactly one utterance. Busy start presses do not queue another recording. All terminal paths release audio/provider resources and target observers; completed recovery text stays in memory until Copy/Discard/close, and Copy closes/clears recovery after a successful clipboard operation.

Focus changes permanently invalidate auto-insertion for that session, even if the user returns to the original field. Observable same-field selection/caret changes also invalidate it. Revalidation checks process/window/control identity and caret/selection immediately before insertion. No forced focus restoration. Wait for shortcut modifiers to be released; if they remain held or target certainty is lost, recover instead of typing modifier shortcuts into the destination.

For a validated direct-input target, prepare Unicode key-down/key-up events, including correct UTF-16 surrogate handling. Recheck eligibility/cancellation and dispatch one ordered batch without Enter, Tab or other command keys. `SendInput` is not an atomic transaction with a third-party field: the last-check-to-dispatch focus race cannot be eliminated by a design claim. [5] Keep the supported matrix narrow, test races, refuse unobservable targets and report the actual dispatch result. Do not interpret event acceptance as universal proof of exact insertion.

The at-most-once fence is acquired before dispatch. Cancellation before dispatch prevents mutation; cancellation during/after accepted input is reported as too late to retract. Partial dispatch, target closure or unexpected state becomes Uncertain with no automatic replay. There is no automatic undo because it could remove unrelated user typing.

Automatic clipboard-assisted paste is disabled in this release unless M5 cannot otherwise be delivered and you approve the additional adapter scope. A future implementation needs a bounded supported-format snapshot, ownership/sequence checks, a tested target-consumption strategy and no overwrite of newer clipboard content. Arbitrary private/delayed-rendered formats cannot be promised lossless restoration, and a fixed restore delay is not proof that the recipient consumed the text. [12] Explicit manual Copy remains available and intentionally replaces the clipboard.

## 7. Build roadmap and dependency order

All steps below are **planned, not executed**. The [decision packet](decision.md) asks you to approve the complete scope before any scaffolding, installation, live provider call or implementation. Worktrees remain mandatory for implementation; create feature-specific worktrees from the approved baseline without switching/stashing the original checkout.

**B0 — Prove the risky boundaries.** Establish the task-local SDK/package/native boundary, local model asset manifest and network-disabled inference, microphone capture/disposal, global activation/active-session cancel, non-activation, three-app target/caret visibility, direct Unicode insertion and the local Paraformer bilingual behavior. Small spikes are disposable, not automatically production code. Exit only with a verified local model/runtime configuration, measured partial/final fencing, validated insertion approach and locked acceptance corpus. If M4/M5 or offline execution fails, return the measured blocker before building the rest; do not silently change provider or quality thresholds.

**B1 — Freeze contracts and build the session core.** Create `src/VoiceInput.Core/Contracts/`, `Sessions/SessionCoordinator.cs`, `Sessions/SessionState.cs` and deterministic tests under `tests/VoiceInput.Core.Tests/`. Test duplicate triggers, cancellation/final races, segment ordering, stale sessions, limits and at-most-once dispatch before implementing the coordinator. Exit with a fake-adapter end-to-end loop and zero uncontrolled state transitions. Covers the core of M1/M8.

**B2 — Native shell, focus preflight and microphone.** Create `src/VoiceInput.Windows/Hotkeys/GlobalHotkeyService.cs`, `Focus/WindowsFocusGuard.cs`, `Audio/WasapiAudioCapture.cs`, and `src/VoiceInput.App/Views/RecordingOverlay.xaml`. Build registration/cancel lifetimes, single-instance behavior, target classification, focus observers, level feedback and bounded audio. Test collision, focus theft, denied mic, device loss, lock/sleep and cancellation teardown. Exit with deliberate recording in another app while its caret stays intact. Covers M1–M3/M5/M8.

**B3 — Recognition and faithful written output.** Create `src/VoiceInput.Speech/SherpaOnnx/ParaformerSpeechProvider.cs`, `src/VoiceInput.Core/Text/FaithfulFormatter.cs` and provider/text fixtures. Implement the selected local online Paraformer, ordered revised-partial/final handling, stop/final fence, locale/mixed options and deterministic normalization. Test Chinese-English spacing, surrogate pairs, numbers/negations, no-speech, timeout, no-hallucination safeguards and late-final suppression. Benchmark raw punctuation and any separately admitted local punctuation asset rather than hand-waving it. Exit with measured local CPU-first English/Mandarin/mixed recognition with networking disabled, not only fake fixtures. Covers M3/M4/M8.

**B4 — Complete external insertion and recovery.** Create `src/VoiceInput.Windows/Insertion/UnicodeInputAdapter.cs`, `src/VoiceInput.Core/Insertion/InsertionRouter.cs`, and `src/VoiceInput.App/Views/RecoveryWindow.xaml`. Enforce target revalidation, modifier release, dispatch-result classification and editable Copy/Discard recovery. Test same-window field changes, return-to-target invalidation, caret/selection movement, sensitive/unknown/elevated targets, partial dispatch and duplicate prevention. Exit with the approved three-app matrix plus all refusal/recovery paths. Covers M5/M6/M8.

**B5 — Finish onboarding, settings and privacy.** Create `src/VoiceInput.App/Views/OnboardingWindow.xaml`, `SettingsWindow.xaml`, and `src/VoiceInput.Core/Settings/SettingsStore.cs`; keep a future `DpapiCredentialStore` optional until a cloud provider is separately approved. Integrate local model/device/license checks, actual Windows microphone permission and shortcut checks, guided practice, settings migration/reset and redacted diagnostics. Test no runtime network/telemetry, corrupted settings, no idle capture, content-free logs and no disk transcript/audio paths. Exit with a first-time user able to complete a real successful local session. Covers M2/M7 plus the integrated M1–M8 flow.

**B6 — Independent acceptance and runnable handoff.** Build a self-contained Windows x64 folder with all native dependencies, test on a clean profile/machine, run the full automated suite and supervised app/provider corpus, and document failures/known limits. Deliver usage instructions and the artifact. Covers M9 and verifies all M1–M8; do not call the release complete with any unresolved must-have.

B2 Windows adapters and B3 provider work can be implemented independently after B1 contracts are frozen; B4/B5 integrate their results. The coordinator and final integration should remain sequential. Under repository rules, an owner writes the contract, a separate implementer writes product code, and a fresh verifier checks the recorded build. No role may substitute its own success claim for independent product verification. No commit, push or deployment is implied by this document.

## 8. Acceptance and measurement gates

**Safety and insertion gates are absolute within the recorded test matrix.** Run at least 100 cases: 60 positive attempts, with 20 in each named application surface, plus at least 40 refusal/race/cancellation cases. Every positive attempt must produce the exact expected text once at the expected caret/selection, with zero observed misses; `InputSent` is not proof. Across all cases require zero wrong-target mutations, zero duplicate automatic inserts, zero Enter/submission events, and zero mutation for cancelled-before-dispatch, unknown or protected targets. Include focus switched away/back, two fields in one window, caret movement, active selection, closed target, higher integrity, held modifiers, partial API dispatch and late provider finals. Observe controlled field contents independently and report OS event acceptance separately. Verify Escape is consumed only while active, released on all terminal paths, and failed registration leaves the mic closed.

**Recognition gates are proposed release thresholds, not measured facts.** Prepare 90 locally consented evaluation utterances: 30 English, 30 Mandarin and 30 mixed, including dates, numbers, negations, technical names and normal punctuation. Evaluate the local Paraformer on the locked corpus/configuration under CPU-first clean and moderate-noise conditions with networking disabled; any future provider uses the identical corpus only after separate consent. English word error rate and Mandarin character error rate should each be no more than 15%. For mixed input, score English words plus individual Chinese characters with a fixed tokenizer; normalized mixed-token error should be no more than 15%. Require at least 90% exact recognition of designated proper-name terms and at most one severe meaning-changing error in the 30 mixed utterances. Measure punctuation faithfulness separately for raw ASR and any separately packaged punctuation stage, including its license/hash/latency. The local formatter must preserve all designated numeric/name/negation tokens from its input in deterministic tests. Record recognition errors separately from formatter errors. Test recordings are explicitly consented local evaluation artifacts, not default product history.

**Performance goals are measured targets.** On the actual Windows x64 desktop, target a visible listening state within 150 ms of successful warm mic-open/activation, p95 first non-empty partial within 1.2 seconds of speech onset, and p95 final text ready for dispatch within 2.5 seconds of Stop. Measure final dispatch duration separately. Use the speech onset as the partial-time origin, not silence before speaking. Record cold-start/model-load/setup separately, sample counts, CPU/RAM, model/runtime hashes and whether networking was disabled. A 15-second finalization timeout is a failure boundary, not the performance target. If results miss these goals, fix the local pipeline or bring the trade-off back for approval; do not claim achieved speed.

**Trust/usability gates.** Verify no mic in idle, no network socket/telemetry/model fetch during inference, no default audio/transcript/history files or content-bearing logs, and explicit Windows microphone permission plus local practice. The explicitly started local-only mic-level test may run before model readiness but is not onboarding completion; cancellation stops new frames. A future cloud provider must not capture before its separate consent and protected credential flow. A new user must complete local model/device practice and one external-app session, understand the local-only indicator, and recover from denied permission, model/runtime failure and focus change. Verify keyboard access, readable non-color state and no overlay activation. Do not type acceptance text into live accounts/messages; use controlled unsent drafts/test fields.

There is no existing solution/test command to run yet. After B1, freeze Windows-appropriate restore/build/test/publish commands against the actual solution and package versions, record baseline/candidate/build identity and have the independent verifier rerun them. No installed SDK, app compatibility, accuracy, latency, security audit or product test pass is asserted by this plan.

## 9. Extension strategy and remaining decision

New features must attach to an existing boundary rather than enlarge the coordinator. Push-to-talk supplies Start/Stop commands through the hotkey adapter. A dictionary supplies tested provider hints. Rewriting is a separate optional processor with review. Future cloud recognition implements `ISpeechProvider` behind its own consent/data-handling boundary. More apps add target/insertion adapters. Public credentials introduce a broker behind the credential/token boundary. History is a new explicitly consented storage feature, not an expansion of diagnostics. Schema-version settings and tests keep additions compatible with existing users.

The approved next action is **B0 local feasibility, then the full M1–M9 build only after its gates**. The three-app matrix, live-partial requirement, no-default-history rule and proposed quality/latency thresholds remain unchanged. The local model/runtime and corpus/hardware quality are still unknown; a failed gate returns a measured blocker rather than a silent scope reduction. A future Azure/cloud provider is optional and requires a later provider-specific decision, consent and protected credential design.

One fresh builder review identified three material gaps, now resolved in this proposal: positive insertion tests require zero observed misses rather than treating OS event acceptance as success; Escape is globally consumed only during an active session with fail-closed registration; and the local provider path has explicit model/microphone readiness with a separately explicit local microphone test. The retained [independent builder review](evidence/builder-review.md) is a design check, not product verification. Historic Azure reasoning remains in the preserved pre-amendment bytes and source evidence; it is no longer the initial gate.

The architecture amendment is approved for revised feasibility planning. This is not a product PASS and does not authorize installs, downloads, builds, microphone/model calls, cloud calls, or implementation without separate coordinator admission.

## References

Sources retrieved 2026-10-24. Product examples are documented affordances, not firsthand app tests or comparative benchmarks.

[1]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey "Microsoft RegisterHotKey API and collision behavior"
[2]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-recognize-speech "Azure intermediate and final recognition events and refinement"
[3]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support "Azure Speech language support by functionality"
[4]: https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-textpattern-overview "Microsoft UI Automation TextPattern overview"
[5]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput "Microsoft SendInput API and integrity restrictions"
[6]: https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/speech-to-text/data-privacy-security "Azure Speech real-time data privacy and retention"
[7]: https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core ".NET supported releases and lifecycle policy"
[8]: https://github.com/naudio/NAudio/blob/main/Docs/WasapiRecorder.md "NAudio modern WASAPI microphone capture"
[9]: https://platform.openai.com/docs/guides/realtime-transcription "OpenAI Realtime transcription lifecycle and evaluation guidance"
[10]: https://support.microsoft.com/en-us/accessibility/windows/use-voice-typing-to-talk-instead-of-type-on-your-pc "Microsoft Windows voice typing interaction and requirements"
[11]: https://superwhisper.com/docs/modes/modes "Superwhisper separation of language models and optional modes"
[12]: https://learn.microsoft.com/en-us/windows/win32/dataxchg/clipboard-operations "Microsoft clipboard ownership formats and delayed rendering"
