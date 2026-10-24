# B0 Windows Probe — Implementer Handoff

**Status:** Frozen owner contract; ready for a distinct implementer, not implemented or verified.

## Assignment

Own only Windows activation/focus/insertion feasibility for B0:

- global `Ctrl+Alt+Space` toggle and collision reporting;
- single-instance and busy/repeated-event behavior;
- active-session Escape ownership and fail-closed registration;
- non-activating overlay behavior;
- read-only target identity, editability, sensitivity, integrity, caret/selection evidence;
- clipboard-free direct Unicode dispatch and honest outcome classification;
- supervised controlled-field evidence for the approved Notepad, Edge, and VS Code matrix.

Do not implement audio capture, Azure, credentials, provider selection, formatter, onboarding, settings, product session core, or recovery UI. Do not turn the probe into production source.

## Provenance and boundaries

- **Task docs:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor`
- **Approved architecture:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md`
- **Approved scope:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\decision.md`
- **Original brief:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\task.md.txt`
- **Assigned worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-windows-L7GDB`
- **Work-item records:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-windows-L7GDB`
- **Proposed disposable source location:** `<assigned worktree>\probes\b0-windows\`
- **Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`, detached HEAD, clean at owner inspection.
- **Collision rule:** no source under `src\VoiceInput.*`; no use of the original checkout, toolchain worktree, or speech worktree.

## Frozen safety contract

1. Standard-user Windows x64 only. Refuse higher-integrity/elevated targets; never elevate.
2. `Ctrl+Alt+Space` is the configured toggle. Detect and report registration collisions; do not silently rebind.
3. Bare Escape is registered from Arming through active processing/dispatch. If registration fails, block session/microphone start. No alternate cancel shortcut.
4. Unregister Escape on every terminal path and before recovery/settings can take focus. Idle Escape passes through normally.
5. Overlay must be non-activating (`WS_EX_NOACTIVATE`, `ShowActivated=false`) and must not alter foreground HWND, focused UIA element, caret, or selection.
6. UIA is evidence only. Never use `TextPattern` as an insertion mechanism, never call whole-value `SetValue`, never force refocus.
7. Direct Unicode `SendInput` only. No clipboard mutation, paste, Enter, Tab, control keys, auto-retry, or automatic undo.
8. Unknown, unsupported, changed, sensitive/password, read-only, elevated, terminal, remote-desktop, closed, or uncertain targets refuse automatic input.
9. `InputSent` means OS events were accepted; only an independently observed exact field mutation is `Verified`.
10. Cancellation before dispatch prevents mutation; cancellation after accepted input is too late to retract. Partial/uncertain dispatch is never replayed.

## Frozen lifecycle ownership

`HotkeyLifecycle` is the only owner of the activation/cancellation lifecycle. The overlay displays state but does not own cancellation. The target adapter observes but does not decide whether a session may dispatch.

```text
Idle
  --Ctrl+Alt+Space--> Arming (register Escape; capture target)
  --Escape----------> Cancelled (unregister Escape; no dispatch)
  --success---------> Listening/Processing
  --Ctrl+Alt+Space--> Finalizing -> Validating -> Inserting
  --Escape before commit --> Cancelled (unregister; no dispatch)
  --accepted input--> Done or Uncertain (Escape remains owned until terminal cleanup)
  --terminal--------> unregister Escape, then any recovery/settings focus
```

Every callback and evidence record carries a session ID. A stale session ID cannot update overlay state or reach insertion. A busy toggle produces feedback only. A second process cannot acquire the named mutex.

## Safe driver/API packet

The implementer may use these documented Windows boundaries, subject to actual SDK/API compilation and tests:

- `RegisterHotKey` / `UnregisterHotKey` / `WM_HOTKEY` for global toggle and active Escape ownership;
- a hidden message-only/native window and a per-user named mutex for dispatch/single instance;
- WPF `ShowActivated=false` and extended style `WS_EX_NOACTIVATE` for the overlay;
- `AutomationElement.FocusedElement`, runtime identity/control state, and disposable UIA focus events for semantic focus evidence;
- `GetForegroundWindow`, `GetGUIThreadInfo`, `GetWindowThreadProcessId`, process-token integrity inspection, and bounded `SetWinEventHook`/UIA observers for native cross-checks;
- `SendInput` with `KEYEVENTF_UNICODE` only, recording event sequence/count/return separately from controlled-field observation.

