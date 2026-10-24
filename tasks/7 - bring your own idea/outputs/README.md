# Parking Navigator — quick demo

A simple parking website with **two layouts**, automatic routing from the **Ground entrance**, complete CSV import/export and real WebSocket parking simulation. There is no start selector or management panel.

## Download

Download [the complete source and built app](parking-live-demo.zip). It includes the website, Node backend, tests and editable source. Download the starter [Layout 1 CSV](layout-1.csv) and [Layout 2 CSV](layout-2.csv) to try importing or sharing a layout.

The running local demo is at [http://127.0.0.1:3000](http://127.0.0.1:3000). This is a local address, not a public hosted website.

## Run after downloading

Extract the ZIP into a folder. Install **Node.js 22.12+ within Node 22** and **npm 10**, then open a terminal in the extracted folder containing `package.json`.

```powershell
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:3000**. Leave the terminal running; press **Ctrl+C** to stop the server. For development, run `npm run dev` instead and open http://127.0.0.1:5173.

## Try it in one minute

1. Select **Layout 1**. It starts at the Ground entrance automatically and recommends **A-03** on fresh data: approximately **24 seconds / 40 metres**.
2. Click the green **A-03** space on the map. It becomes occupied, and the route automatically changes to **A-07**. The small confirmation says the update was sent via WebSocket.
3. Click the occupied **A-03** space again to free it. The recommendation returns to **A-03**. Keyboard users can focus a space and press **Enter** or **Space**.
4. Select **Layout 2** to see the one-way loop. On fresh data it recommends **B-03**, approximately **30 seconds / 52 metres**. Changes in Layout 1 do not overwrite Layout 2.
5. Open the website in another tab and select the same layout in both. Click a parking space in one tab; the other tab receives the new status and recalculates its route automatically.

Grey spaces are taken, green spaces are available, and the blue line is your route. Closed spaces in imported layouts cannot be toggled by this parking demo. Availability is fake—it does not reserve a real space.

## Export a layout

Click **Export CSV**. The download contains the complete road graph: floors, entrances, junctions, parking spaces, road/access/ramp connections, travel speeds, directions and current space statuses. You can transfer this file to another computer or import it again.

This is a **layout graph CSV**, not only a list of coordinates or a saved route line. The route is recalculated from the graph and current parking availability.

## Import a layout

Use the **Import CSV** file chooser and select a starter or previously exported CSV. Import replaces only the currently selected layout, saves it on the backend and recalculates the route from Ground. Export first if you want to keep a copy of the current layout.

The file must use the exported schema (version 1), be at most **2 MiB**, and contain an **entrance on a floor with level 0**. Invalid files are rejected without replacing the current layout. Multiple floors and ramps are supported by the CSV; imported floors are displayed as separate map sections. Do not open untrusted CSV labels as spreadsheet formulas.

## What is genuinely connected?

The UI receives saved map snapshots over a real WebSocket subscription. Clicking a space sends a real `availability.set` command; the backend validates its version, saves it, broadcasts the new snapshot and acknowledges it. CSV import uses the existing REST map-replacement API. Export serialises the current authoritative graph. Dijkstra recalculates the fastest reachable free space; there is no browser-only mutation fallback.

Each sample has an independent saved session: `straight` for Layout 1 and `loop` for Layout 2. Changes and imports survive page reloads and server restarts in `.data/demos/straight.json` and `.data/demos/loop.json`. The earlier primary management map is kept separately.

## Send a fake parking event from your own client

Connect a WebSocket client to:

```text
ws://127.0.0.1:3000/ws?layout=straight
```

Send the subscription message:

```json
{"type":"subscribe","protocolVersion":1}
```

The server replies with `map.snapshot`. Copy its current `snapshot.epoch` and `snapshot.revision` into your next command—do not reuse the placeholders below:

```json
{
  "type": "availability.set",
  "protocolVersion": 1,
  "requestId": "fake-car-1",
  "command": {
    "expectedEpoch": "COPY_CURRENT_EPOCH",
    "expectedRevision": 1,
    "spaceId": "A-03",
    "status": "occupied"
  }
}
```

The sender receives `command.result`, while subscribers receive a `map.snapshot` with reason `availability`. Use status `free` to simulate a car leaving. Always use the latest epoch/revision; a stale command is rejected rather than silently overwriting another client's change. Connect with `?layout=loop` and use a B-space ID for Layout 2.

## Local demo security and limits

The default server binds to **127.0.0.1**. Keyless simulation is allowed only for the named demo sessions, loopback connections and loopback Host headers, after the allowed-Origin check. The default management API still requires a bearer key; no key is embedded in the website. Set `DEMO_MODE=0` to disable named demo sessions and keyless simulation. Do not expose this demo to the public internet; production authentication/deployment is outside this prototype.

The ZIP excludes installed dependencies, saved local data and management keys. Real sensors, reservations, waiting cars, OKU policies and 3D simulation are not implemented.

## Checks and troubleshooting

`npm test`, `npm run typecheck` and `npm run build` passed after reconnecting the integrations (**35 tests across 15 files**). Tests include two-socket WebSocket broadcasts, isolated layouts, CSV round-trip, imported map persistence, interactive parking and rerouting, plus invalid-import preservation.

If **Connecting/Reconnecting** stays visible, make sure `npm start` is running and reload the page. Imports and parking clicks are disabled when the connection is not live. If another tab changes the layout during your command, the UI loads the latest data and asks you to retry instead of overwriting it.
