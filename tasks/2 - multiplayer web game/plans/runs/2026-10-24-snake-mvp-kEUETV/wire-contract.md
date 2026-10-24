---
work_item: 2026-10-24-snake-mvp-kEUETV
contract_status: setup-level executable interface freeze for Route B
source: ../plan.md and ../handoff.md
---

# Snake MVP Route B wire and seam contract

This is a minimal implementation contract for the two parallel lanes. It preserves the frozen owner plan; it does not replace the plan, authorize product code, or prove a running server. JSON is versioned and UTF-8 over WebSocket. The server is authoritative for every gameplay value.

## 1. Envelope and enums

Every message has exactly these common fields unless the message table says otherwise:

```json
{"v":1,"type":"<message-type>"}
```

`v` is the protocol version and must equal `1`. `type` is one of `hello`, `turn`, `ready`, `rematch`, `leave`, `welcome`, `inputAck`, `snapshot`, `effect`, `result`, or `error`. Client validators reject malformed JSON, unknown message types, wrong scalar types, overlong strings, and claimed authoritative state. Server validators reject unsupported versions rather than silently downgrading.

Canonical enums:

- `seat`: `P1` or `P2`.
- `phase`: `LOBBY`, `COUNTDOWN`, `PLAYING`, `PAUSED`, `RESUMING`, `RESULTS`, or `ABANDONED`.
- `dir`: `UP`, `RIGHT`, `DOWN`, or `LEFT`.
- `disposition`: `ACCEPTED` or `REJECTED`.
- `winner`: `P1`, `P2`, or `null`.
- `reason`: `WALL`, `BODY`, `HEAD_ON`, `HEAD_SWAP`, `SIMULTANEOUS_DEATH`, `TIMEOUT_LENGTH`, `TIMEOUT_DRAW`, `BOARD_FULL`, `FORFEIT_DISCONNECT`, `ABANDONED`, or `SERVER_LOSS`.
- `error.code`: `BAD_JSON`, `BAD_MESSAGE`, `BAD_ORIGIN`, `ROOM_INVALID`, `ROOM_FULL`, `ROOM_EXPIRED`, `NOT_MEMBER`, `STALE_ROUND`, `STALE_EPOCH`, `BAD_SEQUENCE`, `BAD_DIRECTION`, `QUEUE_FULL`, `RATE_LIMIT`, `MESSAGE_TOO_LARGE`, `PHASE_REJECTED`, `CREDENTIAL_INVALID`, or `SERVER_UNAVAILABLE`.

Opaque IDs are URL-safe strings: `roomId`, `roundId`, `effectId`, and `requestId`. `roomCode` is exactly eight uppercase alphanumeric characters. A `cell` is `[x,y]` with integer coordinates. A `body` is an ordered array of cells from tail to head. A `credential` is a tab-scoped 256-bit random value encoded as base64url; it is never placed in a room link, query string, log, snapshot, or result.

## 2. Client-to-server messages

Unknown client keys are rejected for gameplay commands; clients never send body, head, length, score, speed, boost expiry, outcome, winner, or phase claims.

### `hello`

Create or join a room, or resume the same seat over a new socket. `roomCode` is optional for create and required for a new join. `credential` and `epoch` are present only for a same-seat resume and travel in this WSS message, never in a link or URL.

```json
{
  "v":1,
  "type":"hello",
  "requestId":"h-1",
  "mode":"CREATE",
  "roomCode":"AB12CD34",
  "credential":"<base64url-256-bit>",
  "epoch":4
}
```

Required: `v`, `type`, `requestId`, `mode`. Conditional: `roomCode` for `JOIN`; `credential` and `epoch` together for `RESUME`. `mode` is `CREATE`, `JOIN`, or `RESUME`. A shared invite contains only the room code or an opaque room path; it contains no credential.

### `turn`

```json
{
  "v":1,
  "type":"turn",
  "requestId":"t-17",
  "roundId":"r-9",
  "epoch":4,
  "seq":17,
  "dir":"UP"
}
```

All fields shown are required. `seq` increases per seat and round. The server compares `dir` with the last queued direction or current direction, ignores duplicates, rejects exact reversals and a third future turn, and acknowledges every disposition. A turn is only intent; it never carries a coordinate or outcome.

### `ready`, `rematch`, and `leave`

```json
{"v":1,"type":"ready","requestId":"ready-1","roundId":"r-9","epoch":4}
{"v":1,"type":"rematch","requestId":"again-1","roundId":"r-9","epoch":4}
{"v":1,"type":"leave","requestId":"leave-1","roundId":"r-9","epoch":4}
```

