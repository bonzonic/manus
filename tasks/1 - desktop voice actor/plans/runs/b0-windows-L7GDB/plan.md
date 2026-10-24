# B0 Windows Activation, Focus, and Insertion Feasibility Plan

> **For implementation workers:** Use checkbox (`- [ ]`) syntax for tracking. This is a disposable native-probe contract, not permission to edit product code, install dependencies, commit, push, or claim a product pass. Work only in the assigned B0 worktree and write evidence under the assigned work-item directory. Any command below marked “future” is proposed, not executed.

**Goal:** Prove the Windows-only risky boundaries for activation, cancellation ownership, non-focus-stealing feedback, target/caret evidence, and clipboard-free Unicode insertion before B1; stop with a decision blocker if the approved three-application matrix cannot be safely verified.

**Architecture:** Build a small disposable probe under `probes/b0-windows/` in the assigned worktree. It has a hidden Win32 message window for `RegisterHotKey`/`WM_HOTKEY`, a non-activating WPF overlay, read-only UI Automation/focus snapshots, a narrow target-policy classifier, a `SendInput` Unicode adapter, and an independent controlled-field observer. It must not become production source and must not touch audio, Azure, credentials, settings, or the speech/toolchain worktree.

**Tech Stack:** Approved C# / .NET 10 LTS / WPF direction, isolated Win32 P/Invoke, Windows UI Automation, and xUnit-style deterministic tests plus supervised controlled-field runs. Actual SDK/package versions and restore commands remain unverified because this execution account has no .NET SDK or MSBuild on PATH.

**Spec:** [`research.md`](../../../research.md), [`decision.md`](../../../decision.md), and [`task.md.txt`](../../../task.md.txt). The approved scope and M1/M3/M5/M6/M8 contracts override any older architecture or plan drafts.

## Global Constraints

- Target Windows 11 x64 as a standard, non-elevated user. Refuse higher-integrity/elevated targets; never raise this process's privilege.
- The configured toggle is `Ctrl+Alt+Space`, subject to a real collision check. A second start while busy is feedback only and never creates a second session.
- Register bare Escape only from Arming through the active processing/dispatch lifecycle. A failed Escape registration blocks microphone-open/session start and silently substituting another cancel shortcut is forbidden.
- Unregister Escape on every terminal path and before recovery/settings takes focus. Idle Escape must pass through to the target application.
- The overlay is non-activating (`WS_EX_NOACTIVATE`, WPF `ShowActivated=false`, and no interactive editing in the session overlay). Showing/updating it must not change foreground HWND, focused element, caret, or selection.
- UI Automation is for identity, editability, sensitivity, and caret/selection evidence. `TextPattern` is read-only; no whole-value `SetValue` or blanket mutation is allowed.
- Direct Unicode input is the only automatic insertion route in this probe. Do not mutate the clipboard, invoke paste, use a clipboard fallback, force refocus, send Enter/Tab/control keys, or auto-retry uncertain dispatch.
- Positive success is based on independent controlled-field contents observed exactly once at the intended caret/selection. `SendInput` acceptance alone is only `InputSent`, never proof of insertion.
- Unknown, unsupported, sensitive/password, read-only, elevated, terminal, remote-desktop, closed, changed, or uncertain targets must not receive automatic input.
- The approved positive launch matrix is Windows Notepad, Microsoft Edge standard textarea/plain contenteditable fields, and VS Code's untitled plain-text editor. No silent substitution or matrix reduction is permitted.
- The M5 release gate remains 60 positive attempts (20 per app) plus at least 40 refusal/race/cancel cases. This B0 probe is a bounded feasibility gate and does not satisfy that later release count.
- This probe uses only canned text for insertion feasibility. It is not a speech/provider result and cannot claim M4, M7, M8, M9, or a product release pass.

## Review Focus

