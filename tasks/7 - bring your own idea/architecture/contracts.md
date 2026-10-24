# Parking Navigator — Contract v1

Status: proposed freeze for the foundation task. Updated: 2026-10-24.

[Specification](architecture.md) · [Implementation plan](../plans/plan.md)

These contracts are the single source of names and invariants. The coordinator alone may approve a change. A worker reports a contract issue instead of inventing a second format. Paths below are relative to the proposed `parking-app/` application root; none of the application files exist yet.

## 1. Shared model and validation

The foundation owner implements these types and their runtime schemas in `shared/contracts/model.ts` and `validation.ts`. Wire JSON uses arrays; internal lookup maps must not leak onto the wire.

```typescript
type Id = string;
type NodeKind = 'entrance' | 'junction' | 'ramp_landing' | 'space';
type ParkingStatus = 'free' | 'occupied' | 'closed';
type EdgeKind = 'road' | 'ramp' | 'parking_access';
type Direction = 'forward' | 'reverse' | 'both';
type Point = { x: number; y: number };
type Floor = { id: Id; label: string; level: number; elevationMeters: number };
type Node = {
  id: Id; label: string; kind: NodeKind; floorId: Id;
  x: number; y: number; headingDegrees: number; status?: ParkingStatus;
};
type Edge = {
  id: Id; label: string; kind: EdgeKind; fromNodeId: Id; toNodeId: Id;
  direction: Direction; enabled: boolean; lengthMeters: number; speedMps: number;
};
type ParkingMap = {
  schemaVersion: 1; id: Id; name: string;
  floors: Floor[]; nodes: Node[]; edges: Edge[];
};
type Snapshot = { epoch: string; revision: number; map: ParkingMap };
type ExpectedVersion = { expectedEpoch: string; expectedRevision: number };
type Issue = { code: string; path: string; message: string; row?: number; column?: string };
type Result<T> = { ok: true; value: T } | { ok: false; errors: Issue[] };
type Warning = { code: 'UNCONNECTED_SPACE' | 'DISCONNECTED_NETWORK'; ids: Id[]; message: string };
```

`validateMap(input: unknown): Result<ParkingMap>` returns a detached validated value and rejects unknown object fields. `getMapWarnings(map: ParkingMap): Warning[]` reports disconnected topology without invalidating a partial layout. `canonicalizeMap(map: ParkingMap): ParkingMap` sorts floors by `(level,id)` and nodes/edges by ID; it does not rewrite IDs or labels.

Invariants:

- IDs match `[A-Za-z0-9_-]{1,64}` and are globally unique across map, floor, node and edge entities within one map. This keeps inspector selection unambiguous. References still use the relevant collection. Names/labels are plain UTF-8 strings of 1–120 characters, rendered as text rather than HTML.
- Maps may be empty. Floor levels are unique integers; negative levels are permitted. Elevations are finite; increasing level implies strictly increasing elevation. Coordinates are finite and between -10,000 and 10,000 metres. Heading is in `[0,360)`.
- A space requires `status`; other node kinds must omit it. Changing labels or IDs never introduces implicit graph connections.
- No self-loop edge. All endpoints and floors exist. `road`: same-floor non-space endpoints. `ramp`: different-floor `ramp_landing` endpoints. `parking_access`: same-floor non-space source to space destination, direction `forward`. A space has at most one access edge; an unattached space is allowed with a warning. No other edges touch spaces.
- Length and speed are finite and strictly positive. Road/access length matches 2D endpoint distance within `1e-6` metres. Ramp length is at least the 3D straight-line endpoint distance, using floor elevations, within the same tolerance. Duration is `lengthMeters / speedMps` seconds; round only for display.
- Direction means relative to `fromNodeId → toNodeId`. `reverse` permits only the opposite traversal; `both` permits both. Disabled edges are not traversable. A reverse traversal does not swap stored geometry or IDs.
- At most 32 floors, 5,000 nodes and 10,000 edges. Reject oversized inputs before expensive parsing/search. Input bodies/text are bounded at 2 MiB.

Snapshot revisions and expected revisions are positive safe integers. Epochs are bounded opaque strings generated anew at server startup; compare exact strings, never sort epochs. Edge duration must also be finite and strictly positive; route totals must not overflow. A space placed exactly on a road centreline cannot have a zero-length access edge: ask the operator to place it off the road rather than create an invalid attachment.

Editor defaults, not hardcoded routing rules: road speed 2.78 m/s, ramp speed 1.39 m/s, access speed 1 m/s; grid snap 1 m (operator can turn it off), road attachment tolerance 5 m. Road/access length is derived, not editable. Ramp length is editable and mandatory. Parking rectangles are a rendering convention: 2.5×5 m centred on space coordinates and rotated by `headingDegrees`.

