# Root-cause investigation — microphone not detected

**Status:** `UNPROVEN_INCIDENT_CAUSE / DIAGNOSTIC_BOUNDARY_PROVEN`

## Conclusion

No physical-device, permission, SAPI, or callback root cause is proven because no user-started session error was retained and this investigation was prohibited from opening the microphone. The proven product mechanism behind the wording “didn't manage to detect my mic” is that this MVP does not perform microphone endpoint/default-role preflight. It discovers only installed `en-US` recognizer metadata at startup, then defers all physical microphone access until Start. A Start failure is caught by one broad handler and displayed without identifying whether the failing operation was engine construction, default-device binding, or asynchronous recognition.

Therefore the first known wrong boundary is the app's **mic-detection assumption/UI diagnostic boundary**, not a proven hardware fault:

```text
New-MvpWindow -> Discover-InstalledEnglish (VoiceMvp.ps1:327-338)
  -> only SpeechRecognitionEngine.InstalledRecognizers() metadata
  -> no Core Audio endpoint/default-role/consent preflight

explicit Start -> Start-Session (VoiceMvp.ps1:262)
  -> new SpeechRecognitionEngine (line 280)
  -> SetInputToDefaultAudioDevice() (line 317)
  -> RecognizeAsync(Multiple) (line 320)
  -> broad catch and generic visible error (lines 322-324)
```

The first operation that can actually fail for a physical mic is line 317 (or line 280 before it), but the retained report has no observed exception at that boundary. It is not valid to name `NoDevice`, `AccessDenied`, SAPI/runtime, or dispatcher handling as the root cause yet.

## Evidence

1. `plans/verification/mvp30-L7GDB-20261024-1754/report.md:5-6,28,60,71` records only `PASS_NO_MIC_MVP_SMOKE`; no physical Start, permission prompt, speech, Stop, or device failure ran.
2. Canonical source hash is unchanged and matches the prior candidate: `53F3900F0959C5049E615E923B04485C75DEFF515C5320CA2F70E7272F0300FB`. Canonical and isolated worktree copies are byte-identical (21,626 bytes, 510 lines).
3. `VoiceMvp.ps1:327-335` calls `InstalledRecognizers()` and filters `en-US`; it never enumerates Windows audio endpoints before Start. The prior idle smoke reported `recognizers=1` without creating a live engine.
4. `VoiceMvp.ps1:280,317,320` is the only physical recognition path. `VoiceMvp.ps1:322-324` collapses setup/recognition exceptions into `microphone or recognizer setup failed: <message>...`; no HRESULT, stage label, endpoint ID, or safe diagnostic record is captured.
5. Read-only metadata probe at `2026-10-24T18:12:11+08:00` used Windows PowerShell `5.1.26100.9444`, 64-bit Desktop edition, STA. `System.Speech, Version=4.0.0.0` loaded; three recognizer metadata entries existed and one was `en-US` (`MS-1033-80-DESK`, Microsoft Speech Recognizer 8.0 for Windows). This supports recognizer/runtime availability but does not test audio.
6. `Audiosrv` and `AudioEndpointBuilder` were both running (read-only service status). Machine consent metadata at `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\microphone` was `Value=Allow`; the user HKCU consent key was absent. This is not proof of app access because the app is a non-packaged PowerShell process and no live access attempt was made.
7. `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Capture` contained 14 persisted capture endpoint records. Read-only property metadata included labels such as `Desktop Microphone`, `Headset Microphone`, and `Microphone`. These records do not prove that any endpoint is active or the current Console default.
8. `Get-PnpDevice -Class AudioEndpoint`, `Win32_SoundDevice`, and the targeted `Win32_PnPEntity` query returned no rows in this host. Late-bound Core Audio COM methods were unavailable in PowerShell, and an in-memory interface probe could not cast the COM object; these are probe limitations, not evidence of no device.
9. No `VoiceMvp` process or window remained after the finite read-only probes. No recognizer engine, audio stream, microphone, clipboard, or transcript was created by this investigation.

## Falsifiable hypotheses (unproven)

- **H1 — no active/default capture endpoint:** `SetInputToDefaultAudioDevice()` at line 317 would fail before recognition. Falsifier: one user-started run reaches `Listening` with no setup error, or the exact error is an access denial/SAPI error instead.
- **H2 — microphone permission denied for the non-packaged PowerShell process:** line 317 or `RecognizeAsync` would fail with an access-denied-style message/HRESULT. Falsifier: exact Start error lacks denial semantics and a controlled retry after an already-allowed app works; do not change permission during this diagnosis.
- **H3 — System.Speech/SAPI engine construction or runtime issue:** line 280 or line 320 throws despite an available recognizer and endpoint. Falsifier: one user-started session reaches `Listening`.
- **H4 — dispatcher/runspace callback issue:** the engine opens and recognition runs, but callbacks cannot update WPF. This cannot explain failure before `Listening`; test only after a user reports `Listening` plus no live result. Static code uses `Dispatcher.BeginInvoke` at lines 292, 302, and 312, so no static proof of this hypothesis exists.
- **H5 — installed-language mismatch:** unlikely for setup because one `en-US` recognizer is present and selected by idle smoke; falsifier/confirmation requires the selected language text from the live window. It does not prove microphone availability.

## Disposition

Do not blindly swap SAPI backends, change the default device, change privacy settings, add retries, or patch product code from this evidence. The next safe step is the exact one-click user-started diagnostic in `reproduction.md`. Once the complete visible error is known, a distinct implementer may receive a narrow fix contract; until then, no code-fix packet is justified.
