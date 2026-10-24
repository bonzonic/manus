---
task_id: 6
status: draft
updated: 2026-10-24
---

# P2P encrypted chat room — Architecture

[Implementation plan](../plans/plan.md)

## Brief and proposed scope

Only the title is confirmed. Peer count, identity, topology, key exchange, browser support and retention are not selected.

A proposed text-only slice supports 2–8 browser peers in a full mesh, authenticated signaling, WebRTC data channels and an established application-layer group-encryption implementation. WebRTC is the browser connectivity surface [1]; data channels use SCTP over DTLS [2]. ICE finds connectivity candidates [3], with STUN and credentialed TURN relay fallback where direct paths fail [4]. Peer-to-peer does not mean “no signaling or relay infrastructure.”

MLS is a proposed group-security basis [5], **not a verified browser dependency**. The chosen implementation, browser binding and security review are feasibility gates. Do not invent a custom cryptographic protocol if that gate fails. Public discovery, attachments/media, offline history, account sync, large rooms and metadata hiding are out of scope.

## Components and data flow

```text
Join + out-of-band identity confirmation → Verified peer membership
                 ↕                                  ↕
Authenticated signaling: SDP / ICE / opaque group-control envelopes
                 ↓                                  ↓
          ICE / STUN / TURN → WebRTC data channels → Group ciphertext
                                                        ↓
                                              Verified decrypt → UI
```

**Session UI** consumes peer states and decrypted message events. It produces join, confirm, send and leave actions. The proposed UI never stores message history persistently.

**Signaling boundary** consumes authenticated ephemeral room requests, SDP, ICE candidates and opaque group-control envelopes. It produces routed negotiation/membership events. It must never receive application plaintext. Signaling authorization and room expiry remain server responsibilities.

**Connectivity adapter** consumes SDP/ICE data and short-lived TURN credentials. It produces an ordered/reliable channel or typed timeout/failure. Both direct and relayed paths need evidence.

**Identity/confirmation layer** consumes a local key and an out-of-band fingerprint comparison. It produces a verified peer set or rejection. Display names and membership claims from the signaling server are not proof of identity. A confirmed peer key must be bound to the credential used by the selected group-security implementation.

**Group-security adapter** consumes verified membership, protocol-defined proposals/commits/epochs and plaintext send requests. It produces ciphertext, decrypted events for authorized members, and stale/replay/validation failures. Membership changes must follow the selected protocol's authenticated update rules [5], not an ad hoc “change the room password” design.

**Ephemeral state** consumes negotiation/session data and produces bounded in-memory state with expiry. Avoid transcript logging on both client and service.

## Choice and threat boundaries

Small-room full mesh is chosen over a plaintext central relay. TLS/DTLS alone is not a complete user-authenticated group E2EE design: the application must establish identities, authorized membership and key evolution.

Signaling/TURN can observe connection metadata. A malicious or compromised client, browser, extension or XSS can expose plaintext/keys. A server serving modified client code can undermine an otherwise correct protocol; document the client-delivery trust assumption. Browser-memory clearing is best effort, not guaranteed secure erasure. This draft is not a security audit.

## Failure and implementation gates

Unconfirmed identities, stale epochs, replayed envelopes, malformed signaling, expired credentials and membership inconsistencies fail closed. Reconnect requires fresh checks; leaving invalidates the local session, and surviving peers apply the protocol's membership update. The precise history-access and post-removal guarantees depend on the approved threat model and implementation.

Before implementation, approve identity/OOB UX, room authorization, key distribution, library/browser support, membership rules, TURN operations, message budgets, retention and independent security-review scope. No room, service or cryptographic test has been run.

Sources consulted 2026-10-24.

## References

[1]: https://www.w3.org/TR/webrtc/ "WebRTC: Real-Time Communication in Browsers"
[2]: https://www.rfc-editor.org/rfc/rfc8831 "WebRTC Data Channels"
[3]: https://www.rfc-editor.org/rfc/rfc8445 "Interactive Connectivity Establishment"
[4]: https://www.rfc-editor.org/rfc/rfc8656 "TURN: Relay Extensions to STUN"
[5]: https://www.rfc-editor.org/rfc/rfc9420 "The Messaging Layer Security Protocol"
