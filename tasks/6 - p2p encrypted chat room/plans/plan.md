---
task_id: 6
status: draft
updated: 2026-10-24
---

# P2P encrypted chat room Implementation Plan

**Spec:** [Architecture](../architecture/architecture.md)

**Goal:** Demonstrate authenticated small-room peer messaging with explicit group encryption, membership changes, relay fallback and honest privacy limits.

**Architecture:** Out-of-band confirmed identities + authenticated signaling → ICE/WebRTC connectivity → protocol-defined group ciphertext → authorized decrypt/render.

**Proposed tech stack:** Repository-discovered browser framework/test runner, WebRTC [1] [2], signaling, ICE/STUN/TURN [3] [4], and a reviewed MLS implementation/browser binding [5]. The binding and providers are unverified feasibility gates.

> For implementation workers: use unchecked boxes, actual commands and current managed project/workflow routes. An owner freezes the threat model, a separate implementer writes code and a fresh `om-verifier` independently measures it. No service provisioning, cryptographic implementation, deployment or external account action is authorized by this draft.

## Global constraints

Title-only scope. Proposed 2–8 peers, text-only full mesh and ephemeral state require approval. Signaling does not receive application plaintext. No self-designed cryptographic fallback if the library gate fails. Transport encryption alone does not establish user-authenticated group E2EE. Document metadata exposure, client-delivery/XSS trust and best-effort browser-memory clearing; do not claim an audit or secure erasure.

## Review focus

1. Missing/unsafe browser group-security binding → `MLSBindingGate`, `ProtocolVectorCheck` in M1/M3.
2. Spoofed/unconfirmed identity → `IdentityNegativeTest` in M3.
3. Plaintext in signaling/relay/logs → `RelayPlaintextCheck` in M2/M5.
4. Direct/relay/NAT or reconnect failure → `ICETurnRecoveryCheck` in M2/M5.
5. Replay, stale epoch or retained departed session → `EpochReplayTest`, `SessionLeaveReconnectCheck` in M3/M4.

## Milestones

### M1 — Discover and approve threat/model dependencies

**Artifacts:** task-local `decisions.md`, `evidence/repository-inventory.md`, command inventory and threat-model/identity record.

**Consumes:** title-only architecture. **Produces:** approved room/browser scope, identity/key policy, available reviewed binding and observed commands.

- [ ] Obtain the detailed brief and inspect the actual browser repository, runtime/test scripts and service permissions.
- [ ] Define threat assumptions, OOB verification UX, membership/history guarantees, retention and budgets; do not confuse a display name with authenticated identity.
- [ ] Complete `MLSBindingGate`: identify supported browser bindings, test-vector support and review requirements. Stop if no acceptable implementation exists; do not invent crypto or silently downgrade the security claim.

### M2 — Authenticated signaling and connectivity

**Proposed files:** `src/signaling/*`, `src/transport/webrtc.*`, room/transport fixtures.

**Consumes:** authenticated session, SDP/ICE and opaque group-control envelopes. **Produces:** bounded negotiation state, channels or typed failure.

- [ ] Write failing cases for unauthenticated rooms, expired credentials, oversized/malformed envelopes and application plaintext sent into signaling.
- [ ] Implement the approved signaling boundary, ephemeral room state, WebRTC data channels, ICE and credentialed TURN fallback [1] [2] [3] [4].
- [ ] Run `RelayPlaintextCheck` and `ICETurnRecoveryCheck` using approved direct and relay fixtures. Record remaining metadata explicitly.

### M3 — Confirmed identities and group-security state

**Proposed files:** `src/security/identity.*`, `src/security/mls-adapter.*`, protocol-vector fixtures.

**Consumes:** local identity key, OOB confirmation and reviewed protocol state. **Produces:** verified membership, ciphertext/decrypt events and epoch/replay failures.

- [ ] Write failing checks for wrong fingerprints, unconfirmed peers, altered envelopes, stale/duplicate messages and unauthorized membership changes.
- [ ] Implement the smallest selected library adapter [5], binding confirmed identities to protocol credentials and applying authenticated membership updates.
- [ ] Run `IdentityNegativeTest`, `EpochReplayTest` and `ProtocolVectorCheck`. A confirmed member decrypts the fixture message; unauthorized/stale states are rejected under the approved protocol guarantees.

### M4 — Ephemeral room UI and lifecycle

**Proposed files:** `src/ui/room.*`, `src/session/lifecycle.*`, session/UI fixtures.

**Consumes:** verified group events and transport status. **Produces:** safe send/receive rendering, leave/rejoin and typed errors without persistent history.

- [ ] Write failing tests for stale UI events, leave/reconnect, invalidated group state, accidental disk/browser persistence and message-size overflow.
- [ ] Implement join/confirm/send/leave controls, safe text rendering, no transcript logging and best-effort in-memory clearing.
- [ ] Run `SessionLeaveReconnectCheck`; removed/stale local sessions cannot continue the approved flow, and reconnect rechecks authorization/membership.

### M5 — Independent verification and honest demo

**Artifacts:** task-local `evidence/` with protocol vectors, redacted logs and allowed captures; `how-to-try.md`; `verification/<run-id>/verify-report.md`.

- [ ] Freeze the change-defining confirmed-peer message flow and failing baseline observation. Retain invalid-identity, relay/logging, replay and cleanup checks as regression guards.
- [ ] Have a fresh verifier run scoped checks on exact builds and distinguish known-plaintext absence in inspected relay paths from a comprehensive security proof.
- [ ] Demo room creation, OOB fingerprint confirmation, messaging, direct→TURN recovery, membership change, stale-message rejection and leave/rejoin.
- [ ] Obtain the required security review before any production claim; report unsupported browsers, deployment/client trust and residual metadata.

## Acceptance and handoff

Confirmed members exchange expected fixture text; unconfirmed/wrong identities and stale/replayed envelopes are refused. The approved membership update rules hold. Direct and relayed connectivity both work in the documented environment. Inspected signaling/log paths contain no fixture application plaintext, while connection metadata remains disclosed. Leave/reconnect does not reuse invalid local session state.

Handoff includes the approved threat model, identity UX, reviewed binding, exact commands/builds, fixtures, service decisions, independent results and explicit “not production/audited” limitations. All checks are planned; no room, crypto test or service ran in this documentation pass.

Sources consulted 2026-10-24.

## References

[1]: https://www.w3.org/TR/webrtc/ "WebRTC: Real-Time Communication in Browsers"
[2]: https://www.rfc-editor.org/rfc/rfc8831 "WebRTC Data Channels"
[3]: https://www.rfc-editor.org/rfc/rfc8445 "Interactive Connectivity Establishment"
[4]: https://www.rfc-editor.org/rfc/rfc8656 "TURN: Relay Extensions to STUN"
[5]: https://www.rfc-editor.org/rfc/rfc9420 "The Messaging Layer Security Protocol"
