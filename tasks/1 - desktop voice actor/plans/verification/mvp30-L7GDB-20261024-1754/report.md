# Independent verification report — MVP30-L7GDB

**Verifier run:** `mvp30-L7GDB-20261024-1754`  
**Date/time:** 2026-10-24 17:58 +08:00  
**Verdict:** `PASS_NO_MIC_MVP_SMOKE`  
**Failure category:** `none for the reduced no-mic MVP smoke; physical microphone path remains unverified`

## Scope and provenance

This verification used the frozen reduced experimental MVP contract at `plans/runs/mvp30-L7GDB/frozen-mvp-contract.md` and the latest explicit approval in `plans/coordination/implementation-20261024-L7GDB/tasks.json`: English-only offline MVP, installed Windows SAPI 8.0 through .NET Framework `System.Speech`, Windows PowerShell 5.1/WPF. The prior bilingual/Paraformer/hotkey/insertion/full-benchmark/M1–M9 scope was not used as an acceptance criterion.

Baseline Git revision was independently confirmed as `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`. The candidate has no Git commit; candidate identity is the copied output bundle plus its SHA-256 manifest and source fingerprint. I did not treat any artifact hash as a Git commit. Candidate source fingerprint: `VoiceMvp.ps1` SHA-256 `53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb`. No code, owner file, builder file, commit, deploy, or machine-wide Git setting was changed.

The verifier admission receipt was `plans/coordination/implementation-20261024-L7GDB/evidence/admission-mvp30-verify-start-01.json`; its three fresh resource samples reported `go: true` for reservation `mvp30-verify-01`.

## Fresh checks and results

All commands were run independently from the copied candidate directory `outputs/mvp30`. The authoritative numeric results are in [`evidence/final-command-exits-20261024-1758.log`](evidence/final-command-exits-20261024-1758.log); every command returned exit 0.

| Check | Fresh command/result | Evidence |
|---|---|---|
| Parser/load | PowerShell parser command from the builder evidence; `SYNTAX_LOAD PASS`, exit 0 | `final-command-exits-20261024-1758.log`, lines 1–6 |
| Pure lifecycle/fence self-test | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\VoiceMvp.ps1 -NoMicSelfTest`; `NO_MIC_SELFTEST PASS stale-final-ignored new-generation-accepted cancel-discarded clipboard-calls=0 recognizer-created=0`, exit 0 | lines 7–12 |
| Copied launcher | `.\Launch-VoiceMvp.cmd -NoMicSelfTest`; same no-mic PASS marker, exit 0 | lines 13–18 |
| Idle WPF smoke | `powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\VoiceMvp.ps1 -IdleSmoke`; `IDLE_SMOKE PASS phase=Idle recognizers=1 clipboard-calls=0`, exit 0 | lines 19–24 |
| Copied test wrapper | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Test-VoiceMvpNoMic.ps1`; `Test-VoiceMvpNoMic PASS`, exit 0 | lines 25–30 |

The idle smoke auto-closed its owned window after approximately 1.2 seconds without Start. No real microphone session was started, no recognizer engine was instantiated by the no-mic self-test, and no real clipboard was touched.

## Integrity and baseline checks

All four non-empty entries in `outputs/mvp30/SHA256SUMS.txt` were independently hashed with `Get-FileHash -Algorithm SHA256`; every expected hash matched the actual bytes. The same run independently matched the expected `VoiceMvp.ps1` source fingerprint and recorded the actual byte sizes: launcher 266 bytes, README 4,897 bytes, wrapper 726 bytes, source 21,626 bytes. Evidence is in `evidence/verification-20261024-1755.log`, hash entries and source fingerprint at lines 5–10.

Fresh Git baseline probes found no candidate source at either `tasks/1 - desktop voice actor/outputs/mvp30/VoiceMvp.ps1` or `outputs/mvp30/VoiceMvp.ps1` in baseline `0c3155d...`; the selected baseline tree query was empty and `git rev-parse` returned exit 0. The absence result is the expected baseline condition, not a failed candidate test (lines 11–16 of the same log).

The candidate output inventory contained exactly five files before and after the checks, with no inventory delta: `Launch-VoiceMvp.cmd`, `README.md`, `SHA256SUMS.txt`, `Test-VoiceMvpNoMic.ps1`, and `VoiceMvp.ps1`. No default audio, transcript, history, or other content file appeared (lines 17–22 and 65–66).

## Production-path audit

This audit was performed against the actual production `VoiceMvp.ps1` path, not only its fixture/self-test code. Relevant source locations are recorded in the static-audit section of `evidence/verification-20261024-1755.log`.

