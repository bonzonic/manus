# Experimental English MVP implementation report

Date: 2026-10-24
Status: `PASS_MVP_SMOKE` (safe no-mic MVP smoke only; real microphone execution is `NOT TESTED`)

## Scope and boundary

Implemented only the frozen 30-minute experimental MVP in the fresh detached worktree. The backend is the already-installed Windows SAPI 8.0 desktop recognizer through .NET Framework `System.Speech`, launched by Windows PowerShell 5.1/WPF. The delivered build is English-only and exposes only a locally discovered `en-US` recognizer.

No NuGet/model/runtime/browser/cloud/network work was performed. No commit, push, deploy, global policy change, installer, or EXE packaging was performed. The app has one WPF window with Start, Stop, Cancel, Copy, Clear, an editable review field, visible states/errors, 30-second session bound, 10-second finalization timer, session/generation fencing, disposal, and manual Copy only.

Start is the only code path that creates `SpeechRecognitionEngine`, calls `SetInputToDefaultAudioDevice`, and calls `RecognizeAsync`. The safe checks below never invoke Start, never open a microphone, and never touch the real clipboard.

## Worktree and source fingerprint

- Required baseline HEAD confirmed before implementation: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`.
- Final worktree remains detached at that baseline with uncommitted implementation files only; no commit was made.
- Source fingerprint: `VoiceMvp.ps1` SHA-256 `53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb`.
- Output folder: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\outputs\mvp30`.
- Manifest: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\outputs\mvp30\SHA256SUMS.txt`.

## Delivered files and hashes

| File | Size (bytes) | SHA-256 |
|---|---:|---|
| `Launch-VoiceMvp.cmd` | 266 | `5104684196d8205e543091ff22e1fcf36069f195df430cb3b56591f64c96f2c0` |
| `README.md` | 4897 | `d8c6324d2f1b4806d92eb41d0c08a3999da955cf5b48a7f7862d38095dbff9d8` |
| `Test-VoiceMvpNoMic.ps1` | 726 | `b9dca8c1c82cae8edcb942992ff5181cc771e6c7d505fcf5782a45f4dbd48514` |
| `VoiceMvp.ps1` | 21626 | `53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb` |

`SHA256_VERIFY PASS` was returned against the copied output folder.

## TDD and smoke evidence

1. RED test written first: `tests\Test-VoiceMvpNoMic.ps1`. The pre-implementation run attempted to execute the missing `VoiceMvp.ps1` and returned `RED_EXIT=1` with the expected missing-file error. The outer evidence command intentionally returned 0 only to preserve the RED log.
2. Syntax/load check after implementation:
   `powershell.exe -NoProfile -Command "$tokens=$null; $errors=$null; [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path '.\\VoiceMvp.ps1'), [ref]$tokens, [ref]$errors) | Out-Null; if ($errors.Count -gt 0) { exit 1 }; 'SYNTAX_LOAD PASS'"`
   Result: `SYNTAX_LOAD PASS`, exit 0. This check parses only and does not open WPF, SAPI, or a microphone.
3. Focused GREEN test:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\\tests\\Test-VoiceMvpNoMic.ps1`
   Result: `Test-VoiceMvpNoMic PASS`, exit 0.
4. Pure no-mic lifecycle/fence self-test:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\\VoiceMvp.ps1 -NoMicSelfTest`
   Result: `NO_MIC_SELFTEST PASS stale-final-ignored new-generation-accepted cancel-discarded clipboard-calls=0 recognizer-created=0`, exit 0.
5. Copied launcher self-test:
   `Launch-VoiceMvp.cmd -NoMicSelfTest`
   Result: same `NO_MIC_SELFTEST PASS` marker, `OUTPUT_LAUNCH_SELFTEST_EXIT=0`.
6. Safe idle WPF smoke:
   `powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\\VoiceMvp.ps1 -IdleSmoke`
   Result: `IDLE_SMOKE PASS phase=Idle recognizers=1 clipboard-calls=0`, `IDLE_EXIT=0`.
7. Copied output idle WPF smoke:
   `powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\\VoiceMvp.ps1 -IdleSmoke` from the output folder.
   Result: `IDLE_SMOKE PASS phase=Idle recognizers=1 clipboard-calls=0`, `OUTPUT_IDLE_SMOKE_EXIT=0`.
8. Copied wrapper:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\\Test-VoiceMvpNoMic.ps1`
   Result: `Test-VoiceMvpNoMic PASS`, `OUTPUT_TEST_WRAPPER_EXIT=0`.
9. Hash verification:
   `Get-FileHash` comparison for every line in `SHA256SUMS.txt`.
   Result: `SHA256_VERIFY PASS`, exit 0.

The no-mic state test specifically exercises initial Idle, current final acceptance, Stop -> Finalizing, stale final rejection after Stop, finalization to Ready, a new generation, Cancel discard/invalidation, late callback rejection after Cancel, and zero clipboard calls.

## Microphone and privacy status

Physical microphone execution was deliberately **not tested**. No operator-started session was run, no audio was captured, no permission prompt was accepted, and no accuracy/latency/live-partial result is claimed. The safe idle smoke enumerated one installed `en-US` recognizer via metadata and closed after about 1.2 seconds without Start. Installed recognizer metadata is not proof of recognition quality or microphone permission.

The README records the experimental/no-history/no-telemetry/no-audio-file/no-network/no-insertion boundary, manual Copy, Cancel discard behavior, best-effort hypotheses, and no Paraformer or mixed-language promise. Existing planning metadata for `MS-2052-80-DESK` and `MS-1041-80-DESK` is documented as evidence only; this build does not expose those languages.

## Process cleanup

- Implementation host PID observed: `59328` (the tool-owned Windows PowerShell host, not a persistent MVP process).
- All launched self-test and idle-smoke child commands returned their recorded exit codes and ended. No persistent MVP window/service/process was left by the implementation checks.
- A final `Get-CimInstance Win32_Process` command-line inspection was attempted but returned `Access denied` under the device policy; this is recorded as an inspection caveat, not a fabricated enumeration result.
- Remaining MVP application processes: none observed; no active owned app PID remains.

## Known limitations

- Real microphone/session Start, Stop, Cancel, permission behavior, recognition quality, punctuation, latency, and partial hypotheses remain unverified until an operator explicitly starts a session.
- This is English-only (`en-US`) by explicit scope choice. It is not Paraformer/sherpa-onnx, not a bilingual or mixed-language quality test, and not a full M1-M9 release.
- No cross-application insertion, paste, hotkeys, tray, overlay, history, saved transcript, audio file, telemetry, or automatic retry exists.
- The launcher is intentionally a PowerShell script/command wrapper rather than a signed executable or installer.
