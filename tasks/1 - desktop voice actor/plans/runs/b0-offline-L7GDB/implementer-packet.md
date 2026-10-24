# Distinct B0 offline speech implementer packet

**Role:** separate implementation owner; not the feature owner or verifier.  
**Worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-offline-L7GDB`  
**Baseline:** detached clean `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Implementation report:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-offline-L7GDB\evidence\implementation-report.md`  
**Frozen contract:** [`contract-version.md`](contract-version.md)  
**Plan:** [`plan.md`](plan.md)

## Start conditions

Do not start until the parent records fresh resource admission and relays the separately frozen toolchain v2 manifest. Confirm worktree path, detached SHA, clean tracked status, and no product source. The toolchain v1 Azure contract/report is historical and must not be rewritten. No nested agents, commit, push, merge, cloud credential, Azure call, paid service or provider fallback is permitted.

Model/runtime preparation and real microphone/corpus evaluation are separate heavy stages. Asset preparation may contact the approved official source only under its own admission; record URL/revision, exact archive file list, size, SHA-256, architecture, license and notices. After preparation remove/disable runtime fetch paths and prove inference with networking disabled. Do not place model bytes or raw audio in ordinary settings, logs or evidence unless the parent explicitly admits a bounded artifact location.

## Required disposable scope

Confirm actual scaffold paths after admission. The expected disposable boundary is:

- `src/VoiceInput.Core/Contracts/AudioFrame.cs`, `SpeechEvent.cs`, `FinalizationFence.cs` and bounded queue/result contracts.
- `src/VoiceInput.Windows/Audio/WasapiAudioCapture.cs` and `LocalMicLevelTest.cs` using capture input, owned callback copies and explicit device-loss/disposal semantics.
- `src/VoiceInput.Speech/SherpaOnnx/ParaformerSpeechProvider.cs`, model configuration/asset manifest reader, partial/final mapper and `SpeechSegmentAggregator.cs`.
- `tests/VoiceInput.Core.Tests/` for queue, event, aggregation and fence tests; `tests/VoiceInput.Windows.Tests/` for capture/local-only behavior; `tests/VoiceInput.Speech.Tests/` for provider mapping, benchmark validation and network-disabled guards.
- A disposable benchmark harness under an actual confirmed path, not an invented runner.

Do not create the tray shell, WPF overlay, focus/insertion, recovery, onboarding, DPAPI, cloud adapter or production release source in this spike.

## Required implementation sequence

1. Inspect repository/toolchain truth and record actual SDK, solution, package/test commands. Write failing deterministic tests before implementation.
2. Implement owned PCM frame copying, two-second queue accounting, typed overload, microphone-not-loopback selection, stop/cancel/device-loss/disposal.
3. Implement Paraformer online stream seam with exact resolved package/model identities. Map revised partials to overlay-only events and final segments to ordered aggregation. Never emit partials as final.
4. Implement `BeginStop`, `Cancel`, `Seal`, session/generation checks, duplicate-final rejection, stale-event rejection and exactly-once terminal outcome.
5. Implement explicit local mic level test with zero recognizer/file/history sink and visible not-onboarding status.
6. Implement exact 30/30/30 manifest validation, WER/CER/mixed-token/name/severe-error metrics, p95 partial/final timing, CPU/RAM/load metrics and separate punctuation report. Keep raw ASR and punctuation results distinct.
7. Run deterministic tests and, only after fresh admission/local consent, real microphone/model benchmark. Run the complete path once with networking disabled. Record unrun/pending blockers honestly.

## Required evidence and report contents

Write only the implementation report and supporting manifests under `plans/runs/b0-offline-L7GDB/evidence/`; do not overwrite `evidence/provenance.md`. Include source file list/hashes, baseline identity, SDK/package/native/model/token/punctuation identities, build/test commands and exit codes, asset/license/hash manifest, capture format, bounded queue evidence, partial/final/fence test results, no-speech/hallucination cases, local-only mic evidence, benchmark manifest hash and content-free metrics, network-disabled observation, CPU/RAM/timing and per-gate `PASS`/`FAIL`/`BLOCKED`/`PENDING`.

Never include secrets, raw audio, full transcripts, window titles, provider payloads, copied credentials or content-bearing logs. A fixture test is not live quality. A model catalog/demo is not a mixed-language pass. A successful native load is not a product PASS. The owner/implementer must return the exact report path and all unresolved blockers to the parent for fresh verification.
