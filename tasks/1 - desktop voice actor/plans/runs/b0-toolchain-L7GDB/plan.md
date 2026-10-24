# B0 Toolchain and Build Prerequisites Implementation Plan

> **For implementation workers:** Use checkbox (`- [ ]`) syntax for tracking. This is a bounded B0 feasibility packet for a distinct implementation worker. Do not infer a candidate identity, product PASS, or release readiness until the implementation and independent verification records exist.

**Goal:** Establish a reproducible, user-level .NET 10/WPF Windows x64 toolchain and prove that the pinned NAudio/Azure package set can restore, build, publish, and load its required native dependencies without microphone capture or cloud calls.

**Architecture:** The repository is an empty greenfield baseline. B0 creates only a disposable probe under the assigned worktree's ignored `.work\b0-probe` directory; it does not create production `src/` projects or implement speech, session, tray, overlay, insertion, consent, or settings behavior. The future probe references `NAudio.Wasapi` and `Microsoft.CognitiveServices.Speech` only to prove compile/restore and local native loading, while the approved product remains C#/.NET 10 LTS/WPF with an Azure-only F0 real-time provider adapter.

**Tech Stack:** C#; `net10.0-windows`; WPF targeting; Windows x64 RID `win-x64`; task-local .NET 10 SDK under `.work\tools\dotnet`; exact restored package versions for `NAudio.Wasapi` 3.x and `Microsoft.CognitiveServices.Speech`; PowerShell on Windows; self-contained folder publish, not an assumed single executable.

**Spec:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\research.md` (approved architecture and B0/M1–M9 gates) and `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\decision.md` (approved scope). The local brief is `task.md.txt`. Legacy `architecture\architecture.md` and `plans\plan.md` were read for context only and are not authoritative.

## Global Constraints

- Windows-first native desktop product; the approved production target is C#/.NET 10 LTS/WPF with `net10.0-windows`, not a web page or cross-platform shell.
- B0 owns toolchain/build prerequisites only. It must not implement product features or alter production source structure.
- The initial provider is Azure Speech only, with one F0 real-time stream and the approved 5 audio-hours/month default. Do not add a paid S0/Voice Live switch, a challenger provider, or a backend.
- No microphone open, audio capture, provider request, Azure credential read, live account use, UI interaction, or cloud consent occurs in this owner stage. The future probe must also have an explicit no-mic/no-cloud mode and use no secret values.
- If the future probe needs the SDK, install it only under the task worktree's `.work\tools`; do not install globally, require admin rights, or alter global Git/configuration/hooks.
- Pin the exact resolved versions of `NAudio.Wasapi` (3.x) and `Microsoft.CognitiveServices.Speech` in the disposable probe and a lock file after a real restore. Do not invent or pre-claim versions before restore metadata exists.
- Preserve portable self-contained delivery. Publish a `win-x64` folder containing all required managed/native dependencies; do not claim a universal single-file binary.
- Do not commit, push, merge, deploy, or edit the original checkout. Candidate identity remains pending until an implementer records exact source/build manifests and a fresh verifier audits them.
- B0 failure at SDK, package compatibility, x64 publish, or native loading is a hard gate. Do not quietly continue to B1–B6 or demote M4/M9.

## Review Focus

1. **Missing global SDK/compiler:** the probe must use a task-local .NET 10 SDK and report its exact `dotnet --info`; no PATH/global SDK is treated as proof. Test: `ToolchainProbeReportsSdkAndTarget`.
2. **WPF/package incompatibility:** restore must resolve `net10.0-windows`, WPF targeting, NAudio 3.x, and Azure Speech without unresolved assets or warning-as-error failures. Test: locked restore plus package-asset inspection.
3. **Incorrect RID or framework-dependent output:** the published probe must be `win-x64`, self-contained, and runnable without a separately installed .NET runtime. Test: clean publish directory launch and runtime-architecture assertion.
4. **Native dependency omission or wrong bitness:** every actual native DLL required by the restored SDK/publish manifest must load from the publish directory as x64; a registry entry alone is insufficient. Test: `NativeDependenciesLoadFromPublish` with `NativeLibrary.Load` and an exact DLL/hash manifest.
5. **Accidental capture or network use:** the probe must not open a microphone, create audio files, read credentials, or call Azure. Test: explicit `--no-mic --no-cloud` self-check, content-free process log, and verifier network/process audit.

---

## 1. Problem statement

The assigned worktree is a clean detached checkout at baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` containing no solution, project, test runner, `src/` tree, or build command. `dotnet`, `csc`, `msbuild`, and `vswhere` are absent from PATH; standard .NET SDK, Visual Studio, and Windows Kits locations are absent; task-local `.work\tools` and visible NuGet caches are absent. The host is Windows with `10.0.26200.0`, `AMD64`, and `Is64BitOperatingSystem=True`; the x64 VC runtime registry keys expose version `v14.44.35211.00`, but this is not proof that Azure's native payload is present or loadable.

