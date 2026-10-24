# Implementer packet — isolated MVP grammar repair

## Assignment

You are the distinct implementer for a **single narrow defect** in the Desktop Voice Actor English MVP. Work only in the fresh isolated grammar-fix worktree reserved by the parent. Do not edit the canonical `mvp/`, `outputs/mvp30/`, prior ZIPs, or prior verification records.

Read first:

- `plans/runs/mvp-mic-failure-L7GDB/investigation.md`
- `plans/runs/mvp-mic-failure-L7GDB/handoff.md`
- `plans/runs/mvp-mic-failure-L7GDB/grammar-fix-contract.md`
- `mvp/VoiceMvp.ps1`
- `mvp/Test-VoiceMvpNoMic.ps1`
- `mvp/README.md`

Canonical source at packet creation: `mvp/VoiceMvp.ps1`, SHA-256 `53F3900F0959C5049E615E923B04485C75DEFF515C5320CA2F70E7272F0300FB`.

## Exact worker prompt

> In the fresh isolated grammar-fix worktree, fix only the confirmed `System.Speech` startup configuration defect in `mvp/VoiceMvp.ps1`: the current Start path constructs the engine, binds the default input, and calls `RecognizeAsync(Multiple)` without loading any grammar, producing the exact exception `At least one grammar must be loaded before doing a recognition.`
>
> First create/run a focused safe regression against the untouched baseline. It must drive the same Start setup sequence with a fake engine/provider, fail if recognition is attempted before a non-empty grammar is loaded, and record the expected baseline-red result. The fake must not instantiate a real speech engine, call real `SetInputToDefaultAudioDevice`, call real `RecognizeAsync`, open an audio source, or require a microphone.
>
> Then make the smallest product change: load one locally available non-empty `System.Speech` grammar after engine construction and before `RecognizeAsync`, while keeping Start as the only real-microphone path. Preserve handler wiring and all existing session-generation/fence/cancel/stop/finalization behavior. Add a narrow stage label/state so a grammar construction/load failure is reported as grammar/recognition-configuration failure, not as `microphone or recognizer setup failed`; do not add automatic retry, endpoint probing, permission changes, default-device changes, backend swaps, downloads, models, telemetry, audio logging, or transcript logging.
>
> Run the focused regression again and require green: the fake records engine → non-empty grammar loaded → simulated input binding → simulated recognition start; its recognition-start precondition must pass only after grammar load. Simulate grammar-load failure and assert the visible diagnostic names grammar/recognition configuration and does not claim microphone/default-device failure. Run the existing `Test-VoiceMvpNoMic.ps1` and retain every existing lifecycle/fence marker. Record exact commands, candidate hash, changed files/lines, baseline red evidence, fixed green evidence, and any unverified limits for the parent. Do not perform a physical microphone test.

## Technical guardrails

- Keep `Start-Session` and the real engine/audio calls as the only production live-audio path.
- Do not move microphone access into startup/discovery or tests.
- Do not use registry endpoint records as proof of an active device; do not enumerate or change devices for this fix.
- Do not alter `$script:session` generation fences, callback guards, cancel behavior, timer guards, clipboard behavior, or UI safety boundaries except for the narrow setup-stage diagnostic needed here.
- Do not replace the installed SAPI backend or alter language discovery. The selected `en-US` recognizer remains the source of the culture.
- Use deterministic fake objects and in-memory event/order records only. No audio, speech phrase, transcript content, or user data belongs in test fixtures or evidence.
- If the source architecture makes direct fake injection awkward, use the smallest helper extraction that is shared by Start and the fake test; do not build a general provider framework or broad refactor.

## Required test evidence

The worker packet is complete only if it includes:

1. **Baseline red:** focused fake-provider regression against the supplied source fails because `RecognizeAsync` sees zero loaded grammars. Capture the command and concise output; this is expected and is not a product-verifier failure.
2. **Candidate green:** the same regression passes and proves the loaded grammar is non-empty and precedes recognition start.
3. **Grammar diagnostic:** simulated grammar-load failure yields a stage-specific message containing grammar/recognition-configuration wording and not the generic `microphone or recognizer setup failed` wording.
4. **Existing guard green:** `Test-VoiceMvpNoMic.ps1` passes with at least `NO_MIC_SELFTEST PASS`, `stale-final-ignored`, `clipboard-calls=0`, and `recognizer-created=0` (or the exact retained markers if the test output is wrapped).
5. **Scope check:** no real speech engine, real device binding, real recognition start, physical microphone, permission prompt, system default change, network, model download, audio, transcript, or automatic retry occurred.

Target worker effort is approximately 5–8 minutes. Parent’s independent fresh verification target is approximately 2–4 minutes and must use the exact candidate hash.

## Handoff and promotion checklist

Return to the parent:

- isolated worktree path and exact candidate source hash;
- changed-file list and line-level provenance;
- baseline-red and candidate-green test commands/output;
- confirmation that existing no-mic/fence tests remain green;
- explicit statement that no physical mic test ran;
- suggested new versioned ZIP filename, without creating or overwriting the old ZIP;
- any blocker or unverified limitation.

The parent, not this implementer, performs fresh verification and promotion into the canonical `mvp/` and `outputs/mvp30/`. Promotion must retain the old ZIP and use a new versioned filename. No commit, push, global settings, cloud, or network action is authorized.
