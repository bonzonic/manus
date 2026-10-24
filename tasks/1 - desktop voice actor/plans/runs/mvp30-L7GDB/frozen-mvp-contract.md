---
title: Desktop voice actor — 30-minute experimental MVP contract
status: FROZEN_EXPERIMENTAL_MVP_NOT_FULL_RELEASE
updated: 2026-10-24 17:42 +08:00
owner: mvp30-owner-01
baseline: 0c3155d560692d4042c5fdb7cb6a569cbf4c0cee
---

# Frozen MVP contract

This is a separate, deliberately reduced experimental MVP. It is **not** the approved full product and must not be described as a full release, quality benchmark, or replacement for the retained M1–M9 plan. The full scope remains in `decision.md` for later work.

## One-window user promise

The app opens one ordinary desktop window. The user explicitly chooses an installed recognition language, clicks **Start**, speaks, then clicks **Stop**. The app shows a best-effort live preview when the selected Windows recognizer emits hypotheses, presents the final transcript in an editable review box, and copies text only after an explicit **Copy** click. **Cancel** discards the current session. No text is inserted into another application.

The window must expose visible state and actionable errors: Idle, Starting, Listening, Finalizing, Ready, Cancelled, and Error. Start is the only path that may open the microphone. A session is bounded to 30 seconds; Stop has a 10-second finalization boundary. Cancel is immediate from active/finalizing states. A session/generation fence must ignore all late callbacks after Stop, Cancel, timeout, or error.

## Backend decision and evidence

Use the fastest credible backend already on this Windows device: **Windows SAPI 8.0 desktop recognizers through the built-in .NET Framework `System.Speech` assembly, launched by Windows PowerShell 5.1/WPF**. This route avoids NuGet packages, model downloads, cloud/API calls, and runtime network access. The portable .NET 10 SDK exists in the prior toolchain worktree but contains no `System.Speech.dll`; do not spend the 15-minute implementation window acquiring packages.

Read-only capability evidence found these SAPI registry tokens:

- `MS-1033-80-DESK`: Microsoft Speech Recognizer 8.0, English (United States), `en-US`.
- `MS-2052-80-DESK`: Microsoft Speech Recognizer 8.0, Chinese Simplified (PRC), `zh-CN`.
- `MS-1041-80-DESK`: Microsoft Speech Recognizer 8.0, Japanese (Japan), `ja-JP`.

The registry and `System32\Speech\Common`/`SysWOW64\Speech\Common` metadata were inspected without instantiating a recognizer, setting input, or opening a microphone. Windows PowerShell 5.1 (`CLR 4.0.30319.42000`) loaded `System.Speech, Version=4.0.0.0` and resolved `SpeechRecognitionEngine` and its static `InstalledRecognizers` method in metadata-only checks. This establishes availability, not recognition quality, latency, mixed-language performance, or successful microphone permission.

Evidence paths:

- `coordination\implementation-20261024-L7GDB\evidence\admission-mvp30-owner-01.json` — current device lease/admission.
- `decision.md` — retained full product scope and deferred work.
- `coordination.md` — prior checkpoint and worktree boundary.
- `C:\Users\wongn\AppData\Local\Temp\manus-session-runtime-2608772344\terminal-output-2832833166.txt` — registry/token and speech-directory enumeration output.
- `.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet\dotnet.exe` — existing portable .NET 10.0.402 SDK; it is not the MVP speech backend.

## Included

1. One WPF window with language selection from the installed SAPI list.
2. Explicit Start, Stop, Cancel, Copy, and optionally Clear controls.
3. Editable transcript review field; Copy is manual and visible.
4. Hypothesis/partial display when available; otherwise a clear “live partials unavailable for this recognizer” status.
5. Local-only processing. No network, cloud, telemetry, audio files, transcript history, automatic insertion, tray, overlay, global hotkeys, clipboard auto-paste, or background capture.
6. Defensive state transitions, 30-second session limit, Stop finalization timeout, disposal, and stale-callback fencing.
7. Clear language/backend/microphone/permission/finalization error messages with a next action.
8. A launcher/script is acceptable and preferred over risky EXE packaging in this timebox. It must be clearly labeled as a PowerShell launcher in the README.

## Explicitly deferred

Global hotkeys, tray mode, overlay/non-focus-stealing shell, automatic insertion into Notepad/Edge/VS Code, automatic clipboard paste, Paraformer/sherpa-onnx, model/runtime downloads, bilingual mixed-stream claims, 90-utterance quality benchmarking, punctuation claims, full model manager, cross-application matrix, signing, installer, update path, accounts, cloud providers, and all other M1–M9 release gates.

## Acceptance boundary

A verifier may launch the artifact and verify that it starts idle, does not open audio before Start, lists only discovered/available languages, keeps Copy disabled until transcript text exists, and that Cancel/Stop/error states are visible. A real microphone click is allowed only after an operator explicitly authorizes it. The MVP passes only as a runnable local demo if the main window works, explicit controls are present, no default audio/history files or network activity are introduced, and no stale callback changes the transcript after Cancel. It must report backend or permission failure rather than pretending to recognize.

No accuracy, language breadth, live-partial, latency, or “works in any app” guarantee is made. Mixed Chinese-English utterances are **unverified best effort**. The installed `zh-CN` recognizer is not the previously proposed bilingual streaming Paraformer and must not be represented as equivalent.

## Required user decision

Before calling this MVP complete, ask: **“For this 30-minute experimental MVP, may we ship the installed Windows SAPI backend with selectable English (`en-US`), Simplified Chinese (`zh-CN`), and Japanese (`ja-JP`), while explicitly treating mixed-language recognition and live partials as best effort and making no Paraformer or accuracy promise?”**