- **Focus theft and overlay activation:** showing or updating the overlay must leave foreground/focus/caret/selection unchanged; test in the overlay task.
- **Escape lifetime and failed registration:** active Escape is consumed and cancels; idle Escape passes through; registration failure fails closed before capture/session start; test in the lifecycle task.
- **UIA evidence gaps:** missing or unstable identity, editability, sensitivity, or caret/selection evidence must classify as `Unsupported`/`Uncertain`, not as eligible; test with fake snapshots and supervised controls.
- **Unicode and surrogate handling:** mixed CJK/Latin text and surrogate-pair text must be emitted as ordered Unicode packets without command keys; test with an event spy and all three controlled app surfaces.
- **Dispatch races and duplicate writes:** focus-away/back, caret movement, target close, held modifiers, partial dispatch, cancellation, and busy re-trigger must cause refusal or one honest outcome with no automatic replay; test in the race/refusal task.

---

## 1. Problem statement

The approved architecture is greenfield: the assigned worktree contains only baseline metadata (`README.md`, `AGENTS.md`, `.gitignore`, and `.git`) and no solution, project, source, test runner, SDK, or provider integration. The baseline is `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`, detached and clean. There is therefore no existing implementation behavior to preserve and no real product source to modify.

B0 must answer a narrow, binary question before B1: can a Windows-native implementation capture a stable target/caret at activation, keep ownership of cancellation without stealing focus, and insert Unicode directly into the approved external surfaces while distinguishing OS dispatch from observed field mutation? The answer must be measured with a disposable probe, not inferred from API documentation or a fake app-owned textbox.

Read-only inventory found Windows Notepad at `C:\Windows\System32\notepad.exe` (file/product version `10.0.26100.8457`) and Microsoft Edge at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (version `156.0.4314.42`). VS Code was not found at the standard x64/x86 executable paths or in the inspected uninstall registry locations. `dotnet`, `msbuild`, and `vswhere` were not available on PATH. No target application was launched or activated in this owner stage.

## 2. Architecture changes

No product architecture or product source changes are authorized in B0. The implementer may create only a disposable probe in the assigned worktree:

```text
<assigned worktree>\probes\b0-windows\
  B0.WindowsProbe.sln                 # disposable only, if SDK is admitted
  src\B0.WindowsProbe\
    Program.cs
    ProbeMessageWindow.cs
    HotkeyLifecycle.cs
    NonActivatingOverlay.xaml
    NonActivatingOverlay.xaml.cs
    FocusSnapshot.cs
    TargetPolicy.cs
    UnicodeInputAdapter.cs
    DispatchOutcome.cs
    ControlledFieldObserver.cs
    ProbeEvidenceWriter.cs
  tests\B0.WindowsProbe.Tests\
    HotkeyLifecycleTests.cs
    OverlayActivationTests.cs
    TargetPolicyTests.cs
    UnicodeInputAdapterTests.cs
    DispatchOutcomeTests.cs
```

The proposed boundaries are:

1. **`HotkeyLifecycle`** owns the hidden message window, named single-instance guard, `Ctrl+Alt+Space` registration, active-session state, Escape registration/unregistration, duplicate/busy handling, and lifecycle evidence. It must not own microphone or provider work.
2. **`NonActivatingOverlay`** renders Listening/Processing/Sent/Cancelled/Error and elapsed/shortcut information without activation. It must not accept text or become the insertion target.
3. **`FocusSnapshot`** reads `AutomationElement.FocusedElement`, runtime identity where available, native HWND/process identity, integrity level, editability/sensitivity signals, and a bounded caret/selection signature without reading unrelated document content. `Automation.AddAutomationFocusChangedEventHandler`, `GetForegroundWindow`, `GetGUIThreadInfo`, `GetWindowThreadProcessId`, and `SetWinEventHook` may be used as read-only evidence sources; callbacks must be bounded and disposable.
4. **`TargetPolicy`** allows only a named matrix adapter with stable identity, editable non-sensitive state, and observable caret/selection evidence. It permanently invalidates the session on focus change, return-to-target after focus theft, caret/selection change, process/window/control change, target close, uncertain observation, or modifier hold.
5. **`UnicodeInputAdapter`** emits ordered `SendInput` `KEYEVENTF_UNICODE` key-down/key-up pairs for the final UTF-16 text only. It records the requested event sequence, count, and native return separately. It emits no Enter, Tab, Escape, modifier, or other command key and never touches the clipboard.
6. **`DispatchOutcome`** returns one of `NotAttempted`, `InputSent`, `Verified`, or `Uncertain` and records the reason/route. `Verified` requires independent controlled-field observation showing one exact mutation at the expected caret/selection. A partial count, target race, or unavailable observer is not `Verified`; it is `Uncertain` or `InputSent` as defined below, and it is never replayed automatically.
7. **`ControlledFieldObserver`** observes only a test-owned unsent field with known sentinels. It compares the expected complete controlled value and a sibling-field sentinel; it must not collect unrelated real document text or account data. UIA read APIs may observe the test field; no UIA whole-value setter is permitted.
8. **`ProbeEvidenceWriter`** writes content-free event traces plus per-case expected/observed outcomes to the work-item evidence folder. Do not persist audio, transcripts as product history, credentials, window titles, or raw provider payloads. Canned probe text may be retained only as test-case evidence needed to prove exact field mutation.

