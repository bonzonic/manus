# Parking Navigator — simple demo

The current website has exactly two ready-made Ground-floor parking layouts. It automatically starts at the Ground entrance and shows the fastest reachable available space using Dijkstra. Choose Layout 1 (straight aisle) or Layout 2 (one-way loop). There is no start selector, builder, floor picker or management panel in this screen.

The layouts and availability are synthetic and run in the browser. The earlier builder, REST/WebSocket server and shared CSV/routing modules remain in source for later work, but are not connected to this simplified screen. The previous full shell is backed up in the task's .work/parking-plan/backups/full-App.tsx; the earlier source archive is also preserved.

## Run

Use Node 22.12+ within Node22 and npm10:

```powershell
npm ci
npm run build
npm start
```

Open http://127.0.0.1:3000. For source editing, use `npm run dev` and open http://127.0.0.1:5173.

## Checks

`npm test`, `npm run typecheck` and `npm run build` passed after the simplification (32 tests across 13 files). The new UI regression checks two layout choices, Ground entry, both recommended spaces and removal of advanced controls.

This is a fake-data visual demonstration, not a live parking availability service. The source package excludes node_modules, saved local data and the generated management key.
