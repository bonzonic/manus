# Snake MVP repair 1 implementation report

**Work item:** `2026-10-24-snake-mvp-kEUETV`  
**Lane:** distinct om-implementer; one allowed code retry  
**Baseline:** `eebdb1d9408a2002c5971d7c8b4f15ba1f558bed`  
**Repair worktree:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-repair-20261024-kEUETV\project`  
**V2 commit:** not created in this lane; parent/coordinator must commit the exact manifest file set and provide the new SHA to the independent verifier.

## Scope and provenance

The repair started from the exact failed v1 SHA in the prepared detached worktree. The worktree remained detached at the baseline throughout; no shared checkout, candidate worktree, deployment, push, merge, browser, watcher, or persistent service was used. Git ownership was queried with a per-command `safe.directory` override only; global Git configuration was not changed. `git diff --check` is clean. The final diff contains exactly the 12 files listed in `file-manifest.json`, all inside the owner-approved product/test scope.

## Implemented fixes

- **Room codes:** replaced the five-byte/base64url default with an eight-character uppercase alphanumeric generator and retained collision retry; added a default-generator assertion rather than relying only on injected fixed codes.
- **F1 Origin admission:** `server/index.js` now validates the upgrade request Origin before any hello handling and returns bounded `BAD_ORIGIN`/closes for disallowed or absent Origin. The real WS evil-Origin and absent-Origin cases are in the transport test for the parent conduit.
- **F2 snapshot cadence:** full snapshots go through one per-room real-time limiter at 15 per second while the authoritative simulation loop remains unchanged. The real running-room one-second cadence test is in the transport test.
- **F3 invite startup:** `public/app.js` consumes one valid `?room=` query as a normal same-origin `JOIN`; malformed values show `ROOM_INVALID` and do not open a create flow. No credential is placed in the URL/query.
- **F4 lifecycle:** `room-manager.js` now enforces matching credential/current epoch, rejects active-seat takeover and stale/expired resume, revokes old-socket control, tracks cumulative disconnected ticks and interruption episodes, caps at two episodes, freezes gameplay during `PAUSED`/`RESUMING`, uses the configured countdown before returning to `PLAYING`, forfeits/abandons on exhaustion, and releases lobby/result retention without rewriting a finalized result.
- **F5 authoritative render:** canonical snapshots include authoritative player label/connected/ready metadata. The client model accepts metadata only from welcome/current-round snapshots. DOM rendering uses those fields and computes `BOOST <seconds>` from absolute server tick/expiry, so the display remains frozen while server ticks are frozen.

## Required RED/GREEN evidence

| Slice | RED before fix | GREEN after fix | Notes |
|---|---|---|---|
| Default room code | `node --test test/rooms/recovery-admission.test.js` failed: observed default `ZVJU9OS` did not match `/^[A-Z0-9]{8}$/`. | Same file passed 2/2 after deterministic generator. | This is the genuine default-code assertion, not a fixed-code-only fixture. |
| F1/F2 real transport | Required test was authored with real `ws` connections, but the scoped execution failed before assertions with Windows `EACCES 127.0.0.1:<ephemeral-port>` for every socket. | Deferred; not counted as RED and not claimed green. | Parent must run the exact deferred command in an admitted localhost/conduit environment. |
| F3 invite query | `node --test test/client/integration-ui-seam.test.js` failed 2 tests: no socket for valid cold query and null `ROOM_INVALID` model for malformed query. | Same file passed 4/4. | Valid query sent exactly one JOIN and no CREATE. |
| F4 lifecycle | `node --test test/rooms/recovery-lifecycle-rematch.test.js` failed 4 tests: takeover/stale resume, RESUMING countdown, third interruption, and lobby expiry cleanup. | Combined room scope passed 8/8. | Includes old-socket rejection, stale epoch, countdown/freeze, interruption cap, lobby/result retention. |
| F5 model/render | Strict `node --test test/client/recovery-model.test.js` against the pre-fix model failed because snapshot player metadata remained empty when welcome metadata was empty; renderer scope also failed its authoritative-label assertion. | Combined client scope passed 8/8 after restoring snapshot metadata acceptance. | Renderer proves labels, connected status, `BOOST 4s`, and paused unchanged display; stale-round metadata cannot overwrite the current round. |
| Pure security | Existing pure guard was green before/after; final `node --test test/security/recovery-validation.test.js` passed 3/3. | 3/3. | Pure helper is not used as substitute for real Origin admission. |

## Final allowed scoped runs

- `node --test test/rooms/recovery-admission.test.js test/rooms/recovery-lifecycle-rematch.test.js` — **8 passed, 0 failed**.
- `node --test test/security/recovery-validation.test.js` — **3 passed, 0 failed**.
- `node --test test/client/recovery-model.test.js test/client/recovery-renderers.test.js test/client/integration-ui-seam.test.js` — **8 passed, 0 failed**.
- `node --test test/transport/recovery-room-play-rematch.test.js` — **deferred/blocked by EACCES** on all five real localhost socket subtests; no product assertion result is claimed.

The full suite, browser, public route, HTTPS/WSS, Render, install, deployment, and account operations were not run. The parent must run the deferred real transport command, collect task-owned startup/exit receipts, commit the exact file set, and send the new v2 SHA to a fresh independent verifier. S10 remains public-route blocked/unverified until that independent verifier completes.

## Process cleanup

No persistent server or browser was started by this lane. All finite `node --test` commands exited. The transport attempts could not open localhost sockets and left no task-owned process. No unrelated observed PIDs were inspected, assumed, or killed. `processes_remaining` for this lane is `[]`.

## Handoff

- Changed-file manifest and SHA-256 hashes: `file-manifest.json`.
- Exact deferred localhost command: `deferred-localhost-transport.ps1`.
- Parent must preserve this report and v1 records, make the v2 commit, record its SHA, and dispatch a **new independent verifier**. This lane does not self-verify or ship.