All shown fields are required. Duplicate `ready` and `rematch` requests are idempotent for the current phase; stale round/epoch requests do not mutate state. A leave is explicit and cannot be reinterpreted by the client as a win.

## 3. Server-to-client messages

### `welcome`

`welcome` is the only message that may carry the new tab-scoped `credential`.

```json
{
  "v":1,
  "type":"welcome",
  "roomId":"room-1",
  "roomCode":"AB12CD34",
  "seat":"P1",
  "credential":"<base64url-256-bit>",
  "epoch":1,
  "roundId":"r-9",
  "phase":"LOBBY",
  "serverTick":0,
  "board":{"w":40,"h":24},
  "rules":{"baseRate":6,"boostRate":9,"boostTicks":240,"maxQueue":2,"timeoutTicks":432000},
  "players":[
    {"seat":"P1","label":"Player 1","connected":true,"ready":false},
    {"seat":"P2","label":"Waiting for teammate","connected":false,"ready":false}
  ]
}
```

Required: all fields shown. `credential` is omitted on a resume if the existing tab credential remains valid; a resume still returns the current `epoch`. `timeoutTicks` is 120 active seconds at 60 Hz. No other seat credential appears.

### `inputAck`

```json
{
  "v":1,
  "type":"inputAck",
  "roomId":"room-1",
  "roundId":"r-9",
  "epoch":4,
  "requestId":"t-17",
  "seq":17,
  "disposition":"ACCEPTED",
  "reasonCode":null,
  "serverTick":812,
  "lastAcceptedSeq":17,
  "lastAppliedSeq":15
}
```

Required: all fields shown. For rejection, `disposition` is `REJECTED` and `reasonCode` is one of `BAD_SEQUENCE`, `BAD_DIRECTION`, `QUEUE_FULL`, `STALE_ROUND`, `STALE_EPOCH`, `PHASE_REJECTED`, or `RATE_LIMIT`; the authoritative sequence values still describe the server state. `lastAppliedSeq` is the latest turn actually consumed by a movement step, not merely accepted.

### `snapshot`

A snapshot is the canonical render state and is also sufficient to recover a missed `effect` or `result`. The server emits at most 15 full snapshots per second per active room, subject to the output bound.

```json
{
  "v":1,
  "type":"snapshot",
  "roomId":"room-1",
  "roundId":"r-9",
  "phase":"PLAYING",
  "revision":812,
  "serverTick":812,
  "activeTicks":600,
  "board":{"w":40,"h":24},
  "snakes":[
    {
      "seat":"P1",
      "body":[[5,10],[6,10],[7,10],[8,10],[9,10]],
      "dir":"RIGHT",
      "queuedDirs":["UP"],
      "movementCredit":24,
      "lastAcceptedSeq":17,
      "lastAppliedSeq":15,
      "length":5,
      "apples":0,
      "boostUntilTick":null
    },
    {
      "seat":"P2",
      "body":[[34,13],[33,13],[32,13],[31,13],[30,13]],
      "dir":"LEFT",
      "queuedDirs":[],
      "movementCredit":12,
      "lastAcceptedSeq":8,
      "lastAppliedSeq":8,
      "length":5,
      "apples":0,
      "boostUntilTick":null
    }
  ],
  "food":{
    "apples":[{"id":"a-1","cell":[20,7]}],
    "mushrooms":[{"id":"m-1","cell":[22,16]}]
  },
  "outcome":null
}
```

Required: all top-level fields shown. `snakes` contains exactly the currently visible seats; each body is authoritative tail-to-head. `queuedDirs` has at most two entries. `length` equals body length and is repeated for a small client/HUD surface; it is never accepted from a client. `boostUntilTick` is null or an absolute server tick and freezes while the phase is paused. `outcome` is null until terminal state, then contains the same result fields defined below. If the server has no room state after a restart, it sends an error; it does not invent a result.

### `effect`

Effects are presentation hints only and never replace a snapshot.

```json
{
  "v":1,
  "type":"effect",
  "roomId":"room-1",
  "roundId":"r-9",
  "serverTick":812,
  "effectId":"e-3",
  "kind":"APPLE_COLLECTED",
  "seat":"P1",
  "foodId":"a-1",
  "cell":[20,7],
  "boostUntilTick":null
}
```