## 2. Routing seam

Implement in `shared/routing/index.ts`; shared declarations belong in `shared/contracts/routing.ts`.

```typescript
type RouteRequest = { startNodeId: Id };
type RouteSegment = {
  edgeId: Id; fromNodeId: Id; toNodeId: Id; kind: EdgeKind;
  fromFloorId: Id; toFloorId: Id; movement: 'flat' | 'up' | 'down';
  distanceMeters: number; durationSeconds: number;
};
type Route = {
  destinationSpaceId: Id; nodeIds: Id[]; edgeIds: Id[];
  segments: RouteSegment[]; totalDistanceMeters: number; totalDurationSeconds: number;
};
type RouteFailureCode = 'INVALID_START' | 'NO_AVAILABLE_SPACE' | 'NO_REACHABLE_SPACE';
type RouteOutcome = { ok: true; route: Route } | { ok: false; code: RouteFailureCode; message: string };
type RouteResponse = { epoch: string; revision: number; outcome: RouteOutcome };
interface RoutingPort { findFastestAvailable(map: ParkingMap, request: RouteRequest): RouteOutcome }
```

Export `routing: RoutingPort`. Input is already structurally valid; validate at transport/import/editor seams, not again per relaxation. Start must identify an entrance, junction or ramp landing. Spaces are terminal destinations, never transit nodes. An occupied/closed space cannot win. `NO_AVAILABLE_SPACE` means there are zero free spaces anywhere; `NO_REACHABLE_SPACE` means free spaces exist but none are reachable legally.

On success, `nodeIds` starts at the requested start and ends at the destination space; `edgeIds` and `segments` have matching order and length, with one fewer entry than `nodeIds`. Segment costs reflect actual traversal direction; total costs are their sums without display rounding.

Use Dijkstra with a min-heap over travel seconds and stable adjacency ordering. Complete all candidate destinations at the best cost before choosing a tie by destination ID. Equal-cost paths to the same destination are chosen by deterministic queue/node/edge ID ordering; do not compare entire path strings or expose heap details. Expected complexity is O((V+E) log V) time and O(V+E) memory. `movement` compares endpoint floor elevations. Pure routing does not reserve a space, mutate a map, authenticate clients or fetch network state.

## 3. Single-file CSV seam

Implement in `shared/csv/index.ts`; declarations belong in `shared/contracts/csv.ts`.

```typescript
interface CsvPort {
  parse(text: string): Result<ParkingMap>;
  serialize(map: ParkingMap): string;
}
```

Export `csv: CsvPort`. Use a CSV parser, not `split(',')`. UTF-8 with optional BOM, LF/CRLF input; canonical output uses CRLF with a final newline. Empty lines may be skipped. Exact header order on export:

```text
record_type,schema_version,id,label,level,elevation_m,floor_id,node_kind,x_m,y_m,heading_deg,status,edge_kind,from_node_id,to_node_id,direction,length_m,speed_mps,enabled
```

- Exactly one `map` row: `schema_version=1`, `id=map.id`, `label=map.name`. Other cells blank.
- `floor` rows: `id,label,level,elevation_m` only.
- `node` rows: `id,label,floor_id,node_kind,x_m,y_m,heading_deg`; `status` only for spaces.
- `edge` rows: `id,label,edge_kind,from_node_id,to_node_id,direction,length_m,speed_mps,enabled`.

Required cells cannot be blank. Non-applicable cells must be blank. Booleans are exactly `true` or `false`; decimal numeric strings must parse to finite values without trailing junk. Import accepts the same header names in any order, rejects duplicate/unknown/missing headers and malformed quote syntax, then validates the complete graph. Forward references are allowed. Rows use 1-based physical starting line numbers, including the header; quoted multiline cells retain their row's starting line. Schema/version and structural issues include row/column when attributable. Reject the entire file on error; never partially replace a draft or live map.

Serialize the canonical model with round-trip-safe numeric precision, correctly quoting commas, quotes and newlines. Stable row order is map, sorted floors, sorted nodes, sorted edges. `parse(serialize(map))` equals `canonicalizeMap(map)` exactly. Spreadsheet formula interpretation is not a supported use: preserve plain labels exactly and document that imports/exports are intended for machine interchange; do not strip prefixes silently.

## 4. Backend seams and transports

Shared declarations: `shared/contracts/transport.ts`. Implement in `server/`.