## 3. User flow

The future implementer must run the probe only after a fresh coordinator admission and only in controlled, unsent local fields. The owner has not executed this flow.

1. Start the disposable probe as the standard user from a cold desktop. The probe acquires a per-user named mutex; a second launch reports `AlreadyRunning` and exits without creating a recorder/session.
2. The hidden message window registers `Ctrl+Alt+Space`. A real collision must be surfaced as `HotkeyUnavailable`; no silent alternate is selected.
3. Focus one controlled field in the current target matrix and record a `FocusSnapshot` plus a known sibling sentinel. Do not place the caret in a real message, form submission, password, terminal, remote-desktop, or elevated surface.
4. Press the toggle once. The probe enters Arming, attempts to register bare Escape, captures the target snapshot, and shows the non-activating overlay. If Escape registration fails, the probe remains idle and reports that capture/session start was blocked.
5. While the overlay is visible, independently compare foreground HWND, focused UIA element, target process/control identity, and caret/selection signature. The overlay must not activate, move the caret, or become the target.
6. Use a deterministic canned text case to exercise direct insertion; this is an insertion feasibility test, not recognition. Press the toggle again to stop the simulated active interval. The probe keeps Escape ownership through finalization/validation/dispatch, then unregisters it on the terminal path before any recovery surface could take focus.
7. Before dispatch, revalidate identity, integrity, sensitivity, editability, caret/selection, process/window/control identity, and modifier release. If any check fails, return `NotAttempted` or `Uncertain` with no automatic input.
8. For an eligible target, dispatch one ordered Unicode batch. Independently observe the controlled field, sibling field, and submission sentinel. Confirm exact expected content once, no duplicate, no wrong-target mutation, and no Enter/submission event.
9. Exercise Escape during Arming/Listening/Finalizing/Validating/Inserting-before-commit. It must cancel, invalidate the session, suppress dispatch, unregister Escape, and discard the canned text. Exercise Escape while idle after cleanup; it must pass through normally.
10. Exercise focus away and back, caret movement, selection change, target close, held modifiers, unknown/sensitive/read-only/elevated targets, and partial dispatch. Each must refuse or report an honest non-retryable outcome. No automatic clipboard recovery or paste is part of B0.

## 4. Solution chosen

Choose UI Automation and native Win32 evidence for target safety, plus a tested direct `SendInput` Unicode adapter for the positive route. `RegisterHotKey`/`WM_HOTKEY` provides system-wide toggle/cancel activation and observable collision failure. `WS_EX_NOACTIVATE` plus `ShowActivated=false` provides the non-focus-stealing overlay boundary. `GetForegroundWindow`/`GetGUIThreadInfo`/process and integrity inspection provide native cross-checks; UIA focus/runtime/control state provides semantic identity and editability evidence.

Use a provider-neutral, session-scoped lifecycle even though B0 contains no provider. Cancellation ownership belongs to the lifecycle owner, not to the overlay or target app: Escape is registered on Arming, consumed while the session is active through dispatch, and released on every terminal route. Dispatch outcome is separate from cancellation outcome. Cancellation before dispatch means `NotAttempted`; cancellation after accepted input is `TooLateToRetract` and cannot trigger a retry.

