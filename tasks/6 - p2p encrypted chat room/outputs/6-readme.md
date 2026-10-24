# Verified P2P Chat Room

A two-person, text-only chat application focused on reducing message-content leakage. A local server serves the interface and coordinates peer discovery and connection setup. Messages travel directly between browser peers over a native WebRTC data channel, rather than through a server-side chat relay.

This submission is a **working localhost demonstration**, not a production deployment or an independently audited security product.

## Setup

### Prerequisites

- **Node.js 22.x** and **npm**. Node.js 22 was used for development and testing.
- A modern Chromium-based browser, such as Chrome or Edge, with WebRTC support.
- Internet access for the initial npm dependency installation. The running demo does not require a third-party signaling, STUN, TURN, font or analytics service.

### Install and start

1. Extract the submitted project ZIP.
2. Open PowerShell or a terminal **in the extracted folder containing `package.json` and `server.mjs`**. The ZIP contains a top-level `local-verified-chat` folder; enter that folder if necessary.
3. Check your tools and install the locked dependencies:

   ```powershell
   node --version
   npm --version
   npm ci --ignore-scripts --no-audit --no-fund
   ```

4. Start the application:

   ```powershell
   npm start
   ```

   The terminal should print:

   ```text
   Local chat server listening on http://127.0.0.1:4176
   ```

5. Open **http://127.0.0.1:4176/** in two browser tabs. Do not open `index.html` directly as a file: the app requires its HTTP/WebSocket server.

The server binds to `127.0.0.1`, so it is not exposed to other machines. `http://localhost:4176/` is also accepted. Keep the server terminal open while using the app; press **Ctrl+C** in that terminal to stop it.

### If port 4176 is already occupied

Do not stop an unrelated service. Start this app on another port and open the matching URL:

```powershell
$env:PORT = '4177'
npm start
```

Then open **http://127.0.0.1:4177/**. To return to the default port in PowerShell:

```powershell
Remove-Item Env:PORT -ErrorAction SilentlyContinue
```

There is no account registration, API key, database configuration, build step or global npm package installation.

## Two-tab demonstration

1. **Create:** In tab A, enter `Alice` in the create form and select **Create room**.
2. **Join:** Copy or select the displayed room code. In tab B, enter `Bob` in the join form, enter the code and select **Join room**.
3. **Check the connection:** Both tabs should reach **Connected · unverified**. The composer remains locked.
4. **Compare the complete fingerprints:** Compare Alice's **Your fingerprint** to Bob's **Peer fingerprint**, and Bob's **Your fingerprint** to Alice's **Peer fingerprint**. Check the entire SHA-256 value, not a shortened prefix.
5. **Confirm:** Select **Confirm match** in each tab only after comparing the full values. One person's confirmation alone does not unlock chat. Once both confirm, the interface shows **Verified** and enables messaging.
6. **Exchange messages:** Send a message from Alice and reply from Bob. HTML-like text is displayed literally rather than interpreted as HTML.
7. **End:** Select **Leave room**. Both sessions end and the app-owned transcript is cleared. Reloading does not restore it. A new room generates fresh certificate material and requires new verification.
8. **Reject a mismatch:** In a fresh, unverified room, select **Mismatch — end session** to reject the session. Wait for both fingerprints to become available before using the verification actions.

Names are temporary display labels, **not authenticated accounts**. Each tab holds its own identity and session state in memory; no shared login cookie is used. For participants on different devices, fingerprint comparison must use an independently trusted channel. The same-device comparison is a practical demonstration of that verification step, not proof of someone's real-world identity.

## Architecture

```text
Browser tab A                         Browser tab B
Temporary identity                    Temporary identity
Fresh session certificate             Fresh session certificate
       |                                      |
       +--- Local HTTP/WebSocket server ------+
            Static app files, room admission,
            SDP offer/answer signaling only

       <====== WebRTC RTCDataChannel ======>
               Native DTLS encryption
               Ordered, reliable messages
```

The server is involved in connection setup, but it does not implement an application-message forwarding route. The chat is not simulated with a cosmetic encryption badge: the two tabs establish a real WebRTC peer connection and data channel.

### Technology and structure

- **Server:** Node.js HTTP and the `ws` package; ephemeral two-person rooms held in memory.
- **Client:** HTML, CSS and browser ES modules; no frontend build pipeline or third-party UI assets.
- **Transport security:** Browser-native WebRTC/DTLS, with a fresh explicitly generated ECDSA P-256 certificate for each session.
- **Verification:** Full SHA-256 certificate fingerprints bound to the installed local and remote connection descriptions.
- **Tests:** Node's built-in `node:test` runner.

```text
local-verified-chat/
├── package.json
├── package-lock.json
├── server.mjs              # HTTP, room admission and signaling
├── public/
│   ├── index.html          # Entry, verification and chat interface
│   ├── styles.css
│   ├── main.js             # UI/controller integration
│   ├── session.js          # WebRTC, verification gates and teardown
│   ├── protocol.js         # Strict SDP and data-frame validation
│   └── transcript.js       # Bounded visible transcript retention
└── test/                   # Protocol, session, server and transcript tests
```

## Security design and leakage boundaries

### Endpoints and session keys