Required: `v`, `type`, `roomId`, `roundId`, `serverTick`, `effectId`, `kind`, `seat`, `foodId`, and `cell`. `boostUntilTick` is required and non-null for `MUSHROOM_COLLECTED` or `BOOST_REFRESHED`, null for an apple. The client may announce the effect only after receiving it; it may not award growth, speed, or score from the effect alone.

### `result`

```json
{
  "v":1,
  "type":"result",
  "roomId":"room-1",
  "roundId":"r-9",
  "reason":"HEAD_ON",
  "winner":null,
  "final":{
    "P1":{"length":7,"apples":2},
    "P2":{"length":7,"apples":1}
  },
  "rematch":{"P1":false,"P2":false}
}
```

Required: all fields shown. `winner` is null for draws and abandonment/server-loss states. Results freeze play. A fresh round ID and countdown are sent only after both seats opt into rematch.

### `error`

```json
{
  "v":1,
  "type":"error",
  "code":"ROOM_FULL",
  "message":"This room is full.",
  "retryable":false,
  "requestId":"h-1"
}
```

Required: `v`, `type`, `code`, `message`, and `retryable`; `requestId` is echoed when the error belongs to a request. Messages are bounded, actionable, and never contain credentials or untrusted raw payloads.

## 4. Frozen server rule/API seam

The application lane exports pure, socket-free rule functions from `server/game/rules.js`:

```js
export function createRound(config, randomSource) -> RoundState;
export function acceptTurn(state, seat, command) -> { state, disposition, reasonCode, lastAcceptedSeq };
export function step(state, tick) -> { state, events };
export function resolveOutcome(state) -> Outcome | null;
```

`createRound` uses the 40×24 arena, mirrored five-cell spawns, deterministic `randomSource` in fixtures, six-cell/second base rate, and the current round identity. `acceptTurn` enforces direction, sequence, duplicate, reversal, and two-command queue rules without mutating an opponent. `step` advances one 60 Hz tick, adds rate to integer movement credit, builds all due heads from one pre-step state, resolves wall/body/head-on/head-swap atomically, skips terminal pickups, then commits legal moves, resolves food once, updates boost, replenishes legal cells, and checks board-full/timeout. `resolveOutcome` applies collision priority, survivor, simultaneous-death, timeout-length, equal-draw, and `BOARD_FULL` rules.

The arena seam in `server/game/arena.js` exports:

```js
export function createArenaPolicy({width, height}) -> ArenaPolicy;
export function containsCell(policy, cell) -> boolean;
export function cellKey(cell) -> string;
export function occupiedCells(state) -> Set<string>;
export function legalFoodCells(state) -> Cell[];
export function isBoardFull(state) -> boolean;
```

The transport/protocol seam exports from `server/protocol/validate.js`:

```js
export function parseClientMessage(raw, limits) -> ParsedMessage | ErrorCode;
export function validateOrigin(origin, allowedOrigins) -> boolean;
export function validateTurn(message, roomState) -> ValidationResult;
export function validateRequestId(requestId) -> boolean;
```

The room seam in `server/rooms/room-manager.js` exports:

```js
export function createRoom(config) -> RoomManager;
export function joinRoom(manager, roomCode, connection) -> AdmissionResult;
export function handleHello(manager, connection, message) -> ServerMessage[];
export function handleReady(manager, connection, message) -> ServerMessage[];
export function handleRematch(manager, connection, message) -> ServerMessage[];
export function handleLeave(manager, connection, message) -> ServerMessage[];
export function disconnectSeat(manager, connection, nowTick) -> ServerMessage[];
export function tickRooms(manager, nowTick) -> ServerMessage[];
```

The browser model in `public/client-model.js` is deterministic and DOM-free:

```js
export function createClientModel() -> ClientModel;
export function applyWelcome(model, message) -> ClientModel;
export function applySnapshot(model, message) -> ClientModel;
export function applyInputAck(model, message) -> ClientModel;
export function applyEffect(model, message) -> ClientModel;
export function applyResult(model, message) -> ClientModel;
export function applyError(model, message) -> ClientModel;
export function queueTurn(model, dir, nowMs) -> ClientModel;
export function resetPresentationIntent(model) -> ClientModel;
export function getPresentationState(model, nowMs) -> PresentationState;
```

The browser transport and view seams are:

```js
// public/protocol-client.js
export function connectSocket(url, handlers) -> SocketController;
export function sendHello(controller, message);
export function sendTurn(controller, message);
export function sendReady(controller, message);
export function sendRematch(controller, message);
export function sendLeave(controller, message);

// public/board-renderer.js
export function renderBoard(canvas, snapshot, presentation) -> void;

// public/dom-renderer.js
export function renderPhase(model, document) -> void;
export function renderHud(model, document) -> void;
export function renderAnnouncement(model, document) -> void;
export function renderResult(model, document) -> void;
export function renderConnection(model, document) -> void;
```

