# Snake MVP independent verification packet

**Status:** packet only; no candidate, build, browser run, or verdict exists.  
**Owner:** `om-feature`; **verifier:** fresh independent `om-verifier`, dispatched by `om-coordinator`.  
**Owner contract:** `..\runs\2026-10-24-snake-mvp-kEUETV\plan.md`  
**Separate verifier report (future):** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\plans\verification\2026-10-24-snake-mvp-kEUETV\verify-report-<agent>.md`

## Revisions and environments

- Baseline: `0c3155d560692d4042c5fdb7cb6a569cbf4c0cee` on `main`; no runnable product exists at baseline, so baseline negative observations must say “unimplemented/unrunnable,” not “passing.”
- Candidate: to be supplied after a separate implementer produces a commit/build in `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-candidate-20261024-kEUETV`.
- Verifier worktree: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-verifier-20261024-kEUETV`.
- Project directory: `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\.work\worktrees\snake-mvp-candidate-20261024-kEUETV\project`.
- Route prerequisite: parent must record managed Game/selected Cloud Computer or explicit source-code delivery before candidate exists.
- Browser arms: two independent browser contexts, same driver and viewport for all candidate checks; one room creator and one guest. Use Playwright only if the selected driver cannot safely inject latency or handle required keystrokes. Never bring a user browser to foreground.
- Network condition: actual HTTPS/WSS route with simulated 100–200 ms RTT/jitter; record exact driver/intercept and latency settings.
- Evidence root: this verification directory; owner records remain under the run directory and are not overwritten.

## Bounded evidence matrix

| ID | Check and binary pass condition | Evidence to retain |
|---|---|---|
| S1 | Create/join by code/link in two browsers; invalid/full/expired rooms show bounded errors; exactly two active seats | Candidate/build stamp, two screenshots, room/network log, focused test output |
| S2 | Both labels/statuses visible; one Ready cannot start; both Ready yields exactly one server countdown | Before/after-equivalent screenshots, event log, focused test |
| S3 | Both browsers agree on board/bodies/actions; four-direction control works; reversal is refused; client cannot declare result | Two synchronized frames/video or screenshots, protocol trace, fixture output |
| S4 | One apple pickup adds exactly one segment/point once and replenishes legally after the step; clients agree | Deterministic fixture, server trace, two browser frames showing length/score |
| S5 | Mushroom gives 1.5× speed for four active seconds, refreshes without stacking, pauses/frees duration correctly, shows BOOST/timer | Timing fixture, latency-conditioned trace, HUD screenshots |
| S6 | Wall/body/head-on/head-swap, simultaneous death, timeout tiebreak/draw, board full, result freeze, and mutual rematch are deterministic | Rule fixture set, result snapshots, result/rematch screenshots |
| S7 | Server authority, accepted/applied sequences, stale/wrong epoch/round rejection, malformed/flood limits, ≤32 KiB snapshots and bounded queues; two-browser steering remains usable at 100–200 ms RTT/jitter | Protocol/security logs, size/queue measurements, latency trace, focused tests |
| S8 | Refresh reattaches only same seat within 15 cumulative seconds/two episodes; old socket loses control; pause/resume; leave/expiry/both-absent/server-loss behavior has no fake result | Lifecycle test logs, reconnect/old-socket trace, screenshots for paused/interrupted/results states |
| S9 | Labels/colors/heads, food shapes, length/score, countdown, boost, network/death reason are readable; credentials absent from link/logs; origin/traffic/expiry controls hold | Viewport screenshots, sanitized logs, validation/security outputs |
| S10 | Fresh verifier completes S1–S9 over actual HTTPS/WSS in two independent browsers with recorded build/commit and latency settings; local-only demo is rejected as insufficient | Full bounded evidence manifest, two-browser screenshots, build and route provenance |

## Verifier procedure

1. Confirm candidate commit, build stamp, route choice, exact commands, worktree identity, and implementer file list against `plan.md`; reject missing provenance before behavior grading.
2. Re-run the discovered focused unit/protocol/room tests on the candidate, then compare failure identities with any baseline logs. Do not treat an owner/implementer report as independent proof.
3. Exercise the cold user flow from room creation through rematch in two independent browser contexts. Cover invalid/full/expired room and narrow/offline/server-loss states without inventing results.
4. Drive controlled apple, mushroom, collision, timeout, board-full, reconnect, old-socket, stale-command, and mutual-rematch cases. Record actual snapshots/events and inspect every screenshot before citing it.
5. Apply 100–200 ms RTT/jitter using the documented driver/intercept, repeat steering and near-collision cases, and check prediction remains presentation-only and does not award state.
6. Inspect bounded message/snapshot/queue/resource and credential/origin evidence. Record unrun checks and route/host limitations; do not weaken a missing safety control.
7. Write only the verifier-owned `verify-report-<agent>.md` with `PASS`, `FAIL`, or `BLOCKED`, exact expected/observed details, failure-set comparison, evidence paths, and candidate provenance. A missing capability or evidence is not a pass.

## Verdict boundaries

- `PASS` requires every S1–S10 criterion and evidence row, a clean scope check against the plan, and no unreported blocker.
- `FAIL` names the first reproducible criterion mismatch and expected versus observed behavior; one code retry is available through the coordinator, and a second code failure is terminal.
- `BLOCKED` is appropriate for absent route/candidate/build/host/driver or inaccessible evidence, not for a product pass. Never certify a static/local rendering demo as networked completion.
