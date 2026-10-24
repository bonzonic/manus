# Isolated grammar implementation report

**Work item:** `mvp-mic-failure-L7GDB`  
**Implementer reservation:** `mvp-grammar-implementation-01`  
**Status:** candidate complete; independent fresh verification and promotion remain with the parent.

## Candidate provenance

- Candidate directory: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp`
- Worktree HEAD before edits: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (detached, clean before the candidate copy)
- Canonical baseline `VoiceMvp.ps1` SHA-256: `53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb`
- Candidate `VoiceMvp.ps1` SHA-256: `b43cfcfb5c9a7be7c7b9b5be1b37d0202b2a6961faa236667d9fe3d38eb90894`
- Candidate manifest: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB\mvp\SHA256SUMS.txt`
- The canonical `mvp\` directory, `outputs\mvp30\`, old ZIP, and prior owner/verifier records were not edited.

## Narrow implementation

`VoiceMvp.ps1` changes are limited to:

- Lines 3–6: add the safe `-GrammarSelfTest` entrypoint.
- Line 106: add the current setup-stage marker.
- Lines 147–189: add `Format-RecognitionSetupError` and the shared `Invoke-RecognitionSetupSequence` helper. The helper constructs/loads a non-empty grammar, then binds input, then starts recognition; the real engine is passed only from `Start-Session`.
- Lines 364–375: `Start-Session` creates a local `System.Speech.Recognition.DictationGrammar`, routes input/recognition through the helper, and classifies engine construction, grammar/configuration, input binding, and recognition-start failures separately. Existing handlers, generation fences, cancel/stop/finalization, clipboard, and UI lifecycle were not refactored.
- Lines 514–565: deterministic fake engine and fake grammar regression. It records `engine-created > grammar-loaded > input-bound > recognition-started`, enforces the exact zero-grammar precondition, and checks the grammar-specific diagnostic without real speech or audio APIs.

`Test-VoiceMvpGrammar.ps1` is new (57 lines). It has a baseline mode that replays the untouched engine/input/recognition order with a fake provider and a candidate mode that launches `VoiceMvp.ps1 -GrammarSelfTest`. `README.md` lines 40–71 document the confirmed root cause, regression, and physical-test limit. `Test-VoiceMvpNoMic.ps1` and `Launch-VoiceMvp.cmd` are byte-identical copies of the canonical inputs.

## Regression proof and exact commands

All commands below were run from the candidate worktree `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-mvp-grammar-L7GDB`.

1. **Baseline red, fake-only:**
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\mvp\Test-VoiceMvpGrammar.ps1 -Baseline`
   - Numeric exit: `1` (expected red).
   - Marker: `GRAMMAR_REGRESSION BASELINE_RED expected-grammar-precondition`, order `engine-created>input-bound`, `loaded-grammar-count=0`, and `real-engine=0 real-input=0 real-recognition=0 audio-open=0`.
   - This is a deterministic replay of the untouched baseline Start sequence; it does not create or call a real engine.

2. **Candidate grammar regression:**
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\mvp\Test-VoiceMvpGrammar.ps1`
   - Numeric exit: `0`.
   - Markers: `Test-VoiceMvpGrammar PASS`; `GRAMMAR_SELFTEST PASS order=engine-created>grammar-loaded>input-bound>recognition-started grammar-count=1`; `GRAMMAR_DIAGNOSTIC PASS stage=grammar-construction-load generic-mic-claim=false`.
   - Safety markers: `real-engine=0 real-input=0 real-recognition=0 audio-open=0`.

3. **Direct source fake self-test:**
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\mvp\VoiceMvp.ps1 -GrammarSelfTest`
   - Numeric exit: `0`; same order and diagnostic markers as above.

4. **Existing no-mic lifecycle/fence wrapper:**
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\mvp\Test-VoiceMvpNoMic.ps1`
   - Numeric exit: `0`; marker `Test-VoiceMvpNoMic PASS`.

5. **Existing no-mic inner self-test markers:**
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\mvp\VoiceMvp.ps1 -NoMicSelfTest`
   - Numeric exit: `0`; `NO_MIC_SELFTEST PASS stale-final-ignored new-generation-accepted cancel-discarded clipboard-calls=0 recognizer-created=0`.

6. **Safe idle WPF smoke:**
   `powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\mvp\VoiceMvp.ps1 -IdleSmoke`
   - Numeric exit: `0`; marker `IDLE_SMOKE PASS phase=Idle recognizers=1 clipboard-calls=0`.
   - Start was never clicked.

The fake regression does not instantiate `SpeechRecognitionEngine`, call a real `SetInputToDefaultAudioDevice`, call a real `RecognizeAsync`, open an audio source, require a microphone, access permissions/defaults, use network/cloud/model/downloads, or add retries. No physical microphone or user-started recognition test was run.

## Final candidate files and process state

The exact per-file hashes, byte sizes, and line counts are in [`candidate-file-manifest.md`](candidate-file-manifest.md) and the candidate `SHA256SUMS.txt`. The candidate manifest itself has SHA-256 `f212da6fec5232eddb436e01cfb83c9220f167f5d685a0ecbb0b0ba08b8251a3`.

No task-owned `VoiceMvp` process or WPF window remained after the finite checks. The host exposes many unrelated long-lived `powershell.exe` processes and denied command-line inspection through `Get-CimInstance Win32_Process`; none was terminated or modified. Remaining task-owned process list for this candidate: `[]`.

## Limitations and handoff

- The fake proof validates grammar construction/load order and diagnostic classification only; it does not prove physical device availability, permission, SAPI live recognition, accuracy, latency, or transcript quality.
- The independent verifier must rerun the exact candidate hash in a fresh process, inspect the source/test provenance, and decide promotion. A new versioned ZIP should be created only after that verification; the old bundle remains retained.
- No commit, push, staging, global setting, network action, permission change, default-device change, backend swap, or background watcher was used.
