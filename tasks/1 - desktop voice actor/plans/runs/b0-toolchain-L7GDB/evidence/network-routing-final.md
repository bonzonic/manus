# B0 Toolchain Final Network Routing Assessment

- **Work item:** `b0-toolchain-L7GDB`
- **Assessment role:** Same-role successor / toolchain owner
- **Assessment timestamp:** 2026-10-24T16:32:xx+08:00 (device)
- **Status:** **BLOCKED — parent route is not usable for official acquisition**
- **Exact receipt:** `evidence/parent-network-head-check-20261024-1630/receipt.json`
- **Script result:** `owner_script_exit=1` (completed cleanly; no download, restore, build, test, or source change)

## Captured evidence

The receipt records `EnvironmentNetworkDisabled: 0`, so this parent route was not operating under the prior explicit network-disabled condition. Both frozen official endpoints were checked with curl HEAD-only bounds and returned exit code `35`:

- `https://dot.net/v1/dotnet-install.ps1`
- `https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json`

For both targets, the captured stderr resolves the host and lists an IPv4 address, begins a connection attempt, then reports:

```text
schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS (0x8009030e) - No credentials are available in the security package
curl: (35) schannel: AcquireCredentialsHandle failed (0x8009030e)
```

Both stdout files are empty. No HTTP status line, headers, redirect result, or response body was captured.

## Layer classification

The parent-route failure is a **local Windows Schannel/TLS credential-acquisition failure**. It is **not classified as network-disabled** because the receipt explicitly reports `EnvironmentNetworkDisabled: 0`. It is **not the prior observed TCP policy denial** (`Bad access`/curl 7); the new trace gets as far as Schannel credential setup after DNS resolution and a connection attempt. The evidence does not establish a successful TCP handshake independently, so no stronger TCP conclusion is made. TLS setup fails before an HTTP response. Consequently, **HTTP status and official source availability are unobserved**, not failed or unavailable.

The identical failure on the direct Microsoft blob metadata endpoint means this is not evidence of a unique `dot.net` redirect or source outage. It is also not evidence for changing proxy/VPN/TLS settings, bypassing certificate policy, using a mirror, or reading credentials. No such change was made.

## Capability and unblock status

The fixed parent route is **not usable** for the B0 acquisition stage. The required route must first provide working official HTTPS client capability on this exact device path, including Schannel credential acquisition. After that condition is supplied, the next stage is a fresh bounded HEAD/metadata check; heavy work requires a new admission.

A manual .NET 10 x64 SDK file alone would not complete B0. The minimum viable official route must also permit the exact locked NuGet local runtime graph (including `NAudio.Wasapi`, `org.k2fsa.sherpa.onnx`, and any resolved ONNX/native payload) and the official `sherpa-onnx-streaming-paraformer-bilingual-zh-en` model archive with revision, hashes, tokens, and license/notice evidence. No package or model acquisition was attempted or verified here. No user cloud billing or Azure action is needed.

## Process/resource note

The receipt shows the bounded script completed with `owner_script_exit=1`; no curl or dotnet process was observed afterward. A command-line ownership query for all PowerShell processes was denied by the device, so this report does not claim a blanket process inventory. There is no evidence of a task-owned curl/dotnet child remaining from the completed check, and the preserved prior diagnosis also records no task-owned process remaining.

## Exact resumption stage

1. Obtain a fresh exact-device terminal route whose Windows Schannel credential acquisition succeeds, without changing environment, proxy/VPN, TLS, registry, or policy settings.
2. Run the supplied bounded official HEAD/metadata check once on that route and retain a new receipt.
3. Only if that check reaches HTTP successfully, obtain fresh coordinator admission for the finite official-only SDK retrieval, exact NuGet restore, and official Paraformer model/archive preparation; then hand off to the distinct implementer for the v2 C1–C7 probe gates.

Until step 2 succeeds, remain **BLOCKED / NOT IMPLEMENTED / NOT VERIFIED** and do not dispatch retries, verifier, or downstream stages.
