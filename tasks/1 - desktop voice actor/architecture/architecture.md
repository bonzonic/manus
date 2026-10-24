---
task_id: 1
status: draft
updated: 2026-10-24
---

# Desktop voice input — Architecture

[Implementation plan](../plans/plan.md)

## Brief and proposed scope

The existing local brief asks for a desktop input method: invoke a global shortcut in another application, speak, turn speech into text suitable for written communication, and insert it into the active input. It explicitly calls out onboarding and permissions, recording controls, cancellation, latency, multilingual and mixed Chinese-English speech, punctuation, proper nouns, a personal dictionary, reliable focus/insertion, unsupported applications, and privacy. A speech-to-text web page does not satisfy that brief.

Windows-first C#/.NET, a native overlay, and push-to-talk are proposed choices because the current workspace is on Windows; the original brief does not mandate that operating system or stack. Recording begins only on a deliberate trigger. Audio/history **retention** is off by default. The speech provider, UI toolkit, runtime version, packaging and distribution decisions are not yet selected.

The first slice includes permission/shortcut onboarding, visible idle/listening/transcribing/error states, partial and final text, cancel, explicit optional rewriting, language/dictionary controls, and safe insertion. Other operating systems, cloud history sync, always-on capture, and privilege-boundary bypass are out of scope.

## Components and data flow

```text
Shortcut → Session coordinator → Microphone → Speech adapter → Transcript
                 ↑                                  ↓
          Pre-overlay focus token             Explicit text processing
                 └──────────────→ Insertion router ← Written text
Session events → Non-focus-stealing overlay / privacy controls
```

**Shortcut/session coordinator** consumes `ShortcutPolicy` and OS events and produces `CaptureStarted`, `CaptureCancelled`, and `CaptureCompleted`. `RegisterHotKey` is a proposed activation mechanism [1]; dependable key-release detection for push-to-talk needs a separate platform decision. Do not assume that hotkey activation alone implements release handling.

**Speech adapter** consumes permission-approved audio frames, locale, dictionary hints and cancellation. It produces `Transcript { sessionId, text, isFinal, locale }` and typed provider errors. Provider-specific credentials and streaming formats stay behind this adapter. Network audio transmission requires clear onboarding disclosure and consent.

**Text processor** consumes a transcript and formatting policy and produces `WrittenText { sessionId, text, transformed }`. Punctuation/basic formatting are distinct from semantic rewriting. Rewriting is opt-in, reviewable and cancellable; names, numbers and intent must not silently change.

**Focus/insertion router** consumes a token captured before showing the overlay, final text and target capabilities. It produces `InsertionResult { route, inserted, reason }`. Revalidate the target and current focus before inserting. UI Automation `ValuePattern.SetValue` applies only to supporting controls [2]. A consented clipboard-assisted fallback preserves supported clipboard formats and restores them only if the clipboard is still owned by this operation; do not erase a newer user clipboard change [3]. Unsupported targets receive a preview/manual-copy path, not a silent paste into another window.

**Overlay/privacy controller** consumes session events and retention preferences. It displays recording, cancellation and provider-failure states without stealing typing focus, and discards session buffers when appropriate.

## Choice and failure boundaries

A native shell with a provider-neutral speech adapter is chosen over a web dictation page to preserve cross-application focus and global activation. Blind keystroke injection is not the universal insertion route: UI Automation and `SendInput` have protected/elevated-process restrictions [4] [5]. A failed capability or focus check must stop insertion, not raise privilege automatically.

Hotkey collision, denied microphone access, provider timeout, cancellation, focus loss and clipboard contention have explicit visible outcomes. Never record while idle. Default logs exclude audio, transcript contents and credentials; retention and provider-side handling require a separate documented policy.

## Decisions before implementation

Confirm the full brief, target OS matrix, actual repository, toolkit/runtime, hotkey release strategy, speech provider and language support, rewriting policy, dictionary schema, supported application matrix and packaging. Proposed performance targets in the plan need provider/device measurements, not a promise of achieved speed. No implementation or test result exists yet.

Sources consulted 2026-10-24.

## References

[1]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey "RegisterHotKey function"
[2]: https://learn.microsoft.com/en-us/dotnet/api/system.windows.automation.valuepattern.setvalue?view=windowsdesktop-10.0 "ValuePattern.SetValue method"
[3]: https://learn.microsoft.com/en-us/windows/win32/dataxchg/using-the-clipboard "Using the Clipboard"
[4]: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-securityoverview "UI Automation Security Overview"
[5]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput "SendInput function"