Use direct Unicode packets rather than the clipboard. For a Unicode packet count of `n` UTF-16 code units, record exactly `2n` key events (down/up per code unit), including the correct high/low surrogate sequence when present. The probe must prove that its emitted sequence contains no Enter, Tab, Escape, or other command packet. A successful native return is only `InputSent`; exact field mutation observed independently is required for `Verified`.

Rejected alternatives:

- **Clipboard paste or clipboard-assisted fallback:** rejected because it mutates user clipboard state, can race with delayed/private formats, and is explicitly deferred unless M5 later proves direct input impossible and the user approves added scope.
- **UIA `ValuePattern.SetValue` or whole-field assignment:** rejected because it can replace an entire field, is not a universal caret operation, and violates the approved selection/caret policy.
- **Forced refocus before sending:** rejected because it can move the user's caret or write to a changed destination after capture.
- **Enter/Tab or command-key synthesis:** rejected because insertion must never submit a message or navigate a form.
- **TSF/input-method registration or universal “any app” support:** rejected for B0 because it is a larger compatibility scope; the approved matrix must first prove a narrow, honest adapter.
- **Fake app-owned textbox only:** rejected because it does not establish the cross-application boundary required by M5.

## 5. Acceptance criteria

These criteria are frozen before implementation. They are B0 change-defining gates and are not achieved by this owner stage.

### 5.1 Lifecycle and cancellation gates

- [ ] **B0-L1 Single instance:** two cold launches in the same user session yield one owner and one `AlreadyRunning` result; no duplicate hotkey/session owner exists.
- [ ] **B0-L2 Toggle collision:** a real `Ctrl+Alt+Space` registration collision is detected and reported; no alternate shortcut is chosen.
- [ ] **B0-L3 Escape ownership:** Escape registration begins at Arming and remains owned through active processing/dispatch. Every terminal path unregisters it before recovery/settings can take focus. Idle Escape passes through.
- [ ] **B0-L4 Fail closed:** forced/observed Escape registration failure prevents microphone/session start and records `CancellationUnavailable`; no alternate cancellation path is substituted.
- [ ] **B0-L5 At-most-once:** repeated toggle events and a busy start never create a second active session or a second automatic dispatch.

### 5.2 Overlay and focus gates

- [ ] **B0-F1 Non-activation:** across at least five show/update/hide cycles with each available positive target, foreground HWND/process, UIA focused element, and caret/selection signature remain unchanged. The overlay never becomes the insertion target.
- [ ] **B0-F2 Target capture:** each positive case records stable HWND, process identity, integrity, UIA element identity, editability/sensitivity classification, and caret/selection evidence without collecting unrelated document content.
- [ ] **B0-F3 Permanent invalidation:** focus away/back, caret/selection movement, process/window/control change, target close, uncertain UIA evidence, or held modifiers invalidates automatic insertion for that session. Returning to the original field does not revalidate it.

### 5.3 Direct Unicode insertion gates

Run exactly four positive cases per app in this bounded B0 matrix (12 positive cases total). Every case uses an unsent, test-owned field with known sentinels and an independently observed expected result:

| Case | Controlled setup | Canned text | Required observation |
|---|---|---|---|
| P1 | Empty or known sentinel; caret at start | `Alpha 中文 😀.` | Exact text once at start; sibling sentinel unchanged |
| P2 | `L│R`; caret at middle | `会议 at 10:30，done 🧪.` | Exact `L会议 at 10:30，done 🧪.R`; caret route preserved |
| P3 | `before TARGET after`; select only `TARGET` | `Alpha 中文 😀.` | Exact `before Alpha 中文 😀. after`; only selection replaced |
| P4 | `prefix│suffix`; caret at a non-edge position | `Meet at 10:30，会议已完成 🧪.` | Exact one-time insertion with CJK, Latin, punctuation, and surrogate sequence |

The same P1–P4 cases must be run on:

1. **Windows Notepad** — installed at `C:\Windows\System32\notepad.exe`, version observed above; control/version behavior still needs supervised confirmation.
2. **Microsoft Edge** — installed at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, version `156.0.4314.42`; use only a local controlled page's standard `<textarea>` or plain `contenteditable`, not browser chrome or a live account.
3. **VS Code** — the approved untitled plain-text editor; installation was not found in the owner inventory, so these cases are blocked until the user installs it or approves a named substitution.

