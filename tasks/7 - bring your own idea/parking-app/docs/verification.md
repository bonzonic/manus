# Parking Navigator — prototype handoff

Delivered locally on 2026-10-24 within the requested 30-minute deadline pass. The app is plain-local source and a built Node/React website; it has not been publicly deployed.

## Verified

- `npm test`: **31 tests across 12 files passed** at 18:02–18:03.
- `npm run test:integration`: real combined REST/CSV/file persistence/WebSocket/routing flow passed.
- `npm run typecheck`: passed, including integration tests.
- `npm run build`: passed; output includes `dist/client` and `dist/server/index.js`.
- Production smoke: `/health` returned healthy, website `/` returned 200, six floors/85 spaces loaded, and `/api/route` returned the Floor-5 target at 60 seconds.
- Connected-browser check: real route request displayed Floor 5, 1 minute, 62 metres, and an explicit Ramp G→Ramp 5 up step.
- Real authenticated REST change of the synthetic Floor-5 target to occupied reached the browser over WebSocket. The old route was invalidated, and explicit recalculation displayed Floor 1 at 1 minute 30 seconds. The synthetic target was restored to free afterward.
- Independent source review approved the reduced runnable-prototype scope with no confirmed blocking/high/medium defect. Its separate test/network checks were permission-blocked; the parent ran the complete checks and actual browser/network smoke with the necessary local command access.

## Included

2D road/space builder with pointer placement and inspectors; explicit existing-node attachments; arbitrary-floor ramps including direct Ground↔5; CSV round-trip; Dijkstra by travel time; availability statuses; REST and WebSocket management; authenticated/revision-checked writes; local file persistence; driver floor/route steps and stale-guidance notification. CSV contains the complete graph, not just space coordinates.

## Deadline cuts and limitations

Undo/redo, sophisticated drag/pan/zoom/snapping, automatic road splitting, browser draft recovery, comprehensive keyboard editing, 3D/GPS, reservations/waiting-car/OKU policies, automatic rerouting and Docker/Render deployment packaging are deferred. Imported module tests were not executable in isolated copies until canonical integration, so this is not a claim of complete TDD evidence. The SVG board is a basic fixed 100×65 metre editor surface; wider/imported geometry and richer camera controls remain a follow-up. Do not rely on this prototype for real parking availability.

The server is running locally at http://127.0.0.1:3000 for this session. To restart from source, use `npm ci`, `npm run build`, then `npm start`; development uses `npm run dev` at port 5173. See the app README and integration documentation in the source package.

The source package excludes installed dependencies, local saved data and the generated management key. A fresh local run creates `.data/management.key`; load it through Management integration or paste it into the password field. Keys stay in browser memory only. Future public hosting must use a protected environment token and durable shared storage.
