---
work_item: 2026-10-24-snake-mvp-kEUETV
stage: remedial application implementation
route: B — standalone browser client plus Node.js + ws server
status: ready for distinct implementer dispatch
historical_gap: invalid RED; do not retroactively call the old lane TDD-complete
---

# Remedial application implementation handoff

## 1. Why this recovery is required

The historical application lane is not valid TDD evidence. Its first supposed RED ran while `server/game/rules.js` was absent and failed with `ERR_MODULE_NOT_FOUND`; that is a discovery/setup failure, not a behavior assertion. The later focused passes (13 tests reported across the lane) do not repair that gap. Do not describe the historical lane as test-first, do not use its production bytes as a reference, and do not copy them into the candidate.

The current TDD rule is explicit: premature production code must be deleted and started again. This handoff is therefore for one **distinct application implementer**, not the prior author, owner, static author, integrator, or verifier.

The static lane remains a separate, completed generated-only presentation lane. Its four files and narrow non-executable exception are preserved; this recovery must not edit or re-test that lane as application behavior.

## 2. Parent admission and provenance

The parent/coordinator must prepare this fresh worktree through the authorized Git metadata flow before dispatching the implementer:

```text
C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-backend-recovery-20261024-kEUETV\project
```

It must start from baseline `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`. Do not derive it from the historical application worktree, do not copy any historical production source, do not alter the shared checkout, and do not change global Git configuration. Preserve these existing worktrees and records:

- Historical application evidence (leave intact): `...\\.work\\worktrees\\snake-mvp-backend-20261024-kEUETV\\project`
- Static presentation lane (leave intact): `...\\.work\\worktrees\\snake-mvp-ui-20261024-kEUETV\\project`
- Later candidate integration (do not write in this stage): `...\\.work\\worktrees\\snake-mvp-candidate-20261024-kEUETV\\project`

The parent has already resolved `ws@8.18.3` using the authorized exact npm install and a `package-lock.json` now exists. That dependency receipt was not a test run. If the fresh worktree has no usable `node_modules`, the admitted implementer may perform the one dependency setup under the parent’s heavy reservation with `npm ci --ignore-scripts --no-audit --no-fund`; a missing dependency is a setup blocker, never RED.

## 3. Exact file boundary

### 3.1 Retain as non-behavioral setup/scaffolding only

The parent may transplant these exact paths into the fresh recovery worktree, without broad copying:

```text
package.json
package-lock.json
.gitignore
render.yaml                         # proposed packaging config only; no deployment claim

test/rules/core.test.js
test/rules/protocol-fixtures.test.js
test/rooms/lifecycle.test.js
test/transport/server.test.js
test/client/model.test.js
test/security/validation.test.js
test/fixtures/room-fixture.json
shared/fixtures/snake-fixtures.json
```

These tests/fixtures are scaffolding, not historical proof. The distinct implementer must audit them against `plan.md` and `wire-contract.md`, rewrite or replace any assertion that is not independently derived, and re-establish a valid RED for each behavior. No old test pass may be cited as recovery evidence. The retained package metadata is a configuration/dependency exception only; do not add a framework, bundler, database, Redis, physics engine, or second runtime dependency.

### 3.2 Recreate from an empty path, never copy historical bytes

The following paths are the application behavior and must be deleted from the historical lane’s consideration and freshly authored in the recovery worktree, with each behavior driven by a new valid RED cycle:

```text
server/index.js
server/authoritative-server.js
server/protocol/validate.js
server/game/arena.js
server/game/rules.js
server/rooms/room-manager.js
server/rooms/lifecycle.js
shared/protocol.json
shared/constants.js
public/app.js
public/client-model.js
public/protocol-client.js
public/board-renderer.js
public/dom-renderer.js
public/README-behavior.md
```

These historical non-source artifacts are also not to be carried as implementation references; recreate them only after behavior is green and only from the frozen plan/contract:

```text
README.md
docs/implementation.md
docs/render.md
```

`BLOCKED.md` from the historical lane is evidence of its old dependency state, not recovery scaffolding; do not copy it. `public/index.html`, `public/styles.css`, `public/assets/shapes.svg`, and `public/manifest.webmanifest` remain static-lane-owned and must not be created, edited, or copied by this implementer. `public/manifest-bridge.js` is optional and may be added only if a new tested application seam genuinely needs it.

