# B0-T v2 SDK Acquisition Preparation

**Work item:** `b0-toolchain-L7GDB`  
**Stage reservation:** `sdk-acquisition-prep-01`  
**Prepared at:** 2026-10-24 16:40 (Asia/Singapore)  
**Status:** `PREPARED / NOT ACQUIRED / NOT INSTALLED / NOT VERIFIED`

## Scope and boundary

This packet prepares a reusable, Node built-in-only helper for the parent’s separately admitted dependency-transfer route. It does not download an SDK from this worker terminal, install or extract an SDK, restore NuGet packages, fetch models, build or test the product, open a microphone, call a provider, read credentials, change TLS/proxy/CA/system settings, or edit product source/canonical documents. No commit, push, deployment, or B0/product PASS is claimed.

The helper is confined to the assigned worktree:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`

Its only runtime write directory is the derived path:

`<worktree>\.work\acquisition`

The reserved worktree was confirmed detached and clean at baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` before preparation and remained at that baseline after local tests. Existing `.work\b0-probe` and `.work\tools` content was not modified.

## Prepared helper

Script:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\scripts\dotnet10-sdk-acquire.cjs`

The helper has no package dependencies and uses only Node built-ins (`fs`, `crypto`, `https`, `stream`, `url`, `path`). It uses the authoritative .NET 10 releases endpoint:

`https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json`

It selects the highest stable SDK version whose metadata identifies a `win-x64` ZIP, validates the metadata SHA-512, and rejects previews, non-Windows-x64 files, malformed hashes, and non-official URLs. No SDK version is hardcoded or guessed. The allowlist is explicit and limited to `dotnetcli.blob.core.windows.net` and `builds.dotnet.microsoft.com`; redirects must remain HTTPS and on an allowlisted host. Node’s normal certificate-chain and hostname validation is retained, with no custom CA, insecure TLS, proxy, credential, or environment override.

The download path is streamed through bounded Node streams while calculating SHA-512 and SHA-256 and byte count. Metadata is bounded to 16 MiB; SDK response is bounded to 2,000,000,000 bytes; redirects are bounded to five; each request has a bounded 30-minute timeout. A complete existing archive is reused only when its SHA-512 matches the newly selected official metadata. A mismatch is preserved and returns an error; it is never silently deleted or overwritten. New downloads use an acquisition-local temporary file and are promoted only after SHA-512 verification. The helper never extracts, installs, launches, restores, builds, tests, or writes outside acquisition.

The runtime manifest written by a successful parent invocation is acquisition-local and records the metadata requested/final URL and redirect chain, retrieval time, source JSON byte count and SHA-256, selected SDK version/release, SDK URL/final URL/redirects, expected SHA-512, observed SHA-512 and SHA-256, byte count, archive path, and whether a matching existing archive was reused.

## Exact parent permission-routing invocation

Run this command **only through the parent’s explicit `network:true` Node HTTPS permission route** and only after the parent admits the separate SDK download resource. Do not run it from the exact-device worker terminal:

```text
node "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\scripts\dotnet10-sdk-acquire.cjs" --worktree "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB" --download-sdk
```

The helper has no `--metadata-url` or output-directory override. This keeps the parent command argument-safe and ensures the authoritative endpoint and acquisition-only write fence cannot be redirected by an incidental argument. Capture the command’s stdout/stderr and exit code. A successful exit is acquisition evidence only; it is not SDK installation, restore, build, inference, or product verification.

## Deterministic local fixture checks

Fixture:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB\.work\scripts\fixtures\releases-10-fixture.json`

The fixture contains synthetic release metadata only; its versions and hashes are not an official SDK claim and no archive is associated with it.

Commands and exit codes:

```text
node --check .work\scripts\dotnet10-sdk-acquire.cjs                         # exit 0
node --check .work\scripts\test-dotnet10-sdk-acquire.cjs                    # exit 0
node .work\scripts\test-dotnet10-sdk-acquire.cjs                            # exit 0
```

Fixture result:

```text
PASS: metadata selection
PASS: HTTPS and official-host URL policy
PASS: SHA-256/SHA-512 digest validation
PASS: mismatched archive preserved without overwrite
PASS: acquisition-only/no-extraction/unexpected-write policy
PASS: no network call during fixture tests
RESULT: 6 checks passed; exit=0
```

The tests require the helper with `https.get` replaced by a failing counter and assert that no network call occurs. They cover stable latest-version selection from metadata, preview/non-ZIP exclusion, HTTPS/host/credential/port/path validation, digest shape and calculation, preservation of an existing mismatched archive, acquisition-only path fencing, and the explicit no-extraction/no-install/no-restore/build/test policy. No network, SDK, NuGet, model, or product command was run by these checks.

## Prepared-file hashes

SHA-256 values below were captured after the final successful fixture run:

| File | Bytes | SHA-256 |
|---|---:|---|
| `...\\.work\\scripts\\dotnet10-sdk-acquire.cjs` | 18,367 | `8B05A7DBA6F00A0DBC77F5B51978834144A31BB34F295997DF896F94028C7060` |
| `...\\.work\\scripts\\test-dotnet10-sdk-acquire.cjs` | 5,710 | `E9B92943896BF9889255164F741230BBF2F8B67A83C128082E952B6767AAFBE0` |
| `...\\.work\\scripts\\fixtures\\releases-10-fixture.json` | 2,694 | `FDDD077435175C8453B60876F172A337D8CBA92E9F24E44C9087062F2634565E` |

The source manifest for these files is [`sdk-acquisition-manifest.json`](sdk-acquisition-manifest.json). The exact official releases JSON SHA-256, selected SDK version, SDK URL, SDK SHA-512/SHA-256, byte count, and retrieval timestamp remain `PENDING_PARENT_RUN`; they must come from the helper’s acquisition-local runtime manifest and must not be fabricated here.

## Distinct-worker SDK-install resumption prompt

> You are a **distinct follow-on SDK-install implementer**, not the acquisition worker, coordinator, or verifier. Work only in `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB` at detached baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`. Read `contract-version-v2.md`, `plan-v2.md`, `handoff-v2.md`, `evidence\sdk-acquisition-preparation.md`, `evidence\sdk-acquisition-manifest.json`, and the parent-generated runtime manifest under `.work\acquisition` first. Require a successful parent acquisition exit and a matching official SHA-512 before acting; stop if the runtime manifest is absent, incomplete, mismatched, or nonzero. Do not re-download, use a mirror/proxy/VPN/TLS override, read credentials, or change system/environment settings. In a separately admitted local setup stage, extract/install only the verified official .NET 10 Windows x64 SDK under `.work\tools\dotnet`; do not change global PATH, install globally, touch product `src/`, restore/build/test product, open a microphone, fetch NuGet/models, commit, push, deploy, or claim C1–C8. Record exact extraction/install commands, exit codes, SDK path/version, and `dotnet --info`; leave a fresh independent verifier to repeat the gates.

## Remaining blockers and next boundary

The SDK archive has not been acquired in this worker stage, so no exact SDK version, official archive URL, source JSON digest, SDK SHA-512/SHA-256, byte count, or retrieval timestamp is yet evidence. Parent network/resource admission and execution are required. Package graph resolution, model archive/licensing evidence, SDK installation, restore/build/publish, native loading, and offline inference remain separate future stages. This preparation is not a B0/product PASS.