- **Start-only microphone path:** `Start-Session` is the production path at source line 262. Engine construction is line 280, `SetInputToDefaultAudioDevice()` is line 317, and `RecognizeAsync(...)` is line 320. No-mic commands never called Start and emitted `recognizer-created=0`.
- **Runspace-safe callbacks:** hypothesis, recognized, and completion callbacks each use `window.Dispatcher.BeginInvoke` at lines 292, 302, and 312 before touching WPF controls.
- **Stop/finalization boundedness:** Stop transitions active states to `Finalizing`, calls `RecognizeAsyncStop()` at line 215, and starts a 10-second dispatcher finalization timer at lines 145–157 and 216. The active session timer is 30 seconds at lines 161–175 and 321.
- **Late-callback/generation fence:** `AcceptText`, `TryAppendFinal`, and `AcceptCompletion` compare callback generation and phase. Stop moves to `Finalizing`, so late text is rejected; timeout calls `Fail()`, increments generation, disposes the engine, and exposes an Error state; Cancel increments generation before cancellation/disposal. The no-mic self-test directly passed stale-final rejection after Stop, new-generation acceptance, Cancel discard, and late-callback rejection after Cancel.
- **Review and copy boundary:** the actual window creates an editable WPF `TextBox` at line 403. `Copy-Transcript` is wired only to the visible Copy button and calls `Clipboard.SetText` only after phase `Ready` and nonblank review text (lines 240–251 and 444). No automatic insertion or paste path was found.
- **Unhappy-path visibility:** source exposes Idle, Starting, Listening, Finalizing, Ready, Cancelled, and Error state text; setup, stop, finalization, recognition, and clipboard failures have actionable visible messages.
- **Deferred/safety exclusions:** production source static guards found no executable global-hotkey registration, `SendKeys`, `keybd_event`, network client/API calls, file export/content writes, audio-file extensions, or telemetry/history implementation. The only clipboard operation is the explicit manual Copy action. The README and UI disclose no automatic insertion, history, audio files, telemetry, or network calls.

The static pattern search reported zero matches for executable network/hotkey/file-export patterns. It did report the UI disclosure sentence containing words such as “automatic insertion, history, audio files, telemetry, or network calls”; this is documentation text, not an implementation call.

## Stop/finalization semantics record

The implementation is consistent with the frozen contract for the measured/static scope: after Stop, the session remains in `Finalizing` while only the same-generation completion callback can transition it to `Ready`; text callbacks are rejected because `AcceptText` allows only `Starting`/`Listening`. A 10-second timer converts an unfinished finalization into Error and increments the generation, fencing later callbacks. Cancel is immediate in the code path because it invalidates the generation before attempting `RecognizeAsyncCancel()` and disposal.

This is a code-path and no-mic lifecycle assessment, not live proof of Windows SAPI timing, device behavior, or callback ordering under an actual microphone session. The contract’s phrase “Stop has a 10-second finalization boundary” is therefore recorded as statically implemented and bounded, with live Stop behavior unverified.

## Limitations and unrun coverage

- No physical microphone click, Start session, recognition, permission prompt, speech input, real Stop, real Cancel, live partial hypothesis, latency, accuracy, punctuation, or device failure was run. The README explicitly states the real microphone test is not performed, and the implementation report also records real Start/Stop/Cancel as unverified.
- No full-release, bilingual, mixed-language, Paraformer/sherpa-onnx, 90-utterance benchmark, cross-application insertion, global-hotkey, tray/overlay, installer, signing, or M1–M9 release gate was tested or claimed.
- No packet-level network monitor was required or run; the no-network conclusion for this smoke is based on the actual source-path audit, the absence of network calls in the executed checks, the local-only backend contract, and the unchanged five-file candidate inventory.
- No candidate Git SHA exists because the delivered MVP is intentionally uncommitted. Reverification is required if the source or output bundle changes.

## Process cleanup

The wrapper-run evidence recorded the verifier-owned child PIDs and ended with `REMAINING_OWNED_PIDS count=0 values=`. The final direct command runner used host PID `50984` for all sequential calls and exited normally. No idle MVP window, service, or owned application process remains. I did not kill unknown `node` PID 52788, protected daemon PID 31417, or any unrelated user process.

## Verdict

`PASS_NO_MIC_MVP_SMOKE` is issued for the exact candidate bytes identified above and only for the reduced English offline no-mic MVP smoke matrix. Physical microphone behavior and all recognition-quality/latency claims remain **UNVERIFIED**; this is not a full-release or accuracy PASS.
