# B0-T v2 SDK Acquisition Helper Repair 01

**Work item:** `b0-toolchain-L7GDB`  
**Repair reservation:** `sdk-helper-fix-01`  
**Reservation receipt:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\coordination\implementation-20261024-L7GDB\evidence\admission-sdk-helper-fix-start-01.json`  
**Repair timestamp:** `2026-10-24T16:50:06+08:00`  
**Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`  
**Status:** `FIXED SOURCE / NOT ACQUIRED / NOT INSTALLED / NOT VERIFIED`

## Boundary and preserved evidence

This is one focused worker-owned repair round. The original preparation report remains unchanged at `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-acquisition-preparation.md`. The prepared source manifest also remains unchanged at `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-acquisition-manifest.json`.

Only the acquisition helper, its deterministic test, and a new representative fixture under the assigned worktree were changed. No network request or SDK transfer was run in this worker terminal. No SDK/model/package was installed, extracted, restored, built, tested, or fetched. No product source, canonical document, microphone, provider, credential, proxy, TLS/CA setting, system setting, commit, push, or deployment was touched. The helper source retains acquisition-only behavior: it writes only below `<worktree>\\.work\\acquisition`, never extracts or installs, uses bounded streamed transfer, keeps default Node certificate validation, validates HTTPS and the explicit Microsoft host allowlist, verifies authoritative SHA-512, and preserves mismatched existing archives.

## Diagnosis and root cause

The parent’s network-routed helper reached the official .NET 10 releases JSON and exited 1 with:

` sdk-acquisition-error: unexpected SDK archive name: dotnet-sdk-win-x64.zip `

The metadata shape is the official display-name/URL split: the file entry’s `name` is the generic display label `dotnet-sdk-win-x64.zip`, while the validated URL path carries the versioned transfer name, for example `dotnet-sdk-10.0.101-win-x64.zip`. The predecessor called `validateArchiveName(file.name)` before examining the URL, so it rejected the display label even though the URL identified the required versioned stable `win-x64` ZIP.

The minimal repair validates the official URL first, derives its final path segment, and applies the existing strict archive-name policy to that URL basename. It requires the basename to be exactly `dotnet-sdk-<selected sdk.version>-win-x64.zip`. It then permits only either the observed exact generic display name `dotnet-sdk-win-x64.zip` or an exact display name equal to the validated URL basename. Any other display name, URL basename, version mismatch, non-ZIP, non-`win-x64`, unsafe path, host, scheme, credential, or hash remains rejected. No generic filename, host, or hash check was weakened.

## Regression RED before the source fix

After adding the representative fixture but before changing the helper, this command was run in the isolated worktree:

```text
node --check .work\\scripts\\test-dotnet10-sdk-acquire.cjs
node .work\\scripts\\test-dotnet10-sdk-acquire.cjs
```

Result: **exit 1**, with the expected exact failure:

```text
FAIL: Error: unexpected SDK archive name: dotnet-sdk-win-x64.zip
    at validateArchiveName (...\\.work\\scripts\\dotnet10-sdk-acquire.cjs:101:5)
    at Object.selectLatestStableSdk (...\\.work\\scripts\\dotnet10-sdk-acquire.cjs:164:20)
    at testObservedOfficialDisplayName (...\\.work\\scripts\\test-dotnet10-sdk-acquire.cjs:38:27)
```

The new fixture is synthetic and representative only; its version/hash are not an official SDK claim and no archive is associated with it.

## Repair and GREEN checks

The repaired source and tests are:

- `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\scripts\dotnet10-sdk-acquire.cjs`
- `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\scripts\test-dotnet10-sdk-acquire.cjs`
- `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\scripts\fixtures\releases-10-display-name-fixture.json`

Final command sequence, run without network:

```text
node --check .work\\scripts\\dotnet10-sdk-acquire.cjs
node --check .work\\scripts\\test-dotnet10-sdk-acquire.cjs
node .work\\scripts\\test-dotnet10-sdk-acquire.cjs
git diff --check
```

Result: **exit 0**. Output:

```text
PASS: metadata selection
PASS: official display-name/URL filename normalization
PASS: HTTPS and official-host URL policy
PASS: SHA-256/SHA-512 digest validation
PASS: mismatched archive preserved without overwrite
PASS: acquisition-only/no-extraction/unexpected-write policy
PASS: no network call during fixture tests
RESULT: 7 checks passed; exit=0
```

The original six deterministic checks remain green; the seventh is the new display-name/URL regression. Both `node --check` commands and `git diff --check` also passed. The fixture test replaced `https.get` with a failing counter and reported zero network calls.

## Fixed source hashes

| File | Bytes | SHA-256 |
|---|---:|---|
| `...\\.work\\scripts\\dotnet10-sdk-acquire.cjs` | 18,913 | `2264F40F097B93E5A541B9FDB8403994CC6BDF5F46B5C4C431DB24AA455A8D5A` |
| `...\\.work\\scripts\\test-dotnet10-sdk-acquire.cjs` | 6,380 | `073DBF4D82AF28F0296E6D49530766F3DF44A2B8D560B3BB2D15B4E66D37DBDD` |
| `...\\.work\\scripts\\fixtures\\releases-10-fixture.json` (unchanged original) | 2,694 | `FDDD077435175C8453B60876F172A337D8CBA92E9F24E44C9087062F2634565E` |
| `...\\.work\\scripts\\fixtures\\releases-10-display-name-fixture.json` (new) | 642 | `DD6556BC1F171D741201ADB82EE59A8025BCAD052AFD2FC1BFD4EE4C33F6EF56` |

A machine-readable copy is at `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\sdk-acquisition-fix-01-manifest.json`.

## Exact parent permission-routing invocation

The parent must run this exact command only through the separately admitted explicit `network:true` route for the SDK download. It was not run by this worker:

```text
node "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\scripts\dotnet10-sdk-acquire.cjs" --worktree "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB" --download-sdk
```

Capture stdout, stderr, and the numeric exit code. A successful parent acquisition exit would create an acquisition-local runtime manifest and prove only dependency acquisition; it would not prove SDK installation, restore, build, model readiness, offline inference, or any B0/product criterion.

## Original SDK-install resumption packet

> You are a **distinct follow-on SDK-install implementer**, not the acquisition worker, coordinator, or verifier. Work only in `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB` at detached baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`. Read `contract-version-v2.md`, `plan-v2.md`, `handoff-v2.md`, `evidence\sdk-acquisition-preparation.md`, `evidence\sdk-acquisition-manifest.json`, and the parent-generated runtime manifest under `.work\acquisition` first. Require a successful parent acquisition exit and a matching official SHA-512 before acting; stop if the runtime manifest is absent, incomplete, mismatched, or nonzero. Do not re-download, use a mirror/proxy/VPN/TLS override, read credentials, or change system/environment settings. In a separately admitted local setup stage, extract/install only the verified official .NET 10 Windows x64 SDK under `.work\tools\dotnet`; do not change global PATH, install globally, touch product `src/`, restore/build/test product, open a microphone, fetch NuGet/models, commit, push, deploy, or claim C1–C8. Record exact extraction/install commands, exit codes, SDK path/version, and `dotnet --info`; leave a fresh independent verifier to repeat the gates.

The follow-on packet remains blocked until the parent has a successful acquisition runtime manifest with a matching authoritative SHA-512. This repair is not a toolchain or product PASS; a fresh independent verifier remains required for any eventual B0 candidate.
