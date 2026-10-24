# Desktop voice input — English offline MVP handoff

**Delivery checkpoint:** 2026-10-24 18:01 +08:00, within the 30-minute scope-cut window ending 18:08:20. **Status: experimental English MVP packaged; independent no-microphone smoke checks PASS. Real microphone recognition is not tested.** The user explicitly cut the scope at 17:38:20 and approved English-only at 17:43:30.

## Open and try

The complete [English MVP ZIP](outputs/Desktop-Voice-English-MVP.zip) contains the five verified files. They are also already in `outputs/mvp30/` on this computer. Keep them together and double-click `Launch-VoiceMvp.cmd` from that folder. The [quickstart and limitations](outputs/mvp30/README.md) describe the PowerShell 5.1/WPF launcher.

The window opens Idle. **Start** is the only action that creates the recognizer, opens the default audio input and begins recognition. When ready, click Start, speak English, click Stop, review/edit and explicitly Copy. Cancel discards the current session. Sessions are bounded to 30 seconds and Stop has a 10-second finalization boundary. No audio/transcript/history file, app telemetry, cloud call, automatic paste or cross-app insertion is included.

## Implemented reduced scope

One Windows window with Start/Stop/Cancel/Copy/Clear, English `en-US`, editable transcript review, visible states/actionable errors and best-effort recognizer-provided hypotheses. Backend: already installed Windows SAPI 8.0 through .NET Framework System.Speech / Windows PowerShell 5.1; no model/NuGet/runtime download needed. This is a script/command launcher, not a signed EXE or installer.

The [original full architecture](research.md), [M1–M9 scope](decision.md) and [large implementation plan](implementation-plan.md) remain for later. Global hotkeys, automatic caret insertion, tray/overlay, bilingual Paraformer, full model setup, 90-utterance quality benchmark and broad cross-app/latency certification were explicitly deferred. This MVP is not Paraformer-equivalent or a full M1–M9 release.

## Independent evidence and its limits

The [fresh verifier report](plans/verification/mvp30-L7GDB-20261024-1754/report.md) returned **PASS_NO_MIC_MVP_SMOKE** for source SHA-256 `53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb`. It independently matched four manifest entries; checked baseline absence; repeated parser, copied self-test, launcher, idle WPF and wrapper checks; audited production Start-only input/callback/state/copy/no-network paths; and observed no content-file delta. Known owned verifier PIDs exited. The parent subsequently matched all five ZIP entries byte-for-byte against the delivered files.

**Not measured:** physical microphone Start, permissions, real speech, live Stop/Cancel, recognition accuracy/punctuation/latency/partials, or packet-level network monitoring. No audio was captured during planning/build/verification. An installed recognizer and passing simulated lifecycle checks do not prove real voice recognition. The next meaningful test is an explicit user-started session; do not claim a functional voice pass until that result is known.

The owner accepted the latest English-only scope and the limited verdict in [English approval and owner closeout](plans/runs/mvp30-L7GDB/English-approval-and-owner-closeout.md), without changing candidate bytes or the verifier report. Old selectable-three-language wording is superseded by the user's narrower English-only approval. The original [90-item read-sheet](plans/runs/b0-offline-L7GDB/corpus-read-sheet.txt) and [later local benchmark consent](plans/runs/b0-offline-L7GDB/local-consent-record.md) remain inactive planning assets, not live-test results.

## Ownership, preservation and resume

Parent coordinator, separate owner, distinct implementer and fresh verifier were used. Fresh load admissions and a single heavy-stage lease were retained. The `voice-mvp30-L7GDB` worktree remains isolated at baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`, with source fingerprints because no commit was authorized. Original files and earlier worktrees/evidence are preserved. No account/billing/global policy, commit, push, merge or deployment change occurred. No persistent task-owned application/service remains from testing.

The [durable queue](plans/coordination/implementation-20261024-L7GDB/tasks.json) records the original scope as deferred, the current limited delivered candidate, exact source/contract/verifier paths and the live test as unverified. If bytes change, refresh verification and hashes. Continue from user feedback on the first live session rather than silently restarting the earlier large release.
