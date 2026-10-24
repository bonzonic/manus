# Snake MVP follow-ups

## Immediate next step — one bounded evidence correction

Obtain a safe, task-owned process receipt and approved setup for the QA-only corrected driver, then run the trusted positive full matrix against the unchanged candidate:

- Candidate SHA must remain `afd285f6c85cfa4638fbcd84973d1ae1bfa41e35`.
- Use a fresh evidence root; preserve the original v2 driver, report, and evidence.
- Use the corrected QA copy at `plans/verification/2026-10-24-snake-candidate-v2-kEUETV/snake-verifier-v2-origin-corrected.mjs`.
- Its intended correction is only to add the actual ephemeral `new URL(baseUrl).origin` to the test allowlist after the port is known; it must retain exact negative Origin probes and must not add `*` or weaken admission.
- Capture exact task-owned server/browser PIDs, start/exit receipts, stdout, evidence paths, candidate SHA, and cleanup. Do not recover or kill unknown PIDs by name/pattern.
- Independently inspect the resulting evidence; do not convert a shell exit, a null parent exit code, a single-browser rendering, or a local-only result into a pass.

The parent’s interrupted attempt at approximately `2026-10-24 17:58:24 +08:00` is not a run receipt: PowerShell’s reserved `$PID` assignment fault interrupted it, no stdout/evidence was obtained, and no duplicate corrected run was launched. That gap must be repaired by one safely admitted, separately receipted run—not by changing criteria or requesting another generic plan approval.

## Trusted positive full matrix still required

The same-candidate independent rerun must cover the frozen must-haves that remain open: trusted CREATE/JOIN through a shared link or code; exactly two seats and shared lobby; both Ready and one server countdown; two-browser PLAYING and accepted/rejected turns; apple growth; mushroom boost, refresh, no-stack and pause freeze; collision/result/draw/timeout/board-full outcomes; mutual rematch; reconnect/refresh/offline/old-socket/expiry behavior; authoritative labels/status/length/apples/boost; malformed/stale/wrong-round/wrong-epoch and bounded transport checks; narrow viewport; and 100–200 ms RTT/jitter evidence. The verifier must record the candidate/build identity and inspect all required screenshots. A successful local rerun remains local-scope evidence and does not satisfy S10.

The one authorized product-code retry has already been consumed. Do not launch a second code repair or change the frozen S1–S10 contract from this follow-up. If the trusted rerun establishes a product-code failure, apply the frozen terminal one-retry rule; if it establishes only evidence/configuration gaps, record and correct those gaps without calling them product PASS.

## Public delivery gate after local evidence

Only after the trusted matrix is independently accepted and the user explicitly authorizes deployment may the parent follow the existing `project/docs/render.md` proposal:

- connect the approved Git repository and complete the required user-authenticated Render setup;
- create one Render `web` service on the Free plan from `rootDir: .`;
- use Node `22.12.0`, `npm ci --ignore-scripts`, `npm start`, `/healthz`, proposed `HOST=0.0.0.0`, and an explicit deployment-time `ALLOWED_ORIGINS`;
- capture the actual public HTTPS URL and WSS behavior, process/health evidence, and the public two-browser S10 matrix.

No Render account, service, public URL, Git push, merge, or deployment exists now. The owner makes no no-technical-step promise: future public delivery requires the user’s Git repository connection and authentication/setup where the selected hosting service requires it.

## Scope discipline

Unlimited-space mode, extra players, sound, and art polish are nice-to-have and must not displace the S1–S10 gates. Preserve all old verifier records, the original v2 driver, the corrected QA-only copy, candidate identity, and archive receipt. Do not clean up or kill unrelated processes, and do not claim the archive is a completed game.