B0 therefore has one change-defining purpose: give later owners a measured toolchain and package/build boundary before anyone implements the session core or speech feature. The baseline fails this purpose because no probe or artifact exists. This plan does not claim that any SDK, package, native dependency, microphone, Azure resource, credential, or evaluation corpus is available.

## 2. Architecture changes

No production architecture changes are authorized in B0. The future implementer creates disposable files only at:

- `.work\tools\dotnet\` — task-local SDK install, if the coordinator admits installation.
- `.work\b0-probe\B0.ToolchainProbe.sln` — disposable solution.
- `.work\b0-probe\app\` — disposable WPF/`net10.0-windows` probe.
- `.work\b0-probe\out\` — restore/build/publish outputs and transient logs.

The disposable project must include exact package references for `NAudio.Wasapi` and `Microsoft.CognitiveServices.Speech` after the implementer resolves compatible stable versions. It must expose a deterministic self-check that reports target framework, RID, process bitness, package assembly identities, publish directory, and native DLL load results. The self-check must not instantiate a live recognizer, start `WasapiRecorder`, open a device, read a key, or send a request. The eventual production organization remains the approved four-project boundary (`VoiceInput.Core`, `VoiceInput.Windows`, `VoiceInput.Speech`, `VoiceInput.App`) and must not be created or implied by this probe.

The implementer must retain exact source and build manifests outside disposable output before cleanup. A manifest records relative path, byte length, SHA-256, SDK version, package IDs/versions, target/RID, publish flags, native DLL names/architectures/hashes, and command exit codes. The owner provenance file is immutable after this handoff; implementation and verifier records use separate evidence files/directories.

## 3. User flow

This is a developer/toolchain flow, not an end-user dictation flow:

1. From a cold checkout, the implementer confirms the assigned worktree and baseline SHA, then checks that no global .NET tool is being used.
2. After fresh coordinator admission, the implementer installs the official .NET 10 SDK into `.work\tools\dotnet` only if needed, records installer URL/hash and `dotnet --info`, and prepends that directory for the current PowerShell process only.
3. The implementer scaffolds the disposable WPF probe under `.work\b0-probe`, resolves the two required package IDs, records exact versions and dependency graph, and enables locked restore.
4. The implementer runs a failing pre-build check on the unscaffolded baseline (no probe/solution), then restores and builds the probe in Release for `net10.0-windows`/`win-x64`.
5. The implementer publishes a self-contained `win-x64` folder, launches its no-mic/no-cloud self-check, and records output hashes and native load results.
6. The implementer writes candidate manifests and leaves the disposable probe available for the fresh verifier. The verifier repeats restore/build/publish/native-load checks from its own evidence path and may reject any missing byte/hash, package, architecture, or no-network proof.

Expected B0 end state: a reviewable, runnable disposable toolchain probe and exact provenance packet, or a named hard blocker. There is no user-facing product flow or release PASS in this slice.

## 4. Solution chosen

The selected approach is a task-local official SDK plus a disposable WPF probe because the repository is empty and no global toolchain exists. This preserves the user-level/no-admin goal and avoids contaminating other tasks. A global SDK installation is rejected because it is not reproducible and may require admin rights. A framework-dependent publish is rejected because M9 requires a clean Windows x64 baseline without a separately installed .NET runtime. A single-file publish is deferred/rejected for B0 because native speech dependencies must remain visible and load-tested in the portable folder. Azure live calls and microphone capture are rejected because this slice proves build/native prerequisites only and credentials/corpus are unavailable.

The following commands are **future implementation proposals, not executed commands**. They are valid only after the implementer rechecks the assigned worktree and receives fresh coordinator admission:

```powershell
$repo = 'C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB'
$tools = Join-Path $repo '.work\tools'
$dotnetRoot = Join-Path $tools 'dotnet'
$probe = Join-Path $repo '.work\b0-probe'
New-Item -ItemType Directory -Force -Path $tools, $dotnetRoot, $probe | Out-Null
$installer = Join-Path $tools 'dotnet-install.ps1'
Invoke-WebRequest -UseBasicParsing -Uri 'https://dot.net/v1/dotnet-install.ps1' -OutFile $installer
Get-FileHash -Algorithm SHA256 $installer
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installer -Channel 10.0 -Architecture x64 -InstallDir $dotnetRoot
$dotnet = Join-Path $dotnetRoot 'dotnet.exe'
& $dotnet --info
```

After the SDK is present, scaffold only the probe. Do not assume a template or solution exists before these checks:

```powershell
& $dotnet new sln --name B0.ToolchainProbe --output $probe
$app = Join-Path $probe 'app'
& $dotnet new wpf --name B0.ToolchainProbe --framework net10.0-windows --output $app
$sln = Join-Path $probe 'B0.ToolchainProbe.sln'
$proj = Join-Path $app 'B0.ToolchainProbe.csproj'
& $dotnet sln $sln add $proj
```

The implementer must resolve exact package versions from the permitted NuGet source, then use those resolved values rather than guessing. The command shape is:

```powershell
$naudioVersion = '<exact restored NAudio.Wasapi 3.x version>'
$azureVersion = '<exact restored Microsoft.CognitiveServices.Speech version>'
& $dotnet add $proj package NAudio.Wasapi --version $naudioVersion
& $dotnet add $proj package Microsoft.CognitiveServices.Speech --version $azureVersion
& $dotnet restore $sln --use-lock-file
```

The angle-bracket values are required implementation inputs, not permitted literal package versions. The implementer must replace them only after recording the package feed response and compatibility result. The project must target `net10.0-windows`, set `RuntimeIdentifier` to `win-x64` for the probe build, and keep `SelfContained` explicit in the publish command. Future commands, after the project file is real, are:

```powershell
& $dotnet restore $sln --locked-mode
& $dotnet build $sln --configuration Release --runtime win-x64 --no-restore
$publish = Join-Path $probe 'out\publish'
Remove-Item -LiteralPath $publish -Recurse -Force -ErrorAction SilentlyContinue
& $dotnet publish $proj --configuration Release --runtime win-x64 --self-contained true --no-restore --output $publish
& (Join-Path $publish 'B0.ToolchainProbe.exe') --no-mic --no-cloud
```

The probe's deterministic tests/self-checks must be named and observable: `ToolchainProbeReportsSdkAndTarget`, `PackageAssemblyReferencesResolve`, `NativeDependenciesLoadFromPublish`, and `NoMicOrCloudSideEffects`. For native loading, enumerate the actual native payload discovered in the restored/published output and use `NativeLibrary.Load`/`NativeLibrary.Free` on each expected path; do not hard-code an unverified DLL name. Record x64 process architecture, each path, file hash, load result, and any missing transitive dependency. A passing compile or `InputSent`-style event is not a native-load pass.

## 5. Acceptance criteria

These criteria are frozen before implementation. They are change-defining where the baseline lacks the artifact; inventory/regression checks are labeled separately.

### Change-defining B0 gates

- [ ] **B0-C1 — Task-local SDK:** An exact `.work\tools\dotnet\dotnet.exe` is recorded with installer URL/hash, SDK version, host version, and x64 architecture. The probe does not depend on a global PATH SDK. Baseline fails because no SDK or local tool exists.
- [ ] **B0-C2 — Locked package compatibility:** `NAudio.Wasapi` resolves to an exact 3.x version and `Microsoft.CognitiveServices.Speech` resolves to an exact version recorded in the project and lock file. `net10.0-windows` restore has no unresolved assets; the package graph and restore exit code are retained. Baseline fails because no project or lock file exists.
- [ ] **B0-C3 — Windows x64 build:** The disposable WPF probe builds Release for `net10.0-windows` and `win-x64` with the task-local SDK and the recorded package graph, with command output and source manifest retained. Baseline fails because no solution/project exists.
- [ ] **B0-C4 — Self-contained publish:** A clean `win-x64` publish folder contains the runnable probe and all required managed/native payloads; the probe starts without a separately installed .NET runtime and reports x64. No single-file or framework-dependent claim substitutes for this gate.
- [ ] **B0-C5 — Native dependency load:** Every actual native dependency required by the restored package set is enumerated, hash-recorded, and successfully loaded from the publish directory by the probe without mic access or network calls. Missing VC/native dependencies are a hard failure, not a documentation footnote.
- [ ] **B0-C6 — No side effects:** The no-mic/no-cloud self-check opens no microphone, creates no audio/transcript file, reads no Azure key/region, opens no network connection, and emits no content-bearing log. The implementer must provide the exact process/log observation used; a verifier repeats it independently.
- [ ] **B0-C7 — Portable provenance:** Source SHA-256 manifest, SDK/package manifest, restore/build/publish commands, output hashes, RID, self-contained flag, and native-load results are complete and tied to the same working-tree snapshot. Candidate SHA remains pending unless a later authorized process creates one.

### Regression and scope guards (not change proof by themselves)

- [ ] **B0-R1:** The original baseline checkout remains unchanged; no product files, global Git settings, global SDK registrations, credentials, or provider resources are modified.
- [ ] **B0-R2:** The probe contains no production session/speech/insertion implementation and remains disposable. B1–B6 cannot cite B0 as proof of M1–M9 behavior.
- [ ] **B0-R3:** Any SDK/package/native failure is reported as a hard B0 blocker. The implementer must not weaken the target framework, change to a paid S0/Voice Live plan, ship English-only, or bypass the x64/native gate.

A fresh verifier must repeat all B0-C1–C7 checks from a separate verifier-owned evidence directory. Owner/implementer output is not an independent PASS.

## 6. Risk

- **SDK availability:** no .NET SDK/compiler is currently installed. Official download, task-local writable storage, and fresh coordinator admission are required. If the SDK cannot install or run user-level, stop B0.
- **Framework/package mismatch:** NAudio 3.x and Azure SDK compatibility with `net10.0-windows` is not measured. The actual restore graph, warnings, and publish output decide; documentation or package names alone do not.
- **Native payload:** Azure Speech may require native DLLs or runtime components not visible until publish. The existing VC runtime registry key is only an environmental clue. A failed load blocks B1/B3.
- **Clean-machine claim:** this host is not a clean-machine verifier. The implementer can prove self-contained output locally, but M9's clean Windows 11 standard-user run needs a fresh verifier/device/profile with no separately installed runtime.
- **Network/package provenance:** package restore needs an approved feed and internet access, but the no-cloud probe must not use Azure. Record feed, retrieval time, exact versions, hashes, and restore mode; never place credentials in command history or logs.
- **Missing provider inputs:** no Azure key/region or consented 90-utterance corpus is available. This blocks live bilingual recognition gates later, not the offline toolchain preparation. Do not substitute fake recognition or claim M4.
- **Access limits:** WMI OS-caption query returned Access Denied, and `signtool`, `dumpbin`, `7z`, Visual Studio, and Windows SDK standard locations were not available. Do not treat absent diagnostics as absent dependencies; use the exact future publish/native-load manifest and report unavailable tools.

**Owner self-review:** The approved architecture's B0 objective, M9 portable artifact requirement, package/native uncertainty, no-admin constraint, Azure-only F0 boundary, and hard-gate rule are all covered. No product implementation, build result, provider result, or verification verdict is claimed.
