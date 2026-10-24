# Snake MVP owner repair handoff — code retry 1

**Status:** READY FOR A DISTINCT IMPLEMENTER; NOT SHIPPED, NOT DEPLOYED, NOT VERIFIED.

This packet is the single allowed product-code repair handoff after the independent v1 verifier returned **CODE FAIL — S10 public route blocked/unverified** with a reproducible S1 contract failure. It does not alter, waive, reorder, or reinterpret frozen S1–S10 or the wire contract. The owner writes this packet only; the owner must not edit product source, run the suite, launch browsers, start a runtime, install dependencies, or grade the repair.

## Provenance and inputs

- Frozen work item: `2026-10-24-snake-mvp-kEUETV`.
- Frozen plan: `plans/runs/2026-10-24-snake-mvp-kEUETV/plan.md`.
- Frozen wire contract: `plans/runs/2026-10-24-snake-mvp-kEUETV/wire-contract.md`.
- Baseline before integration: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee`.
- Failed candidate revision to repair from exactly: `eebdb1d9408a2002c5971d7c8b4f15ba1f558bed`.
- Candidate comparison worktree (read-only for this retry): `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-candidate-20261024-kEUETV\project`.
- v1 independent report: `plans/verification/2026-10-24-snake-candidate-v1-kEUETV/verify-report-final-v1.md`.
- v1 failure note: `plans/verification/2026-10-24-snake-candidate-v1-kEUETV/review-fail.md`.
- Integration receipt: `plans/runs/2026-10-24-snake-mvp-kEUETV/integration/report.md`.

The verifier proved successful navigation, the frozen 47-element DOM check, WebSocket routing, CREATE hello, and a real welcome response whose `roomCode` was `SWOEW5S` (7 characters). There were zero page errors and zero failed requests. This is a product contract failure, not a driver or selector fault. F1–F5 below are independently documented repair targets; no other behavior is approved for this retry.

## Fresh repair worktree request

The parent/coordinator must create a **new detached repair worktree** from the exact failed SHA, preserving the candidate worktree and all v1 evidence:

```text
Repository: C:\Users\wongn\Documents\Interview\Manus
Base: eebdb1d9408a2002c5971d7c8b4f15ba1f558bed
Requested worktree: C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-repair-20261024-kEUETV
Project directory: C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-repair-20261024-kEUETV\project
```

Record the exact worktree path, detached HEAD, and starting SHA before any edit. Do not use the v1 candidate directory as a scratch checkout, do not stash or switch the shared checkout, do not remove worktrees, and do not broadly stage files. After the distinct implementer completes, the parent alone may run the authorized parent-side checks and create the immutable v2 candidate commit. A second verifier must receive the v2 identity and separate evidence path.

## Single repair objective and exact allowed scope

The implementer must add a real failing assertion for each behavior below **before** its corresponding minimum fix, run only the changed-file scoped test, then rerun the same test green. Existing green fixtures that inject a fixed eight-character code are not sufficient evidence for the default-code repair.

### F1 — Enforce Origin during WebSocket admission

**Required behavior:** Before `hello` handling, inspect the upgrade request Origin and enforce the configured `allowedOrigins` using the frozen `validateOrigin` semantics. A disallowed or absent Origin must produce bounded `BAD_ORIGIN` transport evidence (and no `welcome`); it must not create a room, claim a seat, or reach gameplay handlers. Do not weaken localhost/public allowlist configuration or accept `*` as a substitute. Preserve credential-free errors.

**Allowed product files:**

- `project/server/index.js` — admission-time request Origin check and bounded rejection/close path.
- `project/server/protocol/validate.js` — only if a helper adjustment is strictly required; preserve its public contract and existing pure tests.

**RED assertion and test:** Extend `project/test/transport/recovery-room-play-rematch.test.js` with a real WebSocket connection using an evil/absent Origin, asserting `BAD_ORIGIN`, no `welcome`, and no admitted room/seat. Keep `project/test/security/recovery-validation.test.js` as the pure allowlist guard. Do not replace this with a direct helper-only test.

### F2 — Limit full snapshots to at most 15 per second per active room

**Required behavior:** Keep the authoritative simulation at 60 Hz and retain input acknowledgements/effects/results. Gate every full snapshot emission, including hello, ready, countdown/play, lifecycle, and rematch paths, through one per-room limiter. The limiter must satisfy the frozen `<=15 full snapshots/sec/room` bound rather than merely reducing a tick loop; preserve the existing 32 KiB snapshot and 64 KiB output-queue bounds.

**Allowed product file:**

- `project/server/index.js` — centralize snapshot scheduling/throttling; do not reduce the authoritative tick rate.

**RED assertion and test:** Extend `project/test/transport/recovery-room-play-rematch.test.js` with a real running-room measurement that counts full `snapshot` messages over a defined one-second window while the server ticks quickly, asserting no more than 15 per active room and that play still advances. Do not use a renderer count or a single immediate snapshot as proof.

### F3 — Consume invite query on cold startup

**Required behavior:** On a cold browser start with `?room=AB12CD34`, validate the eight-character code and submit one `JOIN` hello through the normal same-origin WebSocket path without a credential in the URL, query, console, or log. Preserve the explicit Create Room and manual Join flows; malformed query values must show the bounded room error and must not create a room. The existing copy hook may continue to generate the query link.

**Allowed product file:**

- `project/public/app.js` — bootstrap query parsing and one-shot JOIN scheduling only.

**RED assertion and test:** Extend `project/test/client/integration-ui-seam.test.js` with a cold `startApp` location containing `search: '?room=ZX90QWER'`; after the fake socket opens, assert exactly one `JOIN` hello with that code and no `CREATE`. Add the malformed-query assertion if needed without changing the frozen error vocabulary.

### F4 — Complete bounded tab-scoped resume and lifecycle expiry

**Required behavior:** Keep credentials tab-scoped, sent only in the WSS `RESUME` message. Permit same-seat resume only with the matching credential and current epoch, while the seat is within the configured grace/cumulative-disconnect bound; reject wrong/stale credentials, stale epochs, active-seat takeover, and expired seats. On resume, atomically advance the seat epoch and revoke the old socket so old-socket turns/ready/rematch/leave cannot mutate state. Count interruption episodes per seat and enforce at most two; a third interruption or exhausted cumulative grace must forfeit to a connected opponent or abandon when both are absent. Disconnect freezes movement, active time, and boost time. Resume must use the frozen three-second `RESUMING` countdown before `PLAYING`, not jump directly to play. Apply the same configured expiry discipline to lobby and result-seat retention: expiry must not rewrite a finalized result or fabricate a winner; an exhausted room/seat returns only the remaining member to the documented lobby/abandoned state.

**Allowed product files:**

- `project/server/rooms/room-manager.js` — credential/epoch admission, old-socket invalidation, episode/grace checks, pause/resume countdown, and room/result transitions.
- `project/server/rooms/lifecycle.js` — only if needed to share the same bounded pause/resume/lobby/result expiry rules; avoid a second conflicting timer policy.

**RED assertions and test:** Extend `project/test/rooms/recovery-lifecycle-rematch.test.js` with (a) old-socket command rejection after resume, (b) expiry/wrong-epoch rejection, (c) a third-interruption/max-episode case, (d) resume countdown and frozen tick/boost state, and (e) lobby/result-seat expiry without a fabricated result. Keep the existing two-seat/rematch/abandonment cases. Run through the room-manager seams; no browser shortcut substitutes for these lifecycle assertions.

### F5 — Render authoritative players, connection/ready status, and remaining boost

**Required behavior:** The server remains the sole source of labels, seat connection/ready status, snake stats, and boost expiry. Every client render must use accepted authoritative state; no client-local label, status, growth, boost, death, or result may be invented. Make current authoritative player metadata available on the canonical snapshot/update path, preserve frozen message fields, and render both player cards with authoritative labels plus connected/ready state. Render BOOST remaining active duration from absolute server ticks (not raw expiry), with zero/blank when inactive; because server and boost ticks freeze in `PAUSED`, the displayed remaining duration must also freeze. Preserve the existing distinct lifecycle surfaces and stable DOM IDs.

**Allowed product files:**

- `project/server/authoritative-server.js` — include the current authoritative player metadata on the canonical update used by the client, without removing frozen snapshot fields.
- `project/public/client-model.js` — accept only server-provided player metadata and calculate/retain no authoritative gameplay locally.
- `project/public/dom-renderer.js` — render player labels/status and boost remaining from snapshot tick/expiry; keep the existing IDs and pause behavior.

**RED assertions and tests:** Extend `project/test/client/recovery-model.test.js` to prove player metadata comes from a snapshot/update and stale updates do not overwrite the current round. Extend `project/test/client/recovery-renderers.test.js` with label, connected/ready, and remaining-boost assertions, including a paused snapshot where the remaining value is unchanged. Keep `project/test/client/integration-ui-seam.test.js` as the browser wiring guard.

## Exact scoped check sequence for the implementer/parent

This owner did not run any of these commands. After the RED assertions are authored, the distinct implementer may run only the affected scoped files from the repair worktree:

```text
node --test test/rooms/recovery-admission.test.js test/rooms/recovery-lifecycle-rematch.test.js
node --test test/security/recovery-validation.test.js
node --test test/transport/recovery-room-play-rematch.test.js
node --test test/client/recovery-model.test.js test/client/recovery-renderers.test.js test/client/integration-ui-seam.test.js
```

Do not run `npm test`, `node --test test`, a full build, a browser, a watcher, or a public network test in the implementation lane. Candidate-local dependency installation and the real socket test were explicitly deferred in the integration receipt; the parent must decide/admit that operation, record task-owned process/PID or process-group receipts, and run the real localhost/conduit network check separately. The parent must not kill by process name, must not assume ownership of Node IDs `52788` or `53440`, and must preserve the process-cleanup gap until exact task-owned startup/exit receipts exist.

Parent-side only after the minimum fix is green: install the pinned candidate-local dependency exactly as already recorded if still required (`npm ci --ignore-scripts --no-audit --no-fund --cache .work/npm-cache`), run the deferred `node --test test/transport/recovery-room-play-rematch.test.js`, capture health/WS and cleanup evidence, commit the exact v2 file set, and dispatch the fresh independent browser verifier. No deployment, Render account mutation, public HTTPS/WSS claim, push, merge, grade override, or criterion edit is authorized by this handoff.

## Definition of done for this retry handoff

The implementer returns the changed-file list, each RED assertion and its initially failing output, each scoped green rerun, the exact v2 SHA requested by the parent, and task-owned process cleanup receipts. The parent—not this owner—performs the required independent rerun. A fresh verifier must repeat the complete browser matrix and separately obtain public HTTPS/WSS evidence; P2 join, shared lobby/countdown, gameplay, results/rematch, reconnect, narrow viewport, offline behavior, and S10 remain unverified until that happens. If the next independent verdict is another **CODE FAIL**, this is the second code failure and is terminal under the frozen one-retry rule. Evidence-only or public-route gaps do not become a PASS and must be recorded separately.