For every positive case, the independent observer must report exact expected content once at the expected caret/selection. All 12 must be `Verified`; any `InputSent`-only result is a B0 failure, not a pass.

### 5.4 Refusal, race, and no-submission gates

Run at least one controlled case for each row below; use a deterministic fake driver where a native race cannot be safely induced, but mark native coverage separately. Any unavailable mandatory driver blocks the gate rather than being counted as a pass.

| ID | Condition | Required result |
|---|---|---|
| N1 | Unknown window/control | `NotAttempted`; no mutation |
| N2 | Password/sensitive control | `NotAttempted`; no mutation |
| N3 | Read-only/disabled control | `NotAttempted`; no mutation |
| N4 | Higher-integrity/elevated target | Refuse; no privilege escalation or mutation |
| N5 | Terminal or remote-desktop surface | Refuse; no mutation |
| N6 | Focus changes away before dispatch | `NotAttempted`; no mutation |
| N7 | Focus leaves and returns to original target | Permanently invalid; no mutation |
| N8 | Caret/selection changes after capture | Refuse; no mutation |
| N9 | Target window/control closes | `Uncertain` or `NotAttempted`; no retry |
| N10 | Shortcut modifiers remain held | Refuse/recover; no modifier leakage into target |
| N11 | Escape cancellation before dispatch | Cancelled; zero input events and zero mutation |
| N12 | Escape registration failure | Start blocked; zero mic/session-open callback and zero mutation |
| N13 | Partial/short `SendInput` dispatch | `Uncertain`; no replay or duplicate |
| N14 | Repeated/busy start event | Busy feedback; one session and zero duplicate mutation |

Across all positive and negative cases require zero wrong-target mutations, zero duplicate automatic inserts, zero Enter/submission/navigation events, and zero mutation for cancellation-before-dispatch, unknown, sensitive, read-only, changed, or elevated targets. The probe's event trace must contain no Enter/Tab/control-key packets. Controlled fields must be unsent drafts; never use live messages or accounts.

### 5.5 Outcome contract

| Outcome | Meaning | Automatic retry |
|---|---|---|
| `NotAttempted` | Policy/cancellation/focus gate prevented any input dispatch | Never |
| `InputSent` | All requested OS Unicode events were accepted by `SendInput`, but independent mutation was not proven | Never; user-facing success must not claim verified insertion |
| `Verified` | Independent observer saw the exact expected mutation once at the expected caret/selection and sibling sentinel remained unchanged | Never |
| `Uncertain` | Partial dispatch, race, target closure, observer disagreement, or any unknown final state | Never; recovery must say text may already be present |

B0 exits only when lifecycle, overlay, target evidence, all 12 positive cases, and all mandatory refusal/race/no-submission cases pass. This does not authorize B1 or establish the later M5 60-positive release gate.

## 6. Risk

- **No SDK/toolchain:** `dotnet`, `msbuild`, and `vswhere` were absent. Installation/build is a separate coordinator-admitted heavy stage and is not evidence here. Do not claim restore, tests, or a runnable probe until a future implementer records exact SDK/package/build manifests.
- **VS Code unavailable:** the approved third matrix surface cannot be measured in this account. This is a hard B0 blocker, not permission to drop VS Code or substitute silently.
- **No interactive measurement yet:** Notepad and Edge presence is only file/version inventory. No app was activated, no field was typed into, and no focus/caret/insertion behavior is claimed.
- **UIA variability:** providers may expose insufficient or unstable caret/sensitivity evidence. The safe response is refusal or a specifically validated adapter, not whole-field mutation or a guessed target.
- **UIPI/integrity restrictions:** `SendInput` may be blocked by a higher-integrity target, and its return value does not prove UIPI cause or field mutation. Treat integrity refusal and independent observation as separate evidence.
- **Focus race:** no design can make the final focus check and cross-process dispatch atomic. The probe must make the race visible, classify it honestly, and never retry.
- **Unicode packet behavior:** surrogate and CJK handling must be observed in each app; API documentation alone is insufficient. Any miss, duplication, or command event is a blocker.
- **User participation:** a user must install/confirm VS Code or approve a named substitution, and later authorize supervised controlled unsent-field runs. Azure credentials and the recognition corpus are outside this Windows-only packet and remain unavailable.

