# Handoff — mic diagnosis to parent/coordinator

## Decision

This owner stage does **not** prove a physical microphone root cause and does **not** authorize a product fix. Parent should preserve the existing MVP and verifier records, ask the focused missing-evidence question, and dispatch no implementer until a one-click user-started session supplies the exact visible outcome.

## Safe diagnostic instrumentation packet (for a future distinct implementer only after evidence)

If the reporter supplies a setup error, the implementer may add narrowly scoped, non-content diagnostic state in an isolated worktree. The instrumentation must:

1. Label the stage immediately before and after `SpeechRecognitionEngine` construction (source line 280), `SetInputToDefaultAudioDevice()` (line 317), and `RecognizeAsync()` (line 320).
2. Preserve the full exception type, `HResult` as hex, and message in the visible error, while redacting transcript/audio and avoiding endpoint IDs, credentials, or environment dumps.
3. Keep Start as the only live-audio path; do not pre-open, probe with recording, retry around denial, change defaults, or alter permissions.
4. If adding read-only preflight, use metadata only and report endpoint count/default-role availability separately from permission; do not label persisted registry endpoints as active.
5. Add a pure fake-provider/runspace callback test for stage transitions and `Dispatcher.BeginInvoke` behavior; label it as no functional audio proof.
6. Re-run independent verification against the exact new hash. The prior `PASS_NO_MIC_MVP_SMOKE` remains limited and must not be reused as a live microphone verdict.

## Conditional implementer prompt

“Read `plans/runs/mvp-mic-failure-L7GDB/investigation.md`, `reproduction.md`, the canonical source, and the prior verifier report. Do not edit until the reporter’s exact Start error identifies one stage. If the error is proven at a single boundary, create a failing regression test or deterministic test double for that boundary, implement only the smallest root-cause fix in a fresh worktree, retain Start-only microphone access and no transcript/audio logging, and return file/line provenance plus an independent-verifier contract. If the error is not stage-specific, stop and return a missing-evidence question; do not swap backend, change Windows defaults/permissions, or add speculative retry.”

## Required input from reporter

Please answer only: **After clicking Start once, did the window reach `Listening`, or what is the complete visible `Error - ...` text?** A screenshot of the app window is acceptable; do not send audio or transcript content and do not change system settings for this question.

## Provenance and cleanup

- Canonical source: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\mvp\VoiceMvp.ps1`
- Source SHA-256: `53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb`
- Isolated investigation worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp30-L7GDB` at baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`
- No product files, defaults, permissions, services, or prior reports were changed.
- Final process check found zero `VoiceMvp` process/window matches; no task-owned process remains.
