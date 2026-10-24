# Alternate HTTPS Client Handoff

- **Work item:** `b0-toolchain-L7GDB`
- **Owner role:** same-role toolchain owner successor
- **Prepared:** `2026-10-24T16:35:10+08:00` device time
- **Status:** **VALID ALTERNATE CLIENT WRITTEN; ROUTE UNVERIFIED / BLOCKED PENDING PARENT RECEIPT**
- **Changed condition (one only):** use the already-installed Node runtime's built-in `node:https` client instead of Windows `curl`/Schannel. This is an ordinary verified HTTPS path that does not require the failed Schannel credential-acquisition step. It retains Node's normal certificate-chain and hostname validation defaults.

## Why this option is permitted

The frozen v2 contract permits only a disposable, bounded official-endpoint capability check; it does not authorize SDK/package/model acquisition in this owner stage. This option changes only the HTTPS client implementation. It does **not** change the endpoint, TLS policy, trust store, proxy/VPN/environment/registry/policy, or credentials. The script supplies no credentials, reads no credentials, sets no `NODE_TLS_REJECT_UNAUTHORIZED`, supplies no custom CA, and uses no insecure TLS flag. No module or npm installation is needed.

The script sends only `HEAD` requests to these exact official targets:

- `https://dot.net/v1/dotnet-install.ps1`
- `https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json`

Redirects are followed only when they remain HTTPS and resolve to an allowlisted official Microsoft host (`dot.net`, `dotnetcli.blob.core.windows.net`, `builds.dotnet.microsoft.com`, or `download.visualstudio.microsoft.com`). Response bodies are not read, buffered, or saved. Each exact target has a maximum total bound of 10 seconds, with at most five redirects. Checks run sequentially for unambiguous per-target evidence.

## Artifact and parent-only invocation

Script artifact:

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\parent-network-node-head-check.js`

Run **only by the parent through its explicitly network-enabled permission route** (not from this worker terminal):

```powershell
node "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\parent-network-node-head-check.js" --receipt "C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\parent-network-node-head-check-20261024-1635\receipt.json"
```

Expected receipt path (not yet created by this owner):

`C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\runs\b0-toolchain-L7GDB\evidence\parent-network-node-head-check-20261024-1635\receipt.json`

The receipt records the Node version/platform, the `node:https` client, timestamps, bounded results, status/selected headers, redirect chain, and error code/message where applicable. It is diagnostic only. It does not authorize acquisition, restore, build, publish, model preparation, credentials, product changes, or downstream stages.

## Current evidence interpretation

The prior curl receipt remains a Schannel `SEC_E_NO_CREDENTIALS` / exit 35 failure with `EnvironmentNetworkDisabled: 0`. This handoff does not reinterpret that result and does not claim that Node succeeds. No network request was executed by this worker. Do not claim route usability, HTTP reachability, official-source availability, or B0 progress until the parent returns and this owner interprets the new receipt.

If the parent-only Node check returns usable HTTP results for both targets, the parent must still obtain fresh coordinator admission before any finite official SDK retrieval, exact locked NuGet graph acquisition/restore, or official Paraformer model/archive preparation. A successful HEAD/metadata check alone is not a toolchain or model pass.

## Fallback user action if the alternate route is unavailable

Provide a permitted exact-device route on which the built-in Node HTTPS check reaches both official endpoints, without changing Schannel/TLS/proxy/VPN/registry/policy settings. If no such route can be provided, supply a complete official acquisition bundle—not just a manual SDK file—consisting of the .NET 10 x64 SDK archive, the exact locked NuGet graph (`NAudio.Wasapi`, `org.k2fsa.sherpa.onnx`, and any resolved ONNX/native payload), and the official `sherpa-onnx-streaming-paraformer-bilingual-zh-en` model archive with revision, tokens, SHA-256, and license/notice evidence. No mirror, unofficial redirect, TLS bypass, credential, or user cloud/Azure action is an acceptable substitute.