---

## TDD / testable implementation packet

The distinct implementer owns the disposable probe implementation. The owner retains technical responsibility for this frozen contract; the implementer must return exact source/build/probe manifests and raw case evidence, not a product PASS.

### Task 1: Probe boundary and deterministic contracts

**Files:** Create only under `probes/b0-windows/`; tests under `probes/b0-windows/tests/B0.WindowsProbe.Tests/`. Do not create `src/VoiceInput.*` product projects.

**Interfaces:**
- `DispatchOutcome Classify(DispatchAttempt attempt, Observation observation)` returns the four outcome values above.
- `IProbeClock`, `IHotkeyRegistrar`, `IFocusEvidenceReader`, `IInputDispatcher`, and `IControlledFieldObserver` are injectable so lifecycle/race tests do not depend on desktop timing.

- [ ] Write failing tests for the outcome table, at-most-once fence, cancellation-before-dispatch, and no-retry behavior.
- [ ] Run only the newly created deterministic test project after the SDK is admitted; expected initial result is a compile/test failure until the contracts exist.
- [ ] Implement the minimal disposable contracts and evidence model; preserve session IDs on every callback.
- [ ] Re-run the same scoped tests and record exact command/output in evidence.

### Task 2: Hotkey, mutex, and cancellation lifetime

**Files:** `HotkeyLifecycle.cs`, `ProbeMessageWindow.cs`, and `HotkeyLifecycleTests.cs` under the disposable probe.

**Interfaces:**
- `StartResult HandleToggle(HotkeyEvent evt)`; `CancelResult HandleEscape(EscapeEvent evt)`.
- `void RegisterToggleOrReportCollision()`; `bool TryArmEscape(SessionId id)`; `void ReleaseEscape(SessionId id, TerminalReason reason)`.

- [ ] Write failing tests for one owner, collision, repeated/busy toggles, Escape registration failure, active consumption, idle pass-through, and unregister-on-every-terminal-path.
- [ ] Implement `RegisterHotKey`/`WM_HOTKEY` dispatch and a per-user named mutex; keep Escape registration fail-closed.
- [ ] Implement the lifecycle fence so cancellation before dispatch yields `NotAttempted` and after accepted input yields `TooLateToRetract` without replay.
- [ ] Run deterministic tests, then a supervised native hotkey run only after coordinator admission; record registration IDs, terminal paths, and cleanup.

### Task 3: Non-activating overlay and focus evidence

**Files:** `NonActivatingOverlay.xaml(.cs)`, `FocusSnapshot.cs`, `OverlayActivationTests.cs`.

**Interfaces:**
- `OverlayHandle ShowNonActivating(OverlayState state)` and `void Update(OverlayState state)`.
- `FocusSnapshot Capture()` and `FocusValidation Validate(FocusSnapshot captured, FocusSnapshot current)`.

- [ ] Write failing tests for unchanged foreground/focus/caret signature across overlay show/update/hide and for permanent invalidation after focus away/back.
- [ ] Implement `WS_EX_NOACTIVATE`, `ShowActivated=false`, non-interactive session rendering, and disposable UIA/native event observers.
- [ ] Implement identity, integrity, editability, sensitivity, and bounded caret/selection evidence without reading unrelated document text.
- [ ] Run deterministic fake-snapshot tests, then the supervised overlay/focus matrix; require zero focus theft and retain before/after snapshots.

### Task 4: Target policy and refusal matrix

**Files:** `TargetPolicy.cs`, `TargetPolicyTests.cs`, and matrix-case definitions.

**Interfaces:**
- `TargetDecision Evaluate(FocusSnapshot snapshot, MatrixAdapter adapter)` returns `Eligible`, `Changed`, `Sensitive`, `Unsupported`, or `Uncertain` with a typed reason.
- `bool IsPermanentlyInvalid(SessionId id, FocusEvidence current)`.

