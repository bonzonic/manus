# Snake MVP owner review — v1 failure / retry 1

## Frozen decision

Classic grid-based two-player Snake remains the selected product direction: apples grow snakes; mushrooms provide a non-stacking 1.5× four-active-second speed boost. The finite 40×24 authoritative room, atomic collision rules, complete guest/lobby/start/play/finish/rematch lifecycle, bounded reconnect/security, and S1–S10 acceptance criteria remain frozen in `plan.md` and `wire-contract.md`. This note does not change or waive any criterion.

## Disposition

**CODE FAIL — retry 1 required; not shipped, not deployed, not PASS.**

This note records the independent verifier’s verdict and does not edit the verifier-owned report. The single allowed product-code repair handoff is [owner-repair-handoff.md](owner-repair-handoff.md).

## Revision and evidence

- Baseline: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`.
- Candidate reviewed: `eebdb1d9408a2002c5971d7c8b4f15ba1f558bed`.
- Candidate worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-candidate-20261024-kEUETV\project`.
- Independent report: `plans/verification/2026-10-24-snake-candidate-v1-kEUETV/verify-report-final-v1.md`.
- Failure note: `plans/verification/2026-10-24-snake-candidate-v1-kEUETV/review-fail.md`.
- Integration receipt: `integration/report.md`.

The verifier reported all eight pure fixtures passing, both fresh browsers navigating, the frozen 47-element DOM check passing, and real CREATE hello/WebSocket routing succeeding. The product returned `welcome.roomCode=SWOEW5S`, length 7, while frozen S1/wire requires exactly 8 uppercase alphanumeric characters. The driver used the frozen eight-character predicate; there were zero page errors and zero failed requests. This is a reproducible product contract failure, not a selector, click, connection, or latency-driver fault.

## Owner boundary

This owner stage wrote no product code, installed no dependencies, ran no build/test/browser/service/network runtime, selected no host, and made no deployment or public-delivery claim. The older Treasure Sprint architecture/plan remains untouched as superseded history. The v1 candidate and verifier records are preserved; no grade override or honest-test deletion is allowed.

## Exact repair scope

The distinct implementer may touch only the files and tests mapped in [owner-repair-handoff.md](owner-repair-handoff.md):

1. Guarantee default eight-character uppercase alphanumeric room codes with collision retry.
2. Enforce configured Origin during WebSocket admission and preserve rejected-Origin evidence.
3. Throttle full snapshots to `<=15/sec/room` while retaining the 60 Hz authoritative tick and output bounds.
4. Consume `?room=` invite links on cold startup without credentials in URL/query/logs.
5. Complete bounded same-seat credential/epoch resume, old-socket revocation, two-interruption/grace enforcement, pause/resume countdown, and lobby/result expiry.
6. Render authoritative player labels, connection/ready state, and boost remaining duration with pause freeze.

Each behavior requires a real RED assertion before the minimum fix and a changed-file scoped GREEN rerun. No criterion, wire enum, verifier selector, or retry rule may be weakened.

## Unverified and blocked items

The verifier stopped at create-room. P2 join, shared lobby/countdown, live gameplay, apple/boost cases, result/rematch, reconnect, narrow viewport, offline stages, and the full S10 independent browser demonstration remain unverified—not waived. Local HTTP/WS cannot establish frozen S10; no public HTTPS/WSS route or deployment was authorized or supplied.

F1 runtime Origin enforcement was absent. F2 full snapshots were measured at about 38.91/sec (465 P1 snapshots over 1,902–13,852 ms), above the frozen bound. F3 invite query was generated but not consumed. F4 resume/interruption cap and lifecycle expiry were incomplete. F5 authoritative player status and boost HUD were not driven from complete authoritative state.

The v1 trace contains one in-process server-stopped event but no OS PID/process-group receipts or post-close exit proof for the Playwright-launched Chrome family. Parent-observed Node IDs `52788` and `53440` have unconfirmed ownership. They must not be killed by name or assumed task-owned; future parent-side runs must record exact task-owned startup and cleanup receipts.

## Retry accounting and next action

This is **code retry 1** because the independent failure requires product-code changes. The parent/coordinator must create a fresh repair worktree from the exact failed SHA, dispatch a distinct implementer with the handoff, admit only the scoped commands, create an immutable v2 candidate, and then dispatch a fresh independent verifier with a separate evidence path. A second independent code failure is terminal under the frozen one-retry rule. Evidence-only or public-route gaps must be corrected and recorded; they do not become a PASS.

Optional unlimited-space and other backlog items remain unshipped. No review, merge, push, deploy, or production action is authorized by this owner note.