Do not interpret any single API result as proof of safe mutation. `TextPattern` cannot insert text. `SendInput` acceptance is not field verification and can be limited by UIPI/integrity.

## Approved target matrix

| Surface | Inventory status at owner stage | Required controlled target | Notes |
|---|---|---|---|
| Windows Notepad | Present: `C:\Windows\System32\notepad.exe`, `10.0.26100.8457` | Native plain-text edit field | Launch and control only in the later supervised probe |
| Microsoft Edge | Present: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, `156.0.4314.42` | Local unsent standard `<textarea>` or plain `contenteditable` | Never use browser chrome, live account, or submitted form |
| VS Code | Not found in standard paths/registry inspected | Untitled plain-text editor | Hard blocker until installed or a named substitution is approved; no silent drop |

## Bounded evidence matrix

### Positive cases: 12 total, four per app

Use known controlled sentinels and independently observe the complete expected value once:

- **P1:** `Alpha 中文 😀.` at the start.
- **P2:** `L│R` with `会议 at 10:30，done 🧪.` at the middle caret; expected `L会议 at 10:30，done 🧪.R`.
- **P3:** `before TARGET after`, select only `TARGET`, replace with `Alpha 中文 😀.`; expected `before Alpha 中文 😀. after`.
- **P4:** `prefix│suffix` with `Meet at 10:30，会议已完成 🧪.` at a non-edge caret.

All 12 must be `Verified`. Any `InputSent`-only case fails B0.

### Refusal/race/cancel cases: at least 14

Unknown, password/sensitive, read-only/disabled, elevated/higher-integrity, terminal/remote, focus-away, focus-away/back, caret/selection changed, target closed, held modifiers, Escape before dispatch, Escape registration failure, partial `SendInput`, and repeated/busy start.

Require zero wrong-target writes, zero duplicate writes, zero Enter/submission/navigation events, and zero mutation in all refusal/cancel cases. If a native driver cannot be safely supplied, report `blocked` rather than replacing it with an unmeasured fake pass.

## TDD deliverables

1. **Contracts:** deterministic outcome table, session IDs, at-most-once fence, cancellation semantics.
2. **Lifecycle:** hotkey message window, mutex, collision handling, active Escape register/unregister, busy handling.
3. **Overlay/focus:** non-activation proof and stable focus/caret snapshots.
4. **Target policy:** named adapters, integrity/sensitivity/editability classification, permanent invalidation.
5. **Input:** direct Unicode packet builder/dispatcher, surrogate tests, command-key exclusion, no clipboard.
6. **Evidence:** per-case manifest with source revision, SDK/package versions, OS/app versions, command lines, file hashes, expected/observed field values, event sequence, outcome, and cleanup status.

Write failing deterministic tests first for each unit; then implement the smallest disposable code; then run the same scoped tests and the supervised matrix. Do not use owner evidence as independent verification. A fresh verifier will re-run the frozen matrix against the recorded build.

## Future command templates (not executed)

No SDK, solution, or probe project exists at handoff. Once the coordinator admits toolchain work and the implementer creates the disposable solution, replace these placeholders with actual names and record outputs:

```powershell
dotnet --list-sdks
dotnet restore .\probes\b0-windows\B0.WindowsProbe.sln
dotnet test .\probes\b0-windows\B0.WindowsProbe.sln --configuration Release
dotnet run --project .\probes\b0-windows\src\B0.WindowsProbe\B0.WindowsProbe.csproj -- --matrix .\probes\b0-windows\matrix.json --evidence <WORK_ITEM_DIR>\evidence\native-probe
```

These are proposals, not executed commands or proof of a build. No install, app activation, typing, provider call, commit, push, merge, or deployment is authorized by this handoff.

## Required return to owner

Return all of the following under the work-item directory, without claiming product completion:

- disposable probe source tree and exact file list;
- actual SDK/package/project/solution manifest and hashes;
- scoped test command/output and any unrun/blocked tests;
- native probe case evidence for all positive/refusal/race/cancel cases;
- exact Notepad/Edge/VS Code versions and matrix status;
- outcome summary distinguishing `NotAttempted`, `InputSent`, `Verified`, and `Uncertain`;
- one of `B0-PASS`, `B0-BLOCKED`, or `B0-FAIL` with the first failing case and no scope reduction.

The owner will pass the implementer output to a fresh verifier. No implementation result is a product PASS until that independent verifier measures the frozen contract.