- [ ] Write failing tests for unknown, sensitive, read-only, elevated, terminal/remote, target-closed, caret-changed, held-modifier, and focus-away/back conditions.
- [ ] Implement allow-list adapters for Notepad, Edge local standard textarea/plain contenteditable, and VS Code untitled plain-text only; refuse all else.
- [ ] Implement pre-dispatch revalidation and at-most-once acquisition; do not restore focus.
- [ ] Run the refusal/race matrix; any missing native driver remains blocked, not passed.

### Task 5: Clipboard-free Unicode dispatch

**Files:** `UnicodeInputAdapter.cs`, `DispatchOutcome.cs`, `UnicodeInputAdapterTests.cs`.

**Interfaces:**
- `DispatchAttempt Prepare(string finalText, FocusToken token)` rejects control characters/commands and returns an ordered UTF-16 packet list.
- `DispatchOutcome TryDispatch(DispatchAttempt attempt, FocusToken token)` records requested count, native return, and independent observation separately.

- [ ] Write failing tests for ASCII, CJK, mixed text, emoji/surrogate pairs, selection replacement, control-character normalization/rejection, zero Enter/Tab/Escape packets, and short dispatch.
- [ ] Implement only `SendInput` Unicode packets with correct key-down/key-up pairing; no clipboard, paste, SetValue, forced refocus, Enter, or Tab.
- [ ] Implement `Verified` only after the independent observer confirms exact expected content once; classify accepted-but-unobserved as `InputSent`.
- [ ] Run event-spy tests, then P1–P4 on every available named app. A missing VS Code run blocks exit.

### Task 6: Independent evidence runner and handoff manifest

**Files:** `ProbeEvidenceWriter.cs`, matrix runner, and a content-free case manifest under the work-item evidence directory; do not overwrite owner evidence.

**Interfaces:**
- `CaseEvidence RunCase(MatrixCase caseDefinition)` records setup hash/sentinel IDs, captured target identity, expected/observed controlled content, event sequence, dispatch outcome, terminal cleanup, and blocker reason.
- `ProbeManifest` records source revision, SDK/package versions, OS/app versions, command lines, and file hashes.

- [ ] Write failing schema/fixture tests for missing evidence, duplicate writes, wrong-target sentinel changes, and command-key detection.
- [ ] Implement bounded evidence output and explicit `unmeasured`/`blocked` states; never infer a pass from a missing observer.
- [ ] Run the complete B0 matrix under one documented desktop condition and inspect every case record.
- [ ] Return the probe source tree, exact build manifest, raw evidence directory, and a concise exit report to the owner. Do not commit or push.

### Future commands (proposed, not executed)

The following are placeholders for the distinct implementer after coordinator admission and after the source tree exists. They are not claims that the commands work today:

```powershell
# From the assigned worktree, only after an admitted SDK check reports .NET 10.x:
dotnet --list-sdks

# After the disposable solution/project has actually been created:
dotnet restore .\probes\b0-windows\B0.WindowsProbe.sln
dotnet test .\probes\b0-windows\B0.WindowsProbe.sln --configuration Release

# Only after restore/build succeeds and the implementer has a controlled-field run authorization:
dotnet run --project .\probes\b0-windows\src\B0.WindowsProbe\B0.WindowsProbe.csproj -- --matrix .\probes\b0-windows\matrix.json --evidence <WORK_ITEM_DIR>\evidence\native-probe
```

No command above was run in this owner stage; no SDK/package install is authorized by this packet. The implementer must replace the placeholders with the actual solution/project names and record exact outputs before reporting feasibility.

## Owner self-review and handoff state

- Spec coverage: this packet covers M1 activation/cancellation, M3 non-focus-stealing overlay, M5 target/caret/direct insertion, M6 uncertain-dispatch distinction, and M8 cancellation/at-most-once/race boundaries. Capture/provider, onboarding/privacy, bilingual quality, and runnable release remain separate B0/B1–B6 work.
- No product code was authored; no source solution exists in the assigned worktree.
- The criteria are frozen and explicitly distinguish `InputSent` from `Verified`.
- Known hard blocker: VS Code is absent, so the approved three-app matrix cannot yet exit B0. Toolchain absence also blocks implementation until separately admitted.
- Status: **owner contract ready; implementation and independent verification pending; not a product PASS and not shipped.**