```typescript
type StoredMap = { revision: number; map: ParkingMap };
interface MapStore {
  load(): Promise<StoredMap | null>;
  save(value: StoredMap): Promise<void>;
}
type AvailabilityCommand = ExpectedVersion & { spaceId: Id; status: ParkingStatus };
type ReplaceMapCommand = ExpectedVersion & { map: ParkingMap };
type ApiError = { error: { code: string; message: string; issues?: Issue[] }; currentVersion?: { epoch: string; revision: number } };
```

`createMapSession({store, seedMap, newEpoch}): Promise<MapSession>` creates an authoritative session from `MapStore`, `ParkingMap` and `newEpoch: () => string`. `MapSession` exposes `getSnapshot(): Snapshot`, `replace(command: ReplaceMapCommand): Promise<Snapshot>`, `setAvailability(command: AvailabilityCommand): Promise<Snapshot>`, `subscribe(listener: (snapshot: Snapshot, reason: 'layout'|'availability') => void): () => void`. Errors are `SessionError` with `code`, HTTP `status`, optional `issues`, optional `currentVersion`; declarations are in `transport.ts`. Store saves are serialised, atomic and awaited before swapping live state/broadcasting. No-op status writes still check the expected version, then return the current snapshot without increment/broadcast. The initial seed revision is 1. Loading preserves the stored revision but generates a new epoch. Epoch is never persisted or exported in CSV.

`createServer({session, routing, csv, managementToken, allowedOrigins}): ServerHandle` takes `MapSession`, `RoutingPort`, `CsvPort`, a nonempty token string and an array of allowed origin strings; it accepts interfaces, not concrete algorithm/CSV imports. `ServerHandle` has a native Node HTTP `httpServer`, `listen({host,port}: {host:string;port:number}): Promise<void>`, and `close(): Promise<void>`. Tests read `httpServer.address()` after listening on port 0. Node handle/error implementations stay in `server/`; shared schemas have no runtime Node imports. Production wiring happens only in T6. Read snapshots are detached copies; callers cannot mutate session state through a reference.

REST routes:

- `GET /health` → 200 `{ok:true}`; no token required.
- `GET /api/map` → 200 `Snapshot`.
- `PUT /api/map`, JSON `ReplaceMapCommand` → 200 `Snapshot`.
- `GET /api/map.csv` → 200 UTF-8 CSV with attachment filename.
- `POST /api/map/import`, JSON `ExpectedVersion & {csv:string}` → 200 `Snapshot`; this is an explicit authenticated live replacement, separate from the browser's draft import.
- `PATCH /api/spaces/:spaceId`, JSON `ExpectedVersion & {status:ParkingStatus}` → 200 `Snapshot`.
- `POST /api/route`, JSON `ExpectedVersion & RouteRequest` → 200 `RouteResponse` for successful routing **or domain no-route outcomes**. The supplied version must match the authoritative map before routing.

Transport failures: invalid body/graph/CSV → 400 `INVALID_INPUT`; unknown space ID → 404 `SPACE_NOT_FOUND`; non-space target → 400 `NOT_A_SPACE`; stale epoch/revision → 409 `VERSION_CONFLICT`; missing/wrong management token → 401 `UNAUTHORIZED`; oversized body → 413 `INPUT_TOO_LARGE`; persistence failure → 500 `PERSISTENCE_FAILED` with no mutation/broadcast. Unexpected internals return a generic 500 without paths/tokens/stack traces. Version conflicts provide the current version, not an automatic retry. Validate unknown request fields. Reject invalid method/path combinations normally.

`/ws` WebSocket messages are JSON and versioned:

```typescript
type WsClientMessage =
  | { type: 'subscribe'; protocolVersion: 1 }
  | { type: 'authenticate'; protocolVersion: 1; token: string }
  | { type: 'availability.set'; protocolVersion: 1; requestId: string; command: AvailabilityCommand };
type WsServerMessage =
  | { type: 'map.snapshot'; protocolVersion: 1; reason: 'initial'|'layout'|'availability'; snapshot: Snapshot }
  | { type: 'authenticated'; protocolVersion: 1 }
  | { type: 'command.result'; protocolVersion: 1; requestId: string; snapshot: Snapshot }
  | { type: 'error'; protocolVersion: 1; requestId?: string; code: string; message: string; currentVersion?: {epoch:string;revision:number} };
```

Subscriptions are read-only and public for synthetic demo data. Subscribe returns a current full snapshot and receives committed changes; registration and initial snapshot are ordered so no mutation falls into a gap. Authenticate using a control message, never a URL token. Mutations require a successful authentication state and call the same `setAvailability` as REST. A successful command acknowledges its request ID; any snapshot broadcast is applied idempotently by revision. Failures do not change state. Reject unknown type/version/fields, oversized messages and origins not allowed. There is no command replay cache; on conflict/reconnect, reload before issuing a new command. Send protocol ping every 30 seconds and terminate unresponsive connections; browser protocol pong handling is automatic. Cleanup sockets/listeners on server shutdown.

