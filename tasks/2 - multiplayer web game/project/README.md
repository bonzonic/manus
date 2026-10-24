# Wayfinder Grid Snake

This directory is the joined Route B source package for a two-seat, server-authoritative Snake MVP. It uses native Node.js ESM and the exact pinned `ws@8.18.3` dependency. The approved static HTML/CSS/SVG/manifest shell is included alongside the application source.

## Local use

```text
npm ci --ignore-scripts --no-audit --no-fund
npm start
```

The server serves same-origin static files from `public/`, exposes `GET /healthz`, and accepts WebSocket clients at `/ws`. `PORT` is honored; the default local bind is `127.0.0.1:10000`. Browser clients create or join a room with an eight-character code, send Ready, receive server snapshots, submit sequenced turns, and can opt into a mutual rematch.

## Scoped checks

The joined candidate uses explicit file commands because this Windows Node 22 environment treats directory operands to `node --test` as modules. Pure recovery rules, rooms, client, security, wire, packaging, and UI-seam checks are green. The exact authorized Cycle F output recorded at `.work/debug/cycle-f-authorized-output.txt` is a TAP pass with 1 test, 0 failures, and conduit exit 0; this integrator did not rerun the socket test without the parent’s authorized dependency/network path.

No browser acceptance, HTTPS/WSS deployment, Render service, S10 demonstration, full-suite run, commit, push, merge, or independent verification is claimed by this package.
