---
title: Desktop voice actor — 30-minute MVP implementation packet
status: FROZEN_FOR_DISTINCT_IMPLEMENTER
updated: 2026-10-24 17:42 +08:00
contract: frozen-mvp-contract.md
owner: mvp30-owner-01
baseline: 0c3155d560692d4042c5fdb7cb6a569cbf4c0cee
---

# Implementation packet

This packet is for a **distinct implementation worker**. The parent coordinator does not write product code. Keep the work isolated to the fresh MVP worktree and deliver an artifact; do not commit, push, merge, deploy, install globally, or modify other worktrees.

## Exact implementer prompt

> You are the distinct implementer for the experimental 30-minute desktop voice MVP. Build only the frozen contract in `frozen-mvp-contract.md`; do not implement the retained full M1–M9 product. Use the fastest already-installed local backend: Windows SAPI 8.0 via built-in .NET Framework `System.Speech` from a Windows PowerShell 5.1 WPF launcher. Do not download NuGet packages, models, runtimes, browsers, cloud SDKs, or use any network/API. Do not add global hotkeys, tray, overlay, automatic insertion, automatic paste, history, telemetry, audio files, or quality benchmarks.
>
> Deliver a clearly labeled launcher/script under `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\outputs\mvp30\`: `VoiceMvp.ps1`, a same-folder `Launch-VoiceMvp.cmd` that invokes 64-bit Windows PowerShell 5.1 with `-NoProfile -STA -ExecutionPolicy Bypass`, `README.md`, and `SHA256SUMS.txt`. The process-local ExecutionPolicy flag is only for launching this script; do not change machine/user policy. An EXE is optional only if truly straightforward without package acquisition; the script remains the required fallback and must be labeled as such.
>
> The WPF window must have a language selector populated from `SpeechRecognitionEngine.InstalledRecognizers()` (do not claim a language that is absent), visible status text, an editable transcript/review TextBox, and explicit Start, Stop, Cancel, Copy, and optionally Clear buttons. Start is the only action allowed to create a `SpeechRecognitionEngine`, call `SetInputToDefaultAudioDevice`, or begin recognition. Never open audio on launch, language selection, window activation, or Copy. Copy must call the clipboard only after the user clicks Copy; never auto-copy or inject into another application.
>
> On Start, use the selected installed `RecognizerInfo.Culture`, create the engine, subscribe to `SpeechHypothesized`, `SpeechRecognized`, `RecognizeCompleted`, and `AudioStateChanged` as useful, then set default audio input and begin `RecognizeAsync(RecognizeMode.Multiple)`. Show hypotheses as best-effort live preview. If the selected recognizer emits no hypotheses, show a truthful status that live partials are unavailable; do not fabricate partials. Aggregate final recognized text into the editable review field. Keep all UI changes on the WPF dispatcher.
>
> Implement a strict session/generation fence: every callback captures the current session id; callbacks from a stopped, cancelled, timed-out, disposed, or errored engine must be ignored. Stop requests `RecognizeAsyncStop`, enters Finalizing, and has a 10-second finalization timeout before a visible Error/Ready decision. Cancel requests `RecognizeAsyncCancel`, invalidates the session id before disposal, clears the current transcript, and returns to Cancelled/Idle without dispatching text. Add a 30-second maximum session timer that stops recognition with an explicit “session limit reached” message. Do not automatically retry.
>
> Use actionable error text for missing selected language, no recognizer, microphone/default-device failure, permission denial, recognition failure, finalization timeout, and clipboard failure. The error must say what the user can do next (choose another installed language, allow microphone access and click Start again, retry manually, or use the editable text). Do not write audio, transcripts, logs containing transcript content, history, telemetry, or network data to disk.
>
> The README must state: this is an experimental local SAPI MVP and not the full release; installed evidence covers English `en-US`, Simplified Chinese `zh-CN`, and Japanese `ja-JP` on the planning device; mixed Chinese-English recognition, punctuation, accuracy, latency, and live partials are unverified/best effort; no Paraformer equivalence is claimed; Start is the only microphone-opening action; Copy is manual; Cancel discards; no cross-application insertion is provided; Windows PowerShell 5.1 and microphone permission are prerequisites; and the exact launch, stop, cancel, limitation, and cleanup instructions.
>
> Before handoff, run a syntax/load smoke check that does not open a recognizer or microphone, launch the window once, verify it starts Idle, and calculate SHA-256 fingerprints. If a requirement cannot be completed in the timebox, leave it as a visible status/error or documented limitation—never silently widen scope or fake support.

## Backend and language facts for the worker

- Primary: Windows SAPI 8.0 desktop recognizers through `.NET Framework System.Speech`.
- Launcher: Windows PowerShell 5.1, WPF, `-STA`.
- Read-only installed token evidence: `MS-1033-80-DESK`/`en-US`, `MS-2052-80-DESK`/`zh-CN`, `MS-1041-80-DESK`/`ja-JP`.
- Portable .NET 10.0.402 SDK and `Microsoft.WindowsDesktop.App 10.0.13` exist only at `.work\worktrees\voice-b0-toolchain-L7GDB\.work\tools\dotnet`; `System.Speech.dll` was not found there. Do not spend the MVP window acquiring it.
- Capability evidence is metadata-only. It does not authorize or imply a microphone test, permission grant, quality result, or mixed-language result.

## Required state and privacy contract

| State | Required behavior |
|---|---|
| Idle | No audio input. Start enabled. Copy disabled when transcript is empty. |
| Starting | Engine/device setup in progress; no duplicate Start. |
| Listening | Mic is open only because the user clicked Start. Stop and Cancel enabled. |
| Finalizing | Stop requested; late callbacks remain fenced; Cancel remains available. |
| Ready | Editable transcript is available; Copy requires an explicit click. |
| Cancelled | Transcript discarded; no copy/insertion; return to Idle after visible status. |
| Error | Actionable message; no silent retry; user may choose language or retry Start manually. |

No default audio/history files, telemetry, cloud calls, runtime network access, automatic target selection, target focus changes, automatic insertion, or background capture are allowed.

## Time budget and build order

**Implementer: 15 minutes maximum.**

1. **0–2 min:** Inspect the contract and confirm Windows PowerShell 5.1/WPF/System.Speech; create only the output folder and launcher files.
2. **2–5 min:** Build the window, language discovery, status, transcript, and buttons; perform no microphone setup at startup.
3. **5–10 min:** Add Start/Stop/Cancel lifecycle, SAPI event wiring, hypothesis/final text, 30-second bound, 10-second finalization boundary, and session fence.
4. **10–12 min:** Add explicit Copy, actionable failures, cleanup/disposal, and truthful limitation text.
5. **12–15 min:** Write README, run syntax/load/idle smoke checks, calculate SHA-256, and hand off. Stop if package/model/network work appears necessary.

**Verifier: 2–4 minutes maximum, independent and fresh.** Do not edit the implementation while verifying. A real Start/microphone test requires explicit operator consent; absent that consent, verify the no-surprise-mic path and report microphone execution as not tested rather than granting a PASS.

## Verifier checklist

1. Confirm output contains `VoiceMvp.ps1`, `Launch-VoiceMvp.cmd`, `README.md`, and `SHA256SUMS.txt`; verify recorded hashes match.
2. Run the launcher or script once. Confirm the window opens Idle, lists only discovered languages, and shows no microphone prompt/device activity before Start.
3. Confirm Start, Stop, Cancel, editable review, and explicit Copy are visible and state-gated. Copy must be disabled or harmless with empty text.
4. If operator consent exists, click Start once, confirm Listening, then Stop and inspect Ready/Finalizing; otherwise leave microphone execution as NOT TESTED. Click Cancel in an authorized session and confirm text is discarded.
5. Inspect README for local-only/no-history/no-telemetry/no-insertion limitations and the exact `en-US`/`zh-CN`/`ja-JP` evidence caveat. Reject any Paraformer, bilingual-quality, accuracy, “any app,” or automatic-insertion claim.
6. Record only `PASS_MVP_SMOKE`, `PASS_MVP_MIC` (only if explicitly tested), or a precise blocker. No full-product PASS is possible from this packet.

## Handoff and fingerprint requirements

The final artifact folder is:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\outputs\mvp30`

`SHA256SUMS.txt` must contain hashes for every delivered source/launcher/README file and any EXE if one is produced. The worker must report absolute paths, file sizes, hashes, launch command, and whether microphone execution was tested or not tested. The output is a runnable local experimental launcher, not a signed installer, not a deployment, and not a full release.

## Stop conditions

Stop and report a blocker if Windows PowerShell 5.1/WPF/System.Speech cannot load, the required language token is absent, microphone permission/device setup fails, or the 15-minute window would require package/model/network acquisition. A blocker is preferable to replacing SAPI with a cloud engine, downloading the previous Paraformer, opening the microphone before Start, writing hidden history, or making an unsupported quality claim.