Require `MANAGEMENT_TOKEN` for writes. In local development the coordinator generates/provides it outside tracked files; management enters it in the UI and the client keeps it **in memory only**. Driver reads need no token. No hardcoded demo secret, browser build-time token or token logging. Restrict WebSocket Origin and REST browser origins to configured local/hosted origins; allow non-browser integrations with no Origin only with token on mutations. CORS/Origin is not authentication. No public deployment is authorised by this contract.

## 5. Frontend seams

Framework-independent client declarations belong in `shared/contracts/client.ts`:

```typescript
interface ParkingApi {
  getMap(): Promise<Snapshot>;
  replaceMap(command: ReplaceMapCommand, token: string): Promise<Snapshot>;
  setAvailability(command: AvailabilityCommand, token: string): Promise<Snapshot>;
  getRoute(command: ExpectedVersion & RouteRequest): Promise<RouteResponse>;
}
type ConnectionState = 'connecting'|'live'|'reconnecting'|'offline';
interface LiveMapClient {
  subscribe(onSnapshot: (snapshot: Snapshot) => void, onState: (state: ConnectionState) => void): () => void;
}
```

The REST adapter throws `ApiClientError` preserving `ApiError` code/status/currentVersion. The live client reconnects with exponential delay from 1 second up to 30 seconds plus bounded jitter, clears obsolete sockets/timers on unsubscribe, resubscribes and fetches a fresh map. Same-epoch snapshots replace only lower revisions; a new epoch replaces old state after authoritative resync. Guard callbacks with a connection generation so old sockets/requests cannot reinstate a previous epoch. Ignore duplicate/out-of-order revisions and late route responses not matching the displayed snapshot **and latest selected start/request**. Transport adapters derive same-origin URLs by default; development Vite proxies `/api`, `/health`, `/ws` with WS upgrades to the local backend. Optional public base URL config must not embed credentials.

React-only declarations belong in `client/ui-contracts.ts`, separate from pure shared types:

- `MapCanvasProps`: `{ map: ParkingMap; floorId: Id; selectedId?: Id; route?: Route; onSelect?: (id: Id) => void; onBackgroundPoint?: (point: Point) => void; onMoveNode?: (id: Id, point: Point) => void; readOnly: boolean }`.
- `MapRenderer` is a React component accepting `MapCanvasProps`.
- `BuilderViewProps`: `{ snapshot: Snapshot; csv: CsvPort; api: ParkingApi; managementToken: string; Renderer: MapRenderer; onSaved: (snapshot: Snapshot) => void }`.
- `DriverViewProps`: `{ snapshot: Snapshot; connectionState: ConnectionState; api: ParkingApi; Renderer: MapRenderer }`.

T0 also declares browser adapter `ClientOptions` in `client/ui-contracts.ts`: `{ baseUrl?: string; fetchImpl?: typeof fetch; webSocketFactory?: (url: string) => WebSocket; timers?: Pick<typeof globalThis, 'setTimeout'|'clearTimeout'>; random?: () => number }`. T3 exports `MapCanvas` and `BuilderView`. T5 exports `DriverView`, `createParkingApi(options?: ClientOptions): ParkingApi` and `createLiveMapClient(options?: ClientOptions): LiveMapClient`; both factories use the browser origin and real browser dependencies when omitted. Tests inject transport/time/random dependencies. Renderer is injected, so T5 never imports T3's unfinished implementation. Shell T6 owns the authoritative snapshot, connection state and in-memory management token, and passes them to views.

Builder state is a detached draft plus base epoch/revision and undo history. Live snapshots do not overwrite a dirty draft. Save uses the draft's base version; on 409 preserve draft and offer export/reload. New/CSV imports are drafts until saved. A clean draft follows the latest snapshot. Dirty edits and token are not sent by WebSocket. Persist draft map only in browser localStorage under `parking-navigator:draft:v1`; do not persist token or treat recovered drafts as authoritative.

## 6. Contract ownership and change policy

T0 owns `shared/contracts/**`, `client/ui-contracts.ts`, root configs, dependency manifest and lockfile. T1–T5 only edit their assigned module/test directories. A contract change requires coordinator approval, an updated document/schema/fixture, notification to every consumer, and a narrow contract-test rerun before the affected wave resumes. Test fakes must implement the actual interfaces, not alternative handwritten JSON shapes.

Future 3D can reuse metres/elevation/stable graph IDs, but richer ramp geometry and vehicle policy need a new schema version. Future A* needs a proved admissible time heuristic for these weighted multi-floor graphs; simply using screen distance is not an approved shortcut.
