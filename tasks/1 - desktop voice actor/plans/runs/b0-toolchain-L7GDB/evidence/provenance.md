# B0 Toolchain / Build Prerequisites Provenance

**Work item:** `b0-toolchain-L7GDB`  
**Inventory date:** 2026-10-24 16:04–16:05 +08:00  
**Owner stage:** documentation/read-only inventory only  
**Status:** baseline recorded; candidate and build identities pending implementation

## Authority and scope

The user explicitly overrides the legacy task registry and stale drafts for this run:

- Task documents: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor`
- Approved architecture: `research.md`
- Approved scope: `decision.md`
- Original brief: `task.md.txt`
- Work item: `plans\runs\b0-toolchain-L7GDB`
- Assigned detached worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`

The older `architecture\architecture.md` and `plans\plan.md` were read for context but are not used as requirements. This owner record does not overwrite or amend the approved architecture/scope.

## Repository identity

| Field | Observed value |
|---|---|
| Repository root | `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB` |
| Baseline SHA | `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` |
| Branch state | Detached `HEAD` (`## HEAD (no branch)`) |
| Baseline status | Clean; no changed/untracked product files observed |
| Tracked files at baseline | `.gitignore`, `AGENTS.md`, `README.md` |
| Solution/project state | No `.sln`, `.csproj`, `src/`, or test tree present |
| Git version | `2.47.1.windows.1` |
| Git policy | No global `safe.directory` or config mutation used; command-scoped safe-directory was supplied when checking the worktree |
| Candidate SHA | **Pending implementation; not fabricated** |

The owner did not edit source files, create a project, install tooling, restore packages, compile, publish, or commit.

## Read-only environment inventory

| Check | Result | Interpretation |
|---|---|---|
| `where.exe dotnet` / `Get-Command dotnet` | Not found | .NET SDK/runtime is not available through PATH |
| `where.exe csc` | Not found | C# compiler not available through PATH |
| `where.exe msbuild` | Not found | MSBuild not available through PATH |
| `where.exe vswhere` | Not found | Visual Studio discovery tool not available through PATH |
| `C:\Program Files\dotnet\sdk` | Missing | No standard x64 SDK location observed |
| `C:\Program Files (x86)\dotnet\sdk` | Missing | No standard x86 SDK location observed |
| `C:\Program Files\Microsoft Visual Studio` | Missing | No standard Visual Studio location observed |
| `C:\Program Files (x86)\Microsoft Visual Studio` | Missing | No standard x86 Visual Studio location observed |
| `C:\Program Files (x86)\Windows Kits\10\bin` | Missing | No standard Windows SDK bin location observed |
| Task `.work\tools` | Missing at inventory time | Future SDK must be task-local if admitted |
| User NuGet cache / local Microsoft dotnet cache | Missing at checked paths | Future restore may need approved network access |
| PowerShell | `C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe` | Available for future Windows commands |
| `tar.exe` | `C:\WINDOWS\system32\tar.exe` | Available; no archive claim made |
| `7z`, `signtool`, `dumpbin` | Not found | Optional diagnostics/packaging tools unavailable |
| OS version | `.NET` environment reported `10.0.26200.0` | Windows host version observed; WMI caption query was denied |
| Host bitness | `PROCESSOR_ARCHITECTURE=AMD64`; `Is64BitOperatingSystem=True` | Host is x64; this is not proof of a published app's architecture |
| VC runtime registry | x64 keys present with version `v14.44.35211.00` | Environmental clue only; not proof of Azure native dependency loading |

No broad secret read was attempted. No credential files, environment secret values, Manus tokens, or unrelated accounts were inspected.

## Approved retained official-source evidence

No external search/fetch was run in this owner stage. The following official URLs and excerpts were already retained in the approved architecture evidence file `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\evidence\source-excerpts.md`, retrieved 2026-10-24 through official documentation/source extraction. They are documentation evidence, not product measurements:

- .NET lifecycle and self-contained servicing: <https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core>
- NAudio current packages/targets: <https://github.com/naudio/naudio>
- NAudio `WasapiRecorder` capture and buffer lifecycle: <https://github.com/naudio/NAudio/blob/main/Docs/WasapiRecorder.md>
- Azure real-time speech overview/events: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-to-text>
- Azure intermediate/final events and refinement: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-recognize-speech>
- Azure locale/functionality table: <https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support>
- Azure real-time data privacy: <https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/speech-to-text/data-privacy-security>
- Microsoft `RegisterHotKey`: <https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-registerhotkey>
- Microsoft `SendInput`/UIPI: <https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput>

Relevant retained conclusions are limited to: .NET 10 is the approved active-LTS target in the architecture evidence; NAudio 3 exposes focused packages and modern WASAPI capture guidance; Azure documents intermediate/final streaming events and `en-US`/`zh-CN` locale support; and Azure real-time privacy claims apply only to the documented real-time mode. None proves package compatibility, app compatibility, accuracy, latency, native loading, or a clean-machine run.

## Unrun checks and evidence boundary

The following are intentionally **not run** by the owner and must not be represented as passes:

- .NET SDK installation or `dotnet --info` from a task-local SDK.
- NuGet restore, exact NAudio/Azure package resolution, package lock, or compatibility warnings.
- Any compile, test, publish, self-contained runtime launch, or output hash.
- Native DLL enumeration/loading or transitive dependency diagnostics.
- Microphone capture, device enumeration, provider calls, Azure consent, credential validation, or evaluation corpus execution.
- WPF overlay, hotkey, insertion, tray, or external-application behavior.
- Independent verifier measurements or a clean Windows 11 standard-user run.

The B0 contract therefore remains pending implementation. A future candidate is valid only when the implementer records exact source/build/package/native manifests and a fresh verifier repeats the gates from a separate evidence path.

## Provenance requirements for the next stage

The distinct implementer must append new, separately named evidence files rather than rewrite this record. At minimum:

1. SDK installer URL, retrieval timestamp, SHA-256, install path, exact SDK/host info, and architecture.
2. Probe source file list and SHA-256 values; exact project/solution paths; no product source outside `.work\b0-probe`.
3. Exact `NAudio.Wasapi` 3.x and `Microsoft.CognitiveServices.Speech` versions, feed, dependency graph, lock-file hash, restore command, and exit code.
4. Build/publish command lines, target framework, RID, self-contained setting, output file list/hashes, and direct-launch output.
5. Actual native DLL names/paths/hashes/architectures and `NativeLibrary.Load`/`Free` results.
6. No-mic/no-cloud process/network/file observations, with no credential or transcript content in logs.
7. Implementer status and blockers. Candidate SHA remains pending unless a later authorized process creates one.

**Owner conclusion:** Baseline and constraints are frozen for a distinct implementer. Toolchain/build/native feasibility is not yet proven; B0 is ready, blocked on SDK/package availability, and must not be treated as a product or release PASS.