## 4. Valid RED reset procedure

For every behavior, follow this order and record the command, exit status, and assertion message:

1. Write the smallest focused test first. It must name the observable behavior, use literal/hand-derived expected values, and exercise the real boundary.
2. If the target import/path does not yet exist, create only an importable zero-behavior scaffold **after the test file is saved**. The scaffold may expose the required names and neutral values solely so the test runs; it must contain no old implementation logic, no copied bytes, and no behavior intended to satisfy the test. This is a path scaffold, not a reference implementation.
3. Run the exact focused command. A valid RED is a test that is discovered and executes its assertion, then fails because the requested behavior is absent (normally an `AssertionError`). `ERR_MODULE_NOT_FOUND`, `MODULE_NOT_FOUND`, missing `ws`, syntax errors, malformed fixtures, test discovery/setup failures, and environment failures are invalid REDs. Stop and fix the test/scaffold/setup, then rerun.
4. Implement the minimum behavior in the fresh source path. Run the same focused command and record GREEN.
5. Run the changed scope command, then proceed to the next smallest behavior. Do not use the historical app source as a guide.

The application lane must use only its scoped commands during this stage. Do not run `npm test` / `node --test test` as a full-repository shortcut; the frozen parallel handoff reserves that check for later candidate integration/verifier handling. Report the full-suite check as intentionally unrun at this stage rather than claiming complete suite evidence.

## 5. Required RED → GREEN cycles

The following is the smallest complete Route B functional slice. Each named test must be written or materially reset before its production behavior is authored. A cycle may use one file with several tightly related assertions only when every assertion has an explicit missing behavior and the RED output is captured.

### Cycle A — protocol, arena, and round state

- Test first: `test/rules/recovery-round.test.js` (new), then `test/rules/recovery-arena.test.js` (new).
- Intended RED commands:

```powershell
node --test test/rules/recovery-round.test.js
node --test test/rules/recovery-arena.test.js
```

- Assertions must fail on absent behavior, not import failure: 40×24 finite board; mirrored five-cell spawns; deterministic `createRound(config, randomSource)`; `containsCell`, occupancy, legal bounded food, and board-full behavior.
- GREEN paths: `shared/constants.js`, `shared/protocol.json`, `server/game/arena.js`, `server/game/rules.js`.
- Scope rerun: `node --test test/rules`.

### Cycle B — turns, fixed-step rules, food, boost, and atomic collision

- Test first: `test/rules/recovery-turns.test.js`, `test/rules/recovery-step-food.test.js`, `test/rules/recovery-boost-collision.test.js`, and `test/rules/recovery-outcomes.test.js` (all new or independently rewritten).
- Intended RED commands:

```powershell
node --test test/rules/recovery-turns.test.js
node --test test/rules/recovery-step-food.test.js
node --test test/rules/recovery-boost-collision.test.js
node --test test/rules/recovery-outcomes.test.js
```

- Cover, with literal fixtures: two queued legal turns; duplicate/sequence rejection; exact reversal rejection; integer 60 Hz movement credit; mixed-speed same-tick ordering; one pre-step collision state; start-of-step occupied tails; stationary-head body collision; head-on/head-swap; terminal collision skipping pickups; same-cell food contention; exact one-segment/apple growth; legal food replenishment; mushroom 1.5×/four active seconds; refresh without stacking; pause-frozen boost; wall/body/simultaneous death; timeout length/equal draw; and `BOARD_FULL`.
- GREEN paths: `server/game/rules.js`, `server/game/arena.js`, and any frozen shared fixture updates required by the tests.
- Scope rerun: `node --test test/rules`.

### Cycle C — protocol validation and bounded authoritative transport

- Test first: `test/security/recovery-validation.test.js` and `test/transport/recovery-bounds.test.js` (new or independently rewritten), followed by `test/transport/recovery-wire.test.js`.
- Intended RED commands:

```powershell
node --test test/security/recovery-validation.test.js
node --test test/transport/recovery-bounds.test.js
node --test test/transport/recovery-wire.test.js
```