`public/app.js` owns browser bootstrap, DOM event binding, same-origin socket URL derivation, and calls these seams. It is the only behavioral browser entry. No client API may manufacture an authoritative body, score, boost, death, victory, result, or opponent state.

## 5. Stable DOM contract for the static lane

The static lane owns `public/index.html` and must provide these exact IDs; the application lane may only consume them:

```text
#app-shell
#room-code #copy-invite #round-phase #countdown-label #connection-chip #latency-note
#entry-panel #create-room-button #join-room-panel #join-room-code #paste-invite-link
#lobby-panel #player-one-card #player-two-card #ready-button
#countdown-overlay #arena-frame #arena-canvas #arena-focus-target #game-announcement
#hud #length-player-one #apples-player-one #boost-player-one
#length-player-two #apples-player-two #boost-player-two #turn-queue
#keyboard-help #direction-pad
#pause-overlay #pause-title #pause-message
#results-panel #result-title #result-reason #result-player-one #result-player-two
#rematch-panel #rematch-button #rematch-status
#error-panel #error-title #error-message #error-action #modal-layer
```

`#entry-panel`, `#lobby-panel`, `#countdown-overlay`, `#pause-overlay`, `#results-panel`, `#rematch-panel`, and `#error-panel` must be distinct lifecycle surfaces, not one generic modal. `#arena-canvas` is the 40×24 board surface. `#game-announcement` is `aria-live="polite"`; terminal result/error announcements may use `aria-live="assertive"`. The direction pad has four real labelled buttons. The static lane uses original CSS/inline SVG shapes and no external icon/image dependency. It does not add behavioral JavaScript.

## 6. Proposed package/manifest and Render seam

No package existed at owner time. The application lane proposes a native-ESM `package.json` with Node `>=22.12.0 <23`, exact-pinned `ws` as the sole runtime dependency, and these scripts:

```json
{
  "start":"node server/index.js",
  "test:rules":"node --test test/rules",
  "test:rooms":"node --test test/rooms",
  "test:transport":"node --test test/transport",
  "test:client":"node --test test/client",
  "test:security":"node --test test/security",
  "test":"node --test test"
}
```

There is intentionally no bundler or build script in the smallest design. `public/manifest.webmanifest` is static-lane-owned and may contain only the app name, start URL, standalone display, and the approved ink-night theme/background; no downloaded icons are required. The exact `ws` version, lockfile, and any Render build command are discovered and pinned by the admitted application lane, not invented by this owner document.

The future Render recommendation is one Free Node Web Service: HTTP static serving and `/ws` upgrade on one server/port, `0.0.0.0`, `process.env.PORT`, fast unauthenticated `/healthz`, exact trusted `ALLOWED_ORIGINS`, no database/disk/Redis/worker/cron, and no synthetic keepalive. A proposed `render.yaml` may document those fields only after package discovery. It must not claim a service URL, deployment, account setup, or public HTTPS/WSS evidence.

## 7. Bounds and test obligations

The application lane implements and tests the frozen limits: 4 KiB client input, 32 KiB snapshots, 64 KiB output queue per socket, two future turn commands per seat, at most 64 retained control IDs per seat, bounded reconnect episodes/grace, trusted Origin, membership, round/epoch/sequence checks, and slow-peer disconnect. It creates deterministic fixtures for queued legal turns/reversal, same-cell food contention, apple growth, mushroom refresh/expiry/pause, mixed-speed due movement, stationary-head body collision, head-on/head-swap, start-of-step tail occupancy, simultaneous death, timeout, board-full, stale sequence/epoch/round, duplicate ready/rematch, reconnect/old-socket control loss, malformed/oversized/flooded traffic, and snapshot/output bounds.

Real TDD is mandatory for the application lane: each behavior begins with a failing scoped test, then the smallest implementation, then the changed-file test rerun. No full shared-repository suite is required or allowed in this stage. The static HTML/CSS lane has the narrow exception described in the amendment; any behavioral JavaScript invalidates that exception. Browser SDK raw CDP/eval is unavailable and no latency driver is claimed. Playwright may be pinned later only for an authorized, project-bound safe-key/latency check; S10 still requires a fresh verifier over actual authorized HTTPS/WSS.
