# B0 Windows Owner Provenance and Evidence

**Work item:** `b0-windows-L7GDB`

**Subject:** Windows activation/focus/insertion feasibility only

**Owner stage status:** Contract and read-only inventory complete. No implementation, build, app interaction, provider call, microphone capture, or product verification performed.

## Provenance

- **Task document root:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor`
- **Approved architecture:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md`
- **Approved scope:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\decision.md`
- **Original brief:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\task.md.txt`
- **Assigned worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-windows-L7GDB`
- **Baseline SHA:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`
- **Git state observed:** detached `HEAD`; `git status --short --branch` reported only `## HEAD (no branch)` and no changes.
- **Owner work-item directory:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-windows-L7GDB`
- **Proposed probe source directory:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-windows-L7GDB\probes\b0-windows\` (does not exist yet; reserved for the distinct implementer).
- **Inspection date:** 2026-10-24 (local task timestamp).

The assigned worktree is intentionally empty of product source. It contains only repository metadata and guidance files. No source/toolchain/speech worktree was entered or modified.

## Read-only environment inventory

| Item | Observation | Evidence status |
|---|---|---|
| .NET SDK (`dotnet`) | Not found on PATH; no `dotnet --info` output available | Toolchain absent; implementation blocked until admitted setup |
| MSBuild (`msbuild`) | Not found on PATH | Toolchain absent |
| Visual Studio locator (`vswhere`) | Not found on PATH | Toolchain absent |
| Windows Notepad | `C:\Windows\System32\notepad.exe` exists; file/product version `10.0.26100.8457` | Presence/version inventory only; app not launched |
| Microsoft Edge | `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` exists; file/product version `156.0.4314.42` | Presence/version inventory only; app not launched |
| VS Code | Not found at `C:\Program Files\Microsoft VS Code\Code.exe`, `C:\Program Files (x86)\Microsoft VS Code\Code.exe`, or the inspected uninstall registry locations | Hard matrix blocker; no silent substitution |
| Product solution/projects | No `.sln`, `.slnx`, `.csproj`, `.cs`, `.xaml`, `.json`, `.props`, or `.targets` found in assigned worktree | Greenfield baseline confirmed |
| Microphone/provider/corpus | Not inspected or used; outside this Windows-only packet | Unavailable/not applicable |

The inventory was collected with read-only PowerShell/Get-Command/Test-Path/Get-Item/Get-ItemProperty/Get-ChildItem calls and scoped Git commands. No application was activated, no field was focused, and no text was typed into any field.

## Available API/driver assessment

| Boundary | Proposed safe driver | Current evidence | Claim allowed now |
|---|---|---|---|
| Global toggle/cancel | `RegisterHotKey`, `WM_HOTKEY`, `UnregisterHotKey` | Official API reference retained in approved evidence; no runtime probe | Documented design candidate only |
| Single instance | Per-user named mutex | No probe source exists | Future probe contract only |
| Non-activating overlay | WPF `ShowActivated=false`, `WS_EX_NOACTIVATE` | No WPF project/SDK | Future probe contract only |
| Focus/identity | UIA `AutomationElement.FocusedElement`, runtime/control state, `GetForegroundWindow`, `GetGUIThreadInfo`, process/integrity inspection, bounded hooks | No app/UIA interaction | Future evidence driver only |
| Caret/selection evidence | UIA read-only selection/range evidence plus native focus/caret cross-check | No target control observed | Must be measured per app; no compatibility claim |
| Unicode insertion | `SendInput` `KEYEVENTF_UNICODE` | Not compiled or called | Future probe route only; OS return will not prove mutation |
| Independent mutation observation | Controlled unsent field observer with known sentinels | No app launched | Mandatory for `Verified`; unavailable now |

## Official reference provenance

The approved architecture's retained [source excerpts](../../../../evidence/source-excerpts.md) record official references retrieved 2026-10-24. They support API capability and limitations, not product compatibility or measured success. The URLs below are preserved for the distinct implementer and fresh verifier:

1. Microsoft `RegisterHotKey`: <https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey> — system-wide hotkey and collision behavior.
2. Microsoft UI Automation `TextPattern`: <https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/ui-automation-textpattern-overview> — read-only text ranges; not an insertion mechanism.
3. Microsoft `SendInput`: <https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput> — Unicode input and UIPI/integrity limitation; return value is not proof of field mutation.
4. Microsoft clipboard operations: <https://learn.microsoft.com/en-us/windows/win32/dataxchg/clipboard-operations> — ownership/delayed-rendering limitations supporting the no-clipboard route.
5. Microsoft Windows voice-typing guide: <https://support.microsoft.com/en-us/accessibility/windows/use-voice-typing-to-talk-instead-of-type-on-your-pc> — shortcut-to-text-box prior art only, not compatibility evidence.

These links are canonical official Microsoft URLs preserved from the approved source-evidence packet. They were not live-fetched again in this owner stage because the Windows-local deep-research skill copy was unavailable and no external lookup was necessary to define this already-approved contract. Do not treat URL presence as a runtime or product pass; the implementer/verifier must record any fresh retrieval date if relying on changing API behavior.

## Frozen evidence matrix summary

### Positive (must all be independently verified later)

- Notepad P1–P4: four cases using start, middle caret, selection replacement, and non-edge caret with CJK/Latin/punctuation/surrogate text.
- Edge local standard textarea/plain contenteditable P1–P4: same cases, never browser chrome or live account.
- VS Code untitled plain-text P1–P4: same cases; currently blocked because VS Code is absent.

### Refusal/race/cancel (at least one each, native coverage separate from fake-driver coverage)

Unknown, sensitive/password, read-only, elevated/higher-integrity, terminal/remote, focus-away, focus-away/back, caret/selection changed, target close, held modifiers, Escape-before-dispatch, Escape-registration failure, partial dispatch, and repeated/busy start.

### Binary gates

- all 12 positives must be `Verified`, not merely `InputSent`;
- zero wrong-target mutations;
- zero duplicate automatic inserts;
- zero Enter/submission/navigation events;
- zero mutation for cancelled-before-dispatch, unknown, sensitive, read-only, changed, or elevated targets;
- Escape consumed only while active, released on every terminal path, and failed registration blocks start;
- no forced refocus, blanket `SetValue`, clipboard mutation, automatic paste, or automatic retry.

The later M5 release gate remains 60 positive attempts (20 per named app) plus at least 40 refusal/race/cancel cases. This B0 owner packet does not claim that gate or any product PASS.

## Blockers and user participation

1. **Toolchain blocker:** no .NET SDK/MSBuild/VS locator is available. A future implementation stage needs coordinator admission and an exact SDK/package/build manifest.
2. **Matrix blocker:** VS Code is absent from the inspected installation paths/registry. The approved matrix cannot exit B0 until the user installs/confirms VS Code or approves a named substitution; silent reduction is forbidden.
3. **Interaction blocker:** all three surfaces require supervised controlled unsent-field runs. This owner account has not activated apps or typed into fields, by instruction.
4. **Independent verification dependency:** a distinct implementer and fresh verifier are required. Owner evidence cannot substitute for either role.

**One user question:** Can you install/confirm a supported VS Code build on this Windows desktop (or explicitly approve a named substitution) and authorize a later supervised disposable-probe run only in controlled unsent fields? Azure credentials and the recognition corpus are not needed for this Windows-only probe.

## Negative claims / unrun checks

- No API was compiled or called.
- No hotkey registration, Escape registration, overlay display, focus capture, UIA query, `SendInput`, app launch, or field mutation was attempted.
- No microphone, speech provider, Azure account, secret, credential, or live service was accessed.
- No build/test/restore/publish command was run.
- No commit, push, merge, deployment, or product-source change was made.

**Evidence conclusion:** The Windows probe contract is frozen and technically scoped, but feasibility remains **blocked/pending** until toolchain admission, VS Code availability, supervised app measurements, and independent verification.
