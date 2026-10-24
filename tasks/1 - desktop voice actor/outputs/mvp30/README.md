# Desktop Voice Actor - Experimental English Offline MVP

This folder is a runnable, deliberately reduced MVP. It is **not** the full Desktop Voice Actor release and is not an accuracy, latency, language-breadth, or cross-application quality benchmark.

## Backend and language

The MVP uses the already-installed Windows SAPI 8.0 desktop recognizer through the .NET Framework `System.Speech` assembly, launched by Windows PowerShell 5.1/WPF. This build is English-only and exposes only a discovered installed `en-US` recognizer. It does not download packages, models, runtimes, browsers, or cloud services and makes no runtime network/API calls.

Planning-device metadata-only evidence listed `MS-1033-80-DESK` (English US, `en-US`), `MS-2052-80-DESK` (Simplified Chinese, `zh-CN`), and `MS-1041-80-DESK` (Japanese, `ja-JP`). This delivered build intentionally does not promise or expose the latter languages. Installed metadata is evidence of availability, not recognition accuracy or microphone permission.

Mixed Chinese-English recognition, punctuation, accuracy, latency, and live partials are unverified best effort. Live hypotheses are shown only when the selected recognizer actually emits them; the app never fabricates partial text. No Paraformer, sherpa-onnx, bilingual-quality, or mixed-language equivalence promise is made.

## Prerequisites

- Windows with Windows PowerShell 5.1 and WPF available.
- The .NET Framework `System.Speech` assembly and at least one installed `en-US` SAPI recognizer.
- A default microphone/input device and microphone permission are needed only if the operator explicitly clicks Start.

## Launch

From this folder, double-click `Launch-VoiceMvp.cmd`, or run:

```powershell
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\VoiceMvp.ps1
```

The `-ExecutionPolicy Bypass` flag is process-only for this launch. The launcher does not change machine or user policy. The window opens Idle and performs no microphone setup before Start.

## Window behavior

- **Start** is the only action that creates `SpeechRecognitionEngine`, selects the default audio device, and begins recognition.
- **Stop** requests recognition stop and waits up to 10 seconds for finalization. A session is bounded to 30 seconds.
- **Cancel** immediately invalidates the session generation, discards its transcript, and ignores late callbacks.
- **Copy** is disabled until final text exists and only copies after an explicit click. There is no automatic paste or insertion into another application.
- The transcript is an editable review field. **Clear** removes the current review text when no session is active.
- Actionable visible error text is shown for missing language, recognizer/device/permission failure, recognition failure, finalization timeout, and clipboard failure. There is no silent retry.

The app does not save audio, transcript content, history, telemetry, logs containing transcript content, or model-training data. It does not use global hotkeys, a tray, an overlay, target application focus, automatic insertion, or automatic clipboard paste.

## Safe no-mic verification

These commands do not create a recognizer, open a microphone, or touch the real clipboard:

```powershell
# Pure lifecycle/fence self-test
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\VoiceMvp.ps1 -NoMicSelfTest

# Same self-test through the launcher
.\Launch-VoiceMvp.cmd -NoMicSelfTest

# Auto-closing idle WPF smoke (about 1.2 seconds; Start is never clicked)
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\VoiceMvp.ps1 -IdleSmoke

# Test wrapper shipped with this MVP
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Test-VoiceMvpNoMic.ps1
```

Expected markers include `NO_MIC_SELFTEST PASS`, `stale-final-ignored`, `clipboard-calls=0`, and `IDLE_SMOKE PASS phase=Idle`. These are inner-loop checks, not a final microphone or accuracy pass.

## Explicit operator test and cleanup

A real microphone test is **not performed by the safe commands above**. If an operator explicitly authorizes a user-started session, click Start once, speak, then click Stop or Cancel and inspect the visible state. Close the window with its normal close button. Closing while active cancels and disposes the engine; no background service remains. If microphone setup or permission is denied, the app reports the failure and requires a manual later Start; it does not retry around the denial.

The MVP keeps no saved content. Removing this folder removes the launcher and source; no global settings or installed files were created.

## Delivered files

- `VoiceMvp.ps1` - WPF MVP and pure no-mic state/fence self-test.
- `Launch-VoiceMvp.cmd` - process-only PowerShell 5.1 launcher.
- `Test-VoiceMvpNoMic.ps1` - safe test wrapper.
- `README.md` - scope, limitations, and operator instructions.
- `SHA256SUMS.txt` - fingerprints for delivered files.
