---
task_id: 1
status: draft
updated: 2026-10-24
---

# Desktop voice input Implementation Plan

**Spec:** [Architecture](../architecture/architecture.md)

**Goal:** Deliver deliberate, cancellable desktop dictation that produces written text and inserts it into the intended application without losing focus or privacy control.

**Architecture:** Native session shell → provider-neutral speech adapter → explicit text processing → capability-checked insertion. The `FocusToken`, `Transcript`, `WrittenText` and `InsertionResult` contracts are defined in the architecture.

**Proposed tech stack:** Windows-first C#/.NET, a native overlay, Windows accessibility/clipboard adapters and an unselected streaming speech provider. Runtime/toolkit versions and test commands require repository discovery; no provider or framework has been selected.

> For implementation workers: use unchecked checkboxes, inspect the actual repository and current Manus workflow tools, and refine this draft against the full brief. The owner writes the contract, a separate implementer writes product code, and a fresh `om-verifier` measures the candidate. No build, installation, push or deployment is authorized by this document.

## Global constraints

Recording starts only on deliberate activation. Audio/history retention is opt-in. Semantic rewriting is explicit, reviewable and cancellable. Never insert into a changed/unsupported target without a deliberate fallback. Do not bypass protected/elevated-process restrictions [4] [5]. Record actual command, baseline/candidate and build provenance before claiming product verification.

## Review focus

1. Accidental capture or lost key release → `ShortcutConflictCheck`, `PushToTalkReleaseCheck` in M2.
2. Permission denial or retained cancelled audio → `PermissionDeniedCheck`, `AudioRetentionOffCheck` in M2/M4.
3. Mixed-language/dictionary corruption or rewriting numbers → `MixedLanguagePunctuationCheck`, `ExplicitRewriteCancelCheck` in M3.
4. Wrong focus or clipboard contention → `FocusTokenInsertionCheck`, `ClipboardOwnershipCheck` in M4.
5. Provider delay/failure and unsupported apps → `StreamingLatencyCheck`, `ProtectedTargetFallbackCheck` in M3–M5.

## Milestones

### M1 — Discover the environment and freeze the contract

**Proposed artifacts:** task-local `evidence/repository-inventory.md`, `evidence/command-inventory.md`, `decisions.md`, and a contract record. Do not create an implementation repository merely by executing this checklist.

**Consumes:** original brief and architecture. **Produces:** approved OS/toolkit/provider decisions, observed repository/test commands, hotkey release strategy, app matrix and fixed acceptance targets.

- [ ] Inspect the actual implementation repository, versions, package/test commands and current changes; record gaps without inventing scripts.
- [ ] Decide microphone/provider consent, retention, rewriting, dictionary schema and supported applications. Confirm activation and release handling separately; `RegisterHotKey` provides activation, not the entire hold/release interaction [1].
- [ ] Capture a baseline and finalize measurable checks. Proposed performance targets are first partial text within 1 second of speech and insertable final text within 2 seconds of release on a documented provider/device/network fixture. These are targets to validate, not achieved results or official requirements.

### M2 — Onboarding, shortcut and session state

**Proposed files:** `src/Shell/ShortcutCoordinator.cs`, `src/Shell/CaptureSession.cs`, `src/UI/RecordingOverlay.*`; tests under the discovered test root.

**Consumes:** `ShortcutPolicy`, permission and OS events. **Produces:** session-scoped start/cancel/completion and visible state transitions.

- [ ] Write focused failing tests for collision, denied microphone access, held/released keys, duplicate triggers and cancellation.
- [ ] Implement the smallest non-focus-stealing overlay and session state machine, with first-run permission/shortcut guidance.
- [ ] Run the recorded test command and inspect `ShortcutConflictCheck`, `PushToTalkReleaseCheck` and `PermissionDeniedCheck`. Idle/cancelled states must not keep recording.

### M3 — Streaming recognition and explicit written transformation

**Proposed files:** `src/Speech/IStreamAdapter.cs`, `src/Text/TextTransformer.cs`, speech/text fixtures.

**Consumes:** audio frames, locale, dictionary hints and cancellation. **Produces:** `Transcript { sessionId, text, isFinal, locale }`, `WrittenText { sessionId, text, transformed }`, typed provider failure.

- [ ] Write failing fixtures for partial/final ordering, mixed Chinese-English, punctuation, names/numbers, dictionary terms, provider timeout and cancelled rewriting.
- [ ] Implement a provider-neutral stream and basic formatting; keep semantic rewriting opt-in and suppress stale session results.
- [ ] Run `StreamingLatencyCheck`, `MixedLanguagePunctuationCheck` and `ExplicitRewriteCancelCheck`. Record live latency and recognition errors separately from deterministic fixture outcomes.

### M4 — Safe insertion and privacy controls

**Proposed files:** `src/Insertion/InsertionRouter.cs`, accessibility/clipboard platform adapters and insertion fixtures.

**Consumes:** pre-overlay `FocusToken`, final text, target capabilities and consent. **Produces:** `InsertionResult { route, inserted, reason }`.

- [ ] Write failing tests for focus change, unsupported/protected targets, clipboard ownership changes, cancelled sessions and retention off.
- [ ] Implement supported UI Automation insertion [2], consented clipboard fallback [3], and visible preview/manual-copy refusal. Restore clipboard data only if no newer user change would be overwritten.
- [ ] Run `FocusTokenInsertionCheck`, `ClipboardOwnershipCheck`, `ProtectedTargetFallbackCheck` and `AudioRetentionOffCheck`. Verify no silent paste, privilege escalation or transcript/credential logging.

### M5 — Independent verification and demo packet

**Artifacts:** task-local `evidence/` with scoped results and before/after captures; `verification/<run-id>/verify-report.md`; `how-to-try.md`.

- [ ] Freeze the change-defining positive flow and its failing baseline observation. Label cancellation, permission and error checks separately as regression guards; passing a negative-input guard on both revisions is not proof of the new feature.
- [ ] Have a fresh verifier rerun the named checks on recorded baseline/candidate builds and inspect the write-up and pictures.
- [ ] Demo cold-app onboarding → shortcut → partial/final mixed-language text → insertion in a safe editor; then cancel, focus loss, unsupported target, provider failure and retention controls.

## Acceptance and handoff

A deliberate valid session inserts the expected fixture text into the intended safe editor. Cancelled, denied, stale or unsupported sessions insert nothing without a new user action. Named dictionary terms/numbers survive the approved transformation fixtures. Clipboard and privacy checks hold under contention and cancellation. Performance is measured against approved fixture conditions, with unsupported languages/apps disclosed.

Handoff includes this pair, decision record, actual commands, baseline/candidate identities, fixture scope, independent verdict and known limits. Every checkbox is pending; no product test or security audit ran in this documentation pass.

Sources consulted 2026-10-24.

## References

[1]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey "RegisterHotKey function"
[2]: https://learn.microsoft.com/en-us/dotnet/api/system.windows.automation.valuepattern.setvalue?view=windowsdesktop-10.0 "ValuePattern.SetValue method"
[3]: https://learn.microsoft.com/en-us/windows/win32/dataxchg/using-the-clipboard "Using the Clipboard"
[4]: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-securityoverview "UI Automation Security Overview"
[5]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput "SendInput function"
