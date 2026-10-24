# Integration interface

The frontend and backend are plain local code. During development use http://127.0.0.1:3001 for integrations; the website at port 5173 proxies the API and WebSocket. The built version serves everything at port 3000. Use HTTPS/WSS for future public hosting.

## Versioned map

`GET /api/map` returns `{epoch, revision, map}`. The map has `schemaVersion:1`, stable `id`, `name`, and `floors`, `nodes`, `edges` arrays. Coordinates/lengths are metres; speeds are metres per second. A route minimises the sum of length/speed, not screen distance.

Every replacement/availability write and route request supplies `expectedEpoch` and `expectedRevision` from the latest snapshot. A server restart changes its epoch. Conflicting versions return HTTP 409 and must be resynchronised, not blindly replayed. Management writes require `Authorization: Bearer <your key>`; driver reads and route queries do not.

## REST endpoints

- `GET /health`: unauthenticated health response.
- `GET /api/map`: complete authoritative snapshot.
- `PUT /api/map`: `{expectedEpoch,expectedRevision,map}`; authenticated live replacement.
- `GET /api/map.csv`: download the saved map as CSV.
- `POST /api/map/import`: `{expectedEpoch,expectedRevision,csv}`; authenticated explicit live CSV replacement. The browser's Import action instead imports a draft for review before Save.
- `PATCH /api/spaces/:spaceId`: `{expectedEpoch,expectedRevision,status}`; authenticated availability mutation with `free`, `occupied` or `closed`.
- `POST /api/route`: `{expectedEpoch,expectedRevision,startNodeId}`; route response `{epoch,revision,outcome}`. Successful outcome contains destinationSpaceId, ordered nodeIds/edgeIds/segments and total distance/time. No-route outcomes use `INVALID_START`, `NO_AVAILABLE_SPACE`, or `NO_REACHABLE_SPACE`.

PowerShell example using the local key file:

```powershell
$base = 'http://127.0.0.1:3001'
$map = Invoke-RestMethod "$base/api/map"
$routeBody = @{ expectedEpoch=$map.epoch; expectedRevision=$map.revision; startNodeId='entrance' } | ConvertTo-Json
Invoke-RestMethod "$base/api/route" -Method Post -ContentType 'application/json' -Body $routeBody

$key = (Get-Content '.data/management.key' -Raw).Trim()
$body = @{ expectedEpoch=$map.epoch; expectedRevision=$map.revision; status='occupied' } | ConvertTo-Json
Invoke-RestMethod "$base/api/spaces/space-f5-target" -Method Patch -ContentType 'application/json' -Headers @{Authorization="Bearer $key"} -Body $body
```

Do not log or commit the key. Fresh GET/revision is required before the next mutation. Tokens never belong in a CSV, a WebSocket URL or frontend build variables.

## WebSocket

Connect to `/ws`. Client messages use `protocolVersion:1`.

```javascript
const socket = new WebSocket('ws://127.0.0.1:3001/ws');
let latest;
socket.onopen = () => socket.send(JSON.stringify({type:'subscribe', protocolVersion:1}));
socket.onmessage = ({data}) => {
  const message = JSON.parse(data);
  if (message.type === 'map.snapshot') latest = message.snapshot;
};
// Management clients authenticate with a control message, not a query string:
// socket.send(JSON.stringify({type:'authenticate',protocolVersion:1,token:YOUR_KEY}));
// After 'authenticated', send an availability.set command with expected version:
// {type:'availability.set',protocolVersion:1,requestId:'update-1',command:{expectedEpoch:latest.epoch,expectedRevision:latest.revision,spaceId:'space-f5-target',status:'occupied'}}
```

The server sends `map.snapshot` with reason `initial`, `layout` or `availability`; successful authenticated mutations also receive a request-correlated `command.result`. Errors contain a code/message and optional currentVersion. Reconnect, resubscribe and reload authoritative state after interruption. Duplicate snapshots are harmless; obsolete epochs/revisions must not overwrite current state. Writes through REST and WS follow one validation/session path.

## CSV schema v1

One UTF-8 file, optionally with BOM, uses these columns:

```text
record_type,schema_version,id,label,level,elevation_m,floor_id,node_kind,x_m,y_m,heading_deg,status,edge_kind,from_node_id,to_node_id,direction,length_m,speed_mps,enabled
```

Rows are one map, any floors, any nodes, any edges. Non-applicable cells remain blank. Map rows contain schema_version/id/label; floor rows id/label/level/elevation_m; node rows id/label/floor_id/node_kind/x_m/y_m/heading_deg plus status for spaces; edge rows id/label/edge_kind/from_node_id/to_node_id/direction/length_m/speed_mps/enabled. Booleans are `true`/`false`. Quoted commas/quotes/newlines and UTF-8 labels are preserved. Header order can vary on import but extra/duplicate/missing columns are rejected.

Invalid files are rejected completely with row/column errors where attributable. Only ramps cross floors; their endpoints are ramp landings. Spaces are terminal and have at most one forward parking-access edge. ID references are explicit. A direct 0→5 ramp does not imply exits at 1–4. Download `public/demo-lot.csv` as an example.

## Persistence and limits

Local map data is stored under `.data/` and survives local restarts. A single process serialises mutations; this is not multi-instance production coordination. JSON/CSV and entity counts are bounded. Render's free filesystem does not provide durable hosted persistence, and its backend may sleep/restart. Add an external store before relying on hosted availability. The prototype provides synthetic availability only and never reserves a destination.
