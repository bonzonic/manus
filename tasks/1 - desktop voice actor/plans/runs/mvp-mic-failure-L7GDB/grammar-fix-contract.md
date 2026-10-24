# Grammar-fix contract — MVP Start recognition setup

**Work item:** `mvp-mic-failure-L7GDB`  
**Owner stage:** code-defect-owner freeze only  
**Status:** frozen for one isolated implementer; no canonical product files changed by this owner

## Proven root cause

The retained Start error is:

> `Error - microphone or recognizer setup failed: Exception calling "RecognizeAsync" with "1" argument(s): "At least one grammar must be loaded before doing a recognition." Allow microphone access and check the default input device, then click Start again. No automatic retry was attempted.`

The canonical source has no grammar-loading call. In `mvp/VoiceMvp.ps1`:

- line 280 constructs `SpeechRecognitionEngine($selected.Culture)`;
- lines 314–316 attach the hypothesis, recognized, and completion handlers;
- line 317 calls `SetInputToDefaultAudioDevice()`;
- line 318 marks the session `Listening`;
- line 320 calls `RecognizeAsync(RecognizeMode::Multiple)`;
- lines 322–324 catch all setup/start exceptions and incorrectly present them as `microphone or recognizer setup failed`.

There is no `LoadGrammar`/grammar construction anywhere in the canonical source. `RecognizeAsync` therefore receives an engine with zero loaded grammars and throws the exact exception shown above. This is a recognition-configuration defect, not evidence of a missing microphone, denied permission, or wrong default device.

Canonical source hash verified before freeze: `53F3900F0959C5049E615E923B04485C75DEFF515C5320CA2F70E7272F0300FB`.

## Narrow repair

In a fresh isolated grammar-fix worktree, repair only the Start recognition configuration and its diagnostic boundary:

1. After engine construction, create/load one non-empty, locally available grammar compatible with the selected installed English recognizer. The implementation may choose the smallest appropriate `System.Speech` grammar API; a normal free-dictation grammar is the expected MVP shape. No download, model, network, or transcript/audio fixture is allowed.
2. Ensure grammar loading occurs before `RecognizeAsync`. The test must prove the relevant order, not merely search for a string in the source. Keep `Start-Session` as the only production path that creates the real engine, binds the default audio device, and starts live recognition.
3. Replace the one broad setup message with a stage-specific diagnostic boundary for the grammar/setup failure. A grammar construction/load failure must identify grammar/recognition configuration and must not claim `microphone or recognizer setup failed`. Device binding, engine construction, and recognition-start failures may retain distinct stage labels and may continue to advise a manual retry, but do not add automatic retry or permission/device changes.
4. Preserve all existing session-generation, stale-callback, cancel, stop/finalization, editable-review, explicit-copy, no-network, and no-background-process behavior.

Do not refactor the backend, add endpoint enumeration, change Windows defaults or privacy settings, pre-open audio, add retry loops, download models, or broaden the language/product scope.

## Required focused regression

Add or extend a safe regression that exercises the same Start setup sequence through a fake engine/provider; it must never instantiate `SpeechRecognitionEngine`, call the real `SetInputToDefaultAudioDevice`, call real `RecognizeAsync`, open an audio source, or require a physical microphone.

The fake must enforce the missing precondition and record order:

- engine constructed;
- a non-empty grammar loaded;
- input-binding operation reached (simulated/no-op);
- recognition-start operation reached (simulated/no-op only after grammar is loaded).

The fake `RecognizeAsync` must fail with the grammar-precondition exception if called before a non-empty grammar is loaded. Run the regression against the untouched baseline first and retain a clearly recorded red result; the baseline is expected to fail at the grammar precondition. Run it again after the repair and require green. Also simulate a grammar-load exception and assert that the user-visible/stage diagnostic identifies grammar/recognition configuration and does not contain the generic microphone-failure claim.

Keep the existing lifecycle/fence assertions and markers from `mvp/Test-VoiceMvpNoMic.ps1`, including stale-final rejection, cancellation discard, `clipboard-calls=0`, and `recognizer-created=0`. New tests must remain safe no-mic tests. Do not weaken or delete an existing guard to make the new test pass.

## Acceptance criteria

- Fresh worktree only; canonical `mvp/` and `outputs/mvp30/` are untouched until parent promotion.
- Focused regression is red on the supplied baseline and green on the fixed candidate.
- Fixed candidate proves a non-empty grammar is loaded before recognition start and proves the fake-provider call order.
- Grammar/setup error is stage-specific and no longer says it is a microphone/default-device failure.
- Existing no-mic regression remains green with all prior markers.
- No real engine, live input binding, `RecognizeAsync`, physical microphone, permission prompt, default-device change, audio, transcript, network, or model activity is used by implementer/verifier tests.
- Independent verifier runs against the exact candidate hash, checks source/test provenance, and records the new output ZIP name; the old ZIP/output remains retained rather than overwritten.
- A real microphone/dictation/accuracy check remains deferred to a later explicit user-started test. This contract does not authorize that test.

## Promotion boundary

The parent/coordinator reserves the isolated worktree, reviews the worker diff and red/green evidence, then independently verifies it in a fresh process. Only after that may the parent promote the exact verified candidate into:

- `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\mvp`
- `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\outputs\mvp30`

Promotion must use a new versioned ZIP filename and must not overwrite the prior ZIP or retained reports. No commit, push, global Git setting, cloud action, or network action is part of this contract.