Each room uses fresh certificate material. Certificates, verification flags and chat state are not intentionally persisted in browser storage. Ending or replacing a session closes its transports and clears app-owned state. New rooms require new fingerprint checks; there is no automatic reconnection that silently carries trust forward.

The browser generates and uses the transport keys. The application does not invent an encryption algorithm or implement a home-made key-exchange protocol. It also does not implement a long-lived identity system, group-key protocol or application-level double ratchet.

### In transit and through the intermediary

Native DTLS protects the peer data channel's content and integrity. Mutual out-of-band fingerprint comparison authenticates the peer session key and helps detect substitution by a signaling intermediary, **provided that the browser and delivered client code are trusted**. HTTPS/WSS alone would not establish this peer identity.

The signaling server accepts only the defined room/control and offer/answer flow, rejects application-chat frames, validates frame schemas and connection descriptions, and requires a permitted localhost origin. It applies room/socket limits, role and ordering checks, rate protection and session expiration. Static files are served with no-store/security headers and path-containment checks.

Signaling is **not metadata-free**: the intermediary sees temporary names, room membership, connection descriptions, fingerprints, negotiation addresses and relationship timing. Transport observers may infer timing and message sizes even when content is encrypted.

### Sender and receiver data handling

Messages are rendered with `textContent` and DOM nodes, not injected as HTML. The app has no intentional transcript database, localStorage/IndexedDB history, chat-body logging, analytics or message notifications. Both the controller and visible transcript have retention limits. Accepted chat messages require both verification flags and an open channel; malformed frames, invalid sequences and unsafe session conditions are rejected rather than falling back to plaintext.

| Protection | Limit / behavior |
| --- | --- |
| Participants | Two per room; a third participant is rejected |
| Chat text | 4,096 UTF-8 bytes per message |
| Data-channel frame | 32 KiB |
| Visible history | At most 200 messages and 512 KiB of message content |
| Outgoing backpressure | 256 KiB buffered-amount threshold |
| Channel rate protection | 10 frames per second |
| Replay/order checks | Sequential application message numbers |
| Inactivity | Verified session ends after 15 minutes without accepted chat |
| Absolute lifetime | 60 minutes |

### Risks that remain

The operating system, browser, extensions, delivered client code and intended recipient are trusted. A compromised endpoint or malicious recipient can read or copy plaintext. Developer tools, screenshots, clipboard contents, swap and crash dumps may retain sensitive data. Clearing app-owned memory is **not secure erasure**, and no intentional persistence is not a guarantee that the device stores nothing.

Local HTTP/WS is a loopback demo choice, not a remote hosting recommendation. Remote deployment would need HTTPS/WSS, a tested connectivity setup, stronger operational controls and further security review. No STUN/TURN service is configured, so reliable Internet connectivity is not claimed. This app is not anonymous or “absolutely secure.”

## Inspect the signaling boundary

With the server running, visit:

```text
http://127.0.0.1:4176/api/privacy
```

This endpoint exposes aggregate fields such as active-room/connection counts, forwarded-signal count, rejected-frame count, `applicationMessagesForwarded: 0` and `payloadsStored: false`. It does not expose names, room identifiers, fingerprints, connection descriptions or message bodies.

A diagnostic counter is not proof by itself. Server tests also exercise the actual routing policy and rejection of chat frames. This submission does not include an independent packet capture or comprehensive leakage audit.

## Tests and validation

From the project folder:

```powershell
npm test
npm run check
node --check public/transcript.js
```

The final development run passed **24 tests, with zero failures or skips**, and all listed syntax checks passed. Coverage includes strict SDP/data-frame validation, UTF-8 limits, native description handling, certificate reuse/binding, asynchronous setup ordering, mutual verification gates, stale callbacks, sequence checks, teardown, transcript eviction and actual HTTP/WebSocket server behavior.

A real two-tab Chromium demonstration exercised automatic pairing, full directional fingerprint equality, one-sided confirmation remaining locked, messages in both directions, literal rendering of HTML-like text, leave/reload cleanup, fresh session keys and mismatch rejection.

An independent reviewer performed source/client-unit checks, but could not complete browser/server runtime acceptance in its restricted execution context. The successful full-suite and browser measurements above were performed in the development coordinator's environment. **Independent runtime acceptance and a formal security audit remain incomplete.**

## Troubleshooting

- **`node` or `npm` is not recognized:** Install Node.js 22 with npm, then reopen the terminal.
- **`EADDRINUSE`:** Port 4176 is occupied; use the alternative-port setup above.
- **Missing `ws`:** Run `npm ci` from the folder containing `package.json` and `package-lock.json`.
- **Chat stays locked:** Wait for connection negotiation and both full fingerprints, compare them, and confirm in both tabs.
- **Room unavailable or full:** Create a fresh room and share its new code. A room admits only two participants and ends on leave/disconnect or expiration.
- **`EACCES` / loopback test connection failures:** The execution environment may be blocking local HTTP/WebSocket connections. Check its permissions; do not treat a blocked test as a pass or bypass network policy.
- **Certificate generation unsupported:** Use a modern Chromium browser; the app has no insecure cryptographic fallback.

## Scope and future work

The implemented scope is synchronous, two-person localhost text chat. Real accounts, group messaging, offline delivery, durable history, attachments, Internet relay infrastructure and production deployment are intentionally out of scope. They would require separate privacy and key-management decisions rather than simply extending this demo's security claims.
