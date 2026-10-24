# Mic failure investigation — defect details

- **Work item:** `mvp-mic-failure-L7GDB`
- **Owner:** `om-task` defect owner; no product-code edits made
- **Canonical source:** `mvp/VoiceMvp.ps1`
- **Source SHA-256:** `53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb`
- **Baseline worktree:** `.work/worktrees/voice-mvp30-L7GDB` at `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`
- **Prior verdict:** `PASS_NO_MIC_MVP_SMOKE`; physical microphone path explicitly unverified.

## Reporter statement

At 2026-10-24 18:10:01 +08:00 the reporter said: “it didn't manage to detect my mic, so i can't say anything for it...” The exact visible status/error, whether Start was clicked, and whether the UI reached `Listening` are unknown. No audio or raw speech content was requested or recorded.

## Scope and safety boundary

Investigation was read-only. I did not launch the MVP window, click Start, instantiate a live `SpeechRecognitionEngine`, call `SetInputToDefaultAudioDevice`, call `RecognizeAsync`, alter the default device, change permissions, pair Bluetooth, install software, or collect audio. Only public metadata, service status, registry consent metadata, source, and retained evidence were inspected.

No product source, canonical output, prior verifier report, or shared worktree was edited. All new records are under this run folder.
