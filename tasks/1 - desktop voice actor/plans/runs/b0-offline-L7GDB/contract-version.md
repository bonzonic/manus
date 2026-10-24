# Offline B0 contract version

**Contract ID:** `offline-b0-speech-v1`  
**Decision basis:** approved offline-first amendment, 2026-10-24 16:15:39+08:00  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Owner worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-offline-L7GDB`  
**Status:** frozen for separate implementation and fresh verification; no code authored here.

## Scope and non-scope

This contract covers a disposable local sherpa-onnx online Paraformer feasibility spike: owned microphone frames, bounded buffering, revised partials, ordered final aggregation, Stop/final/cancel fencing, local-only mic level testing, model/runtime/asset provenance, punctuation measurement, benchmark metrics and network-disabled execution. It does not implement WPF tray UI, global hotkeys, overlay, focus/caret capture, insertion, recovery, onboarding, DPAPI, cloud credentials or product release integration. B0 speech output never types or pastes.

Initial candidate: `sherpa-onnx-streaming-paraformer-bilingual-zh-en`, CPU-first, Windows x64. Exact NuGet/native/model/token versions and hashes are `PENDING_TOOLCHAIN_V2_RESTORE_AND_ASSET_INSPECTION`; no version may be guessed. Azure/cloud is not required and is not an implicit fallback.

## Provider-neutral contracts

### `AudioFrame`

- `SessionId`: opaque per-session identity.
- `Sequence`: monotonic accepted frame sequence; no gaps among accepted frames.
- `SampleRate`, `Channels`, `BitsPerSample`, `Duration`: exact validated PCM format; initial benchmark hypothesis is 16 kHz, mono, PCM16 and must be recorded, not assumed.
- `CapturedAt`/monotonic sample time: timing evidence without document content.
- `Bytes`: owned immutable/copy-on-queue bytes whose lifetime outlives the native callback.

`DataFlow.Capture` is required. Loopback/render input is forbidden. Queue capacity is a hard two-second duration budget; enqueue beyond it returns typed `Overloaded` and never silently drops or allocates without bound.

### `SpeechEvent`

Every event carries `SessionId`, `Generation`, monotonic event time and a provider sequence when available. Event kinds are:

- `Partial`: `RevisionId`, revised text, optional endpoint/locale metadata; overlay-only and never final/insertable.
- `FinalSegment`: `SegmentId`, ordered sequence, text, optional endpoint metadata; accepted once only after the session remains live.
- `NoSpeech`/`Empty`: typed no-match outcome; never synthesized into text.
- `Error`: typed model-load, input-format, overload, device, runtime or recognizer failure.
- `Stopped`, `Cancelled`, `TimedOut`: terminal lifecycle status.

A partial may revise or become empty. A final segment is not the utterance final until Stop/finalization completes. Text and raw provider payloads are not written to logs/evidence by default.

### `SpeechSegmentAggregator`

`Accept(event)` updates partial overlay state or stores a unique final segment. It ignores events from another session/generation and duplicate `SegmentId`s. `CompleteAfterStop()` returns exactly one `FinalTranscript` assembled in sequence order or a typed `NoSpeech`/`Error`/`Cancelled` result. It does not dispatch input.

### `FinalizationFence`

States: `Open`, `Stopping`, `Sealed`, `Cancelled`, `Terminal`. Operations: `BeginStop`, `Cancel`, `Seal`, `TryAccept(sessionId, generation, event)`, `TryTerminal(outcome)`. After `Cancel` or `Seal`, late partial/final events are ignored. `TryTerminal` succeeds once only. Cancellation before any input dispatch discards uncommitted content; a later product layer owns the separate accepted-input boundary.

### `LocalMicLevelTest`

Requires an explicit Start command. It may open the selected microphone and emit `MicLevelSample`/typed device status, but it has no recognizer/provider reference, no transcript sink, no file sink and no history sink. It sends zero recognizer frames and reports “local-only microphone test; does not complete dictation onboarding.” It stops on explicit Stop, cancel, timeout, device loss, lock/sleep and shutdown without silently switching devices.

### `OfflineBenchmarkHarness`

Input is a locally consented manifest with exactly 30 English, 30 Mandarin and 30 mixed unique IDs plus content-minimizing provider result records. It computes English WER, Mandarin CER, mixed-token error, designated proper-name exact rate, severe mixed semantic-error count, p95 first partial from speech onset, p95 final-ready from Stop, cold/warm model load, CPU, peak memory, queue duration and punctuation metrics. It reports `PENDING`/`BLOCKED` when assets, consent or corpus are missing; it never creates a synthetic PASS.

Release thresholds remain proposed and unchanged: each language error ≤15%, proper-name exact rate ≥90%, at most one severe semantic error in 30 mixed items, p95 first partial ≤1.2 s and p95 final-ready ≤2.5 s. Fifteen seconds is the finalization timeout boundary, not a latency target. Punctuation is measured separately for raw ASR and any separately admitted punctuation asset.

## Privacy and installation boundary

Model/runtime preparation may use network only under a separate coordinator admission. The implementer records source/revision, byte length, SHA-256, architecture, license/notice and exact installation boundary. After installation, inference must run with networking disabled and no runtime remote fetch or telemetry. Audio/transcripts/history are in-memory only by default. Explicit local evaluation recordings require clear local consent and must not become product history.

## Safety invariants

Preserve the existing direct-input contract: speech and input remain separate; no clipboard mutation, paste, whole-value UIA assignment, forced refocus, Enter/Tab/control-key synthesis, automatic retry, automatic undo, elevation, target reactivation, unsafe target insertion or claims based only on `InputSent`. The verifier must independently assess the cross-app matrix through the B0-W packet; this contract cannot substitute for it.