- Assert malformed/unknown/claimed-authority/oversized/flooded input rejection; trusted Origin; membership; room/epoch/sequence checks; two-command and retained-control bounds; ≤32 KiB snapshots; ≤64 KiB output queues; slow-peer handling; credential absence from links/query strings/log-shaped messages; and exact versioned `welcome`, `inputAck`, `snapshot`, `effect`, `result`, and `error` envelopes.
- GREEN paths: `server/protocol/validate.js`, `server/authoritative-server.js`, `server/index.js`, `shared/protocol.json`, `shared/constants.js`.
- Scope rerun: `node --test test/security && node --test test/transport`.

### Cycle D — room lifecycle and rematch

- Test first: `test/rooms/recovery-admission.test.js`, `test/rooms/recovery-lifecycle.test.js`, and `test/rooms/recovery-rematch.test.js`.
- Intended RED commands:

```powershell
node --test test/rooms/recovery-admission.test.js
node --test test/rooms/recovery-lifecycle.test.js
node --test test/rooms/recovery-rematch.test.js
```

- Assert create/join by eight-character code or shareable link without credentials; exactly two seats; full/invalid/expired rejection; idempotent Ready and one three-second countdown only after both; pause on disconnect; 15 cumulative seconds and at most two interruption episodes; same-seat credential/epoch resume with old-socket control loss; leave, expiry, both-absent abandonment, server-loss interruption; immutable results; and both-opt-in rematch with fresh round identity.
- GREEN paths: `server/rooms/room-manager.js`, `server/rooms/lifecycle.js`, plus the authoritative server wiring as needed.
- Scope rerun: `node --test test/rooms`.

### Cycle E — authoritative browser model and presentation seams

- Test first: `test/client/recovery-model.test.js` and `test/client/recovery-renderers.test.js` (new or independently rewritten).
- Intended RED commands:

```powershell
node --test test/client/recovery-model.test.js
node --test test/client/recovery-renderers.test.js
```

- Assert that the model accepts only confirmed welcome/snapshot/ack/effect/result/error messages; keeps authoritative bodies/score/boost/death/victory server-owned; caps presentation-only intent at 150 ms; reconciles only unacknowledged turns; and renders HUD/phase/result/connection from the frozen stable IDs without inventing state.
- GREEN paths: `public/client-model.js`, `public/protocol-client.js`, `public/board-renderer.js`, `public/dom-renderer.js`, `public/app.js`. Do not edit static HTML/CSS/SVG/manifest.
- Scope rerun: `node --test test/client`.

### Cycle F — minimal complete room/play/rematch wiring

- Test first: `test/transport/recovery-room-play-rematch.test.js` (new; application-owned transport scope).
- Intended RED command:

```powershell
node --test test/transport/recovery-room-play-rematch.test.js
```

- Exercise the smallest real end-to-end server/client boundary available to Node tests: create, join, both Ready, countdown, accepted turns, confirmed snapshots, apple/mushroom effects, terminal result, and both-seat rematch. The test must not replace authoritative behavior with a fake local simulator.
- GREEN paths: `server/index.js`, `server/authoritative-server.js`, `server/rooms/*`, `server/game/*`, `public/*` behavioral JS, and the frozen protocol seam.
- Scope rerun: `node --test test/transport`.

After Cycle F, recreate `README.md`, `docs/implementation.md`, and `docs/render.md` from the frozen contract and write/retain only the proposed one-service `render.yaml` configuration. These documentation/configuration writes need no behavioral RED, but must make no deployment, account, public URL, uptime, or S10 claim.

## 6. Completion gate for this implementer

The implementer report must list every changed path, every RED command and assertion failure, every GREEN rerun and scope result, dependency/lock provenance, and every intentionally unrun check. It must explicitly say: no historical production bytes were used; no full suite was run in the application stage; no browser/S10/public Render route/deployment/commit/push/merge/independent verification occurred. A focused implementer GREEN is not a verifier verdict.

The minimal slice must preserve all frozen S1–S10 requirements and the exact APIs/messages in `wire-contract.md`. Any unimplementable requirement is a blocker with `BLOCKED.md` and a stop, not a local-only mock, acceptance weakening, or relabeling as generated/static/prototype.
