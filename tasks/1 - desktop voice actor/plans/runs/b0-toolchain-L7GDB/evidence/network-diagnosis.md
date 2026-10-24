# B0 Toolchain Network Root-Cause Diagnosis

- **Work item:** `b0-toolchain-L7GDB`
- **Diagnosis role:** Same-role successor to the B0 toolchain feature owner; lightweight root-cause diagnosis only
- **Diagnosis status:** **BLOCKED — root cause isolated; no changed condition was applied**
- **Diagnosis timestamp:** 2026-10-24T16:17:19+08:00 (device); request evidence timestamps are also retained in UTC below
- **Assigned worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\.work\worktrees\voice-b0-toolchain-L7GDB`
- **Baseline:** `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` (detached; unchanged)
- **Prior report:** [`implementation-report.md`](implementation-report.md)
- **Prior provenance:** [`provenance.md`](provenance.md)

## Scope and safety

This was limited to two hypotheses and bounded connectivity diagnostics. No SDK archive, installer, package, probe, build, publish, microphone, Azure request, credential read, proxy/VPN change, TLS downgrade, privilege escalation, browser login, or heavy retry was attempted. The worktree remained baseline-only; no task-owned process was left running. The prior worker's resource admission was **GO**, so CPU/memory pressure is not the explanation for the failed download.

The systematic-debugging procedure was read from the task's migrated local copy at `C:\Users\wongn\Documents\Interview\Manus\.work\claude-skill-migration\candidates\manus-systematic-debugging\SKILL.md`, including the requirement to reproduce, inspect boundaries, state one hypothesis at a time, and test minimally.

## Existing failure

The latest distinct implementer report records the only attempted SDK route:

```text
Invoke-WebRequest -UseBasicParsing -Uri 'https://dot.net/v1/dotnet-install.ps1' -OutFile $installer
Invoke-WebRequest : Unable to connect to the remote server
```

That report correctly records that the failure occurred before installer hashing, SDK installation, or `dotnet --info`; no `dotnet.exe` or probe was created. It did not distinguish DNS, TCP policy, TLS, redirect, or HTTP status.

## Runtime capability inspection

The active Windows PowerShell 5.1 device terminal exposed:

```text
MANUS_TERMINAL_NETWORK_DISABLED=1
PowerShell 5.1.26100.9444
curl.exe 8.21.0.0
```

The exposed terminal-call contract in this session has no `network`/`network:true` request field. MCP discovery found only `manus-tools` media-generation tools; no device terminal-network or browser route was exposed. I did not unset or override `MANUS_TERMINAL_NETWORK_DISABLED`, and did not invent an unsupported flag. The runtime permission mode alone was not treated as proof of outbound network access.

## Bounded device tests

At 2026-10-24T08:16:58.1358092Z, using the actual device PowerShell terminal, I ran only HEAD and a 0–2047-byte range/metadata request against the frozen official installer URL and a direct official Microsoft .NET release-metadata URL. Both used curl's default TLS behavior, `--location`, `--max-time 10`, and `--connect-timeout 5`; no payload was retained.

### Hypothesis 1 — the terminal's outbound socket path is policy-disabled

**Prediction:** DNS can resolve, but TCP/443 is rejected before TLS/HTTP, with the same result for independent official hosts.

**Observed:**

```text
MANUS_TERMINAL_NETWORK_DISABLED=1

HEAD https://dot.net/v1/dotnet-install.ps1
* Host dot.net:443 was resolved.
* IPv4: 20.112.250.133, 20.236.44.162, 20.231.239.246, 20.70.246.20, 20.76.201.171
* Trying 20.112.250.133:443...
* connect ... failed: Bad access
... (all resolved IPv4 addresses failed the same way)
* Failed to connect to dot.net:443 ... Could not connect to server
curl: (7) Failed to connect ...
curl_exit=7

RANGE_METADATA https://dot.net/v1/dotnet-install.ps1
* Host dot.net:443 was resolved.
* connect ... failed: Bad access
curl: (7) Failed to connect ...
curl_exit=7

HEAD https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json
* Host dotnetcli.blob.core.windows.net:443 was resolved.
* IPv4: 20.60.81.165
* Trying 20.60.81.165:443...
* connect ... failed: Bad access
* Failed to connect to dotnetcli.blob.core.windows.net:443 ... Could not connect to server
curl: (7) Failed to connect ...
curl_exit=7

RANGE_METADATA https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json
* Host dotnetcli.blob.core.windows.net:443 was resolved.
* connect ... failed: Bad access
curl: (7) Failed to connect ...
curl_exit=7
```

A corrected follow-up at 2026-10-24T08:17:09.8258439Z independently showed:

```text
Resolve-DnsName dot.net -> five A records
Test-NetConnection dot.net:443 -> TcpTestSucceeded: False
Resolve-DnsName dotnetcli.blob.core.windows.net -> CNAME + 20.60.81.165
Test-NetConnection dotnetcli.blob.core.windows.net:443 -> TcpTestSucceeded: False
```

**Result:** Hypothesis 1 is supported. Name resolution works; outbound TCP is blocked at the device-terminal boundary. The identical `Bad access`/curl 7 result on the direct Microsoft metadata host rules out the dot.net redirect as the unique failure point. No TLS handshake, certificate exchange, HTTP response, or redirect was reached, so this evidence must not be described as a TLS or server-status failure.

### Hypothesis 2 — dot.net's redirect or TLS endpoint is uniquely broken

**Prediction:** A direct Microsoft SDK metadata host should at least reach TCP/TLS if the terminal route is usable.

**Observed:** The direct `dotnetcli.blob.core.windows.net` HTTPS route failed before TLS with the same `Bad access`, curl exit 7, and `TcpTestSucceeded: False` result. No HTTP status or redirect was available from either route.

**Result:** Hypothesis 2 is not supported. An official alternate route was tested, but it could not bypass the terminal policy. The evidence does not warrant changing installer URLs, disabling certificate checks, using a proxy/VPN, or substituting an unofficial mirror.

## Root cause

The B0 SDK download is blocked by the active device-terminal network capability/policy, not by CPU/memory pressure, DNS, the dot.net redirect, or an observed TLS certificate error. The decisive evidence is the runtime flag `MANUS_TERMINAL_NETWORK_DISABLED=1`, successful DNS resolution, and immediate `Bad access` at TCP connect for both the original dot.net installer host and the direct Microsoft SDK metadata host. The prior generic PowerShell message (`Unable to connect to the remote server`) is therefore explained at a lower network layer.

This diagnosis does **not** install or verify an SDK, and all B0-C1 through B0-C7 remain blocked. No code-retry allowance was consumed.

## Smallest changed condition

The smallest authorized changed condition is to dispatch a **new distinct B0-T implementer** in a device terminal session with outbound network explicitly enabled by the platform/coordinator (request `network:true` when the current terminal API exposes that field). The implementer must first confirm that the network-disabled condition is gone and rerun a bounded HEAD/metadata check. This condition was **not applied in this session** because no such request field or alternate device-network tool is exposed, and overriding the environment or bypassing policy would be unsafe and unauthorized.

The direct official metadata route tested here remains a valid lightweight fallback for endpoint diagnosis:

`https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json`

It is not a replacement for the frozen installer/provenance requirements and was not downloaded successfully here.

## Resource release and next decision

No task-owned process remains. Do not dispatch verifier, B0-W, B0-S, or downstream product stages. A fresh admission is required for the next heavy SDK download/restore/build/publish attempt after outbound terminal network is enabled. See [`changed-condition-handoff.md`](changed-condition-handoff.md) for the exact distinct-implementer packet.
