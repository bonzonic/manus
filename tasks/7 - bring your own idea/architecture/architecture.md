# Parking Navigator — Product and Architecture

Status: proposed implementation specification, awaiting plan review. Updated: 2026-10-24.

[Implementation plan](../plans/plan.md) · [Frozen contracts](contracts.md) · [Agent dispatch briefs](../outputs/agent-briefs.md)

## Intent and agreed scope

Build a plain-local website and backend that lets an operator draw a 2D parking lot and its roads, transfer the complete layout through CSV, and direct a driver to the fastest reachable available parking space. Fake data is sufficient. The user selected a portable React/Vite frontend and Node/Express backend with WebSockets; Render is a later hosting option, not an instruction to deploy now.

The initial experience has two views in one application: **Builder** for management and **Find parking** for drivers. A seeded six-floor lot makes the complete flow immediately demonstrable. Operators can also start from an empty lot. The user specifically requires ramps that go up/down floors and can connect directly to floor 5. Floor connectivity must be authored, never inferred from proximity or consecutive floor numbers.

The current deliverable is the implementation plan and its contracts. No application scaffolding, dependency installation, Git initialization, agent execution, account creation or public deployment is part of this planning pass.

## Decisions: user requirements versus engineering defaults

**User requirements:** website is sufficient; 2D road/parking builder; easy CSV input/output; multi-floor ramps including a long ramp to floor 5; REST/WebSocket integration for management; Dijkstra or A* for shortest/fastest routing; synthetic data; direct routing first, extensible later.

**Proposed engineering defaults:** React + TypeScript + Vite; Express + TypeScript + `ws`; SVG rather than a map SDK or canvas engine; metres as model coordinates; Dijkstra weighted by authored travel time; single-process authoritative backend; local file persistence plus browser drafts; revision-checked mutations; selectable entrance/junction as the driver's position. Exact package versions are to be resolved compatibly and committed in one lockfile by the foundation owner, not guessed here.

**Deferred:** 3D editing/simulation, GPS localisation, real sensors, waiting-car detection, active space-taking detection, reservations, automatic rerouting while driving, traffic/congestion estimates, OKU/accessibility allocation rules, payments, user accounts, multiple tenants, multi-instance coordination and production uptime guarantees. Do not implement speculative policy modules. Preserve stable IDs, elevations and explicit occupancy states so future work can extend the model.

## Observable first-version behaviour

### Builder

Create a lot; add, rename and remove floors; add entrances, road junctions and spaces. Draw straight road segments by placing/selecting endpoints. Longer or curved-looking roads are a chain of straight segments. Shared endpoints connect roads; crossing lines do **not** connect unless the operator explicitly uses a shared junction. Tooltips and disconnected-network warnings make this distinction visible.

Select and drag nodes on a floor. Road/access lengths are recalculated after moves. A move that makes a ramp shorter than the straight-line 3D endpoint distance is rejected with a useful error. Support one-way/two-way roads, enable/disable edges, and free/occupied/closed spaces. Delete a node together with its incident edges after confirmation; remove an occupied floor only after a summary of the nodes/edges that will be deleted. Escape cancels a drawing gesture; undo/redo operates on complete validated draft transactions.

Place a space near a same-floor road using a **5 metre** attachment tolerance. The builder previews attachment, splits the selected road at the projection point if needed, and creates a forward parking-access edge. Preserve road direction and speed when splitting. A space placed farther away remains explicitly unconnected until attached; show a warning and never fabricate a route to it. If roads are ambiguous, the operator selects the attachment road. Spaces cannot be used as through-roads.

Create a ramp by selecting a source landing, switching/selecting a destination floor, selecting a destination landing, and entering real modelled ramp length, speed and allowed direction. The wizard can create landings or promote selected junctions to `ramp_landing` in the same validated transaction, retaining their road connections; it cannot promote a space. Floors need not be consecutive. Show both endpoint markers, counterpart floor names, travel time and up/down direction. A direct ground-to-floor-5 ramp has no exit at floors 1–4; represent intermediate exits as separate landings and ramp edges.

Offer pointer tools and a keyboard-accessible inspector/entity list for the same meaningful actions: add/edit coordinates, select endpoints, create an edge/ramp, change status and delete. Do not claim keyboard access merely because the toolbar is focusable.

### CSV portability

One UTF-8 CSV file contains lot metadata, floors, nodes and edges. Stable IDs preserve every connection; CSV must round-trip geometry, directions, enabled flags, space states, ramp lengths/speeds and floor elevations. Parsing is all-or-nothing with row/column errors. Import creates/replaces a **draft**, not live server state. Operators review warnings then explicitly save. Export exports the current draft and identifies whether it differs from the saved map.

The schema in [contracts](contracts.md) is authoritative. Unknown schema versions or unexpected columns/fields are rejected rather than silently discarded. Quoted commas/newlines and UTF-8 labels are supported. The downloaded seed fixture gives another team a reusable example of the exchange format.

### Driver routing

Choose an entrance, junction or ramp landing as the current position. Click **Find closest available space**. “Closest” means the **lowest total modelled travel time over legal roads and ramps**, not straight-line distance and not the lowest floor. The driver view explains that distinction.

Return the destination label and floor, modelled distance/time, a floor-specific highlighted path and ordered directions. Ramps produce explicit instructions such as “Take Ramp Express up from Ground to Floor 5.” Floor tabs and step selection reveal each part of the route; never draw a fictitious road through intervening floors. Provide an optional **Advance to next step** demo action, which changes the current position only at graph nodes. This is synthetic guidance, not live vehicle tracking.

Occupied/closed spaces and disabled edges cannot be selected. Disconnected free spaces cannot win. Return distinct empty/error states for no free spaces, free spaces with no reachable path, and invalid start node. Ties use stable IDs so fixture results remain deterministic.

A route is tied to the map's epoch/revision and is **not a reservation**. On a newer snapshot or connection loss, mark the route stale, disable advancement, and offer explicit recalculation after resynchronisation. Do not automatically change the driver's destination or mark their target taken. Reservation and rerouting policy remain future work.

### Management integration and fake data

The backend serves a real REST interface for map reads/replacements, CSV exchange, availability updates and route calculation. A real WebSocket endpoint broadcasts authoritative snapshots and accepts authenticated availability updates. Both transports call the same validation and mutation path. Schema and sample payloads travel with the application.

For the demo, management can toggle a space's status without any sensor. The resulting update must reach a second connected client. The builder draft and the authoritative map are separate: live updates do not silently overwrite unsaved edits. A stale save is rejected and the operator can export the draft before reloading the live map; there is no automatic merge in v1.

## Model and invariants

Use explicit graph nodes (`entrance`, `junction`, `ramp_landing`, `space`) and edges (`road`, `ramp`, `parking_access`). Each node has one floor and metre coordinates. Floors have display labels, ordered level numbers and elevation in metres. IDs are opaque strings, not array indexes or display labels.

Only ramps connect different floors. Road and parking-access geometry stays on one floor. Access edges end at a space and are terminal forward edges. Every space has a status; non-space nodes have no status. Every edge has finite positive length and speed, a direction and an enabled flag. Roads/access lengths match their endpoint distance; ramp length is authored and must be at least its straight-line 3D endpoint distance. Equal screen positions on different floors do not connect.

Invalid structural graphs are rejected before becoming drafts/live maps. Disconnection is a warning, not invalid structure: a partially built lot can be saved but unreachable spaces cannot be routed to. Proposed safety limits are 32 floors, 5,000 nodes, 10,000 edges and 2 MiB per CSV/JSON map input. These are demo safety limits, not physical parking regulations.

## Module seams and data flow

```text
Builder draft ---- CSV module ---- transferable .csv
     |
     | explicit revision-checked save
     v
REST / WebSocket ---- authoritative map session ---- MapStore
                             |
                             | immutable snapshot
                             v
                         routing module
                             |
                             v
Driver client ---- route result + SVG renderer
```

`shared/contracts` defines pure schemas and interfaces. `shared/routing` hides graph search; `shared/csv` hides exchange-format details. `client/builder` owns authoring transactions. `server` owns validation, authentication, serial mutation, persistence and transport. `client/driver` owns driver state and the REST/WebSocket adapter. The SVG renderer is injected into the driver view, and routing/CSV modules are injected into the server, so agents can build against contracts and test fakes without waiting for each other's implementations.

The single process serialises writes, persists before announcing success, then increments/publishes the snapshot revision. `MapStore` has memory and local-file adapters. Local-file data survives normal local restarts. Render's free server filesystem is ephemeral; do not promise durable hosted storage without adding an external store. A server restart generates a new epoch so stale clients cannot accidentally write against a reused revision.

## Proposed interface design

Design direction: **parking wayfinding meets a technical drawing board**, with the map as the main working surface, not a marketing landing page. This is an engineering proposal, not a user-selected brand.

A fixed compact tool strip sits left of the map; floor controls sit above it; a right inspector shows the selected entity, attachment/ramp details or route directions. In driver mode the inspector becomes a focused route card. On small screens the inspector becomes a collapsible bottom section; building is desktop-first but driver navigation must remain usable at phone width.

```text
Builder: [mode / lot name / connection] [Import] [Export] [Save]
         [tools] [floor tabs | large SVG drawing surface] [inspector]
Driver:  [current position / Find closest available space]
         [floor tabs | highlighted SVG path] [destination + steps]
```

Suggested tokens: paper `#F4F7F8`, ink `#18323D`, asphalt `#536570`, route blue `#176B87`, free green `#23734D`, alert amber `#9A5B00`. Occupied spaces use a hatch/X plus a label, and closed spaces use a barred symbol; no information depends on colour alone. Use Segoe UI/system sans for interface copy and a system monospace face for IDs/metre values, with no remote font dependency. Base spacing 4 px; ordinary controls 8 px corner radius; map entities stay square/technical. Body 16 px, labels 14 px, headings 24–32 px. Inspector shadow only; avoid decorative cards around every metric.

Use visible focus, text/geometry contrast checks, 44 px touch targets for primary mobile actions, and `prefers-reduced-motion`. Selection/floor transitions last 120–180 ms; no background animation. Words are concrete: “Save layout”, “Attach to road”, “Ramp destination floor”. Failures explain recovery: “Layout changed on the server. Export your draft, then reload the saved layout.” Actual accessibility compliance remains to be tested, not certified by this plan.

## Demo and delivery

Seed Ground plus Floors 1–5, ordinary adjacent-floor ramps, a two-way direct Ground↔Floor-5 express ramp, a one-way road, occupied/closed spaces and one disconnected free space. Ground has no free space initially. A hand-authored fixture provides a reachable floor-1 space at 90 seconds and a floor-5 space at 60 seconds, so the express-ramp route wins despite the higher floor. Mark floor-5 occupied and recalculate to floor 1; disable express-ramp traversal and demonstrate an alternate result. A reverse-direction fixture demonstrates descent.

Demonstrate a fresh lot built with a road, attached space and ramp; CSV export/reimport equality; the fastest route; a live update received by two clients; a stale save rejected; and no-reachable-space recovery. Hand off source, seed CSV, integration examples, local start/build commands and known limitations. Prepare optional Render configuration but do not create accounts or publish.

Hosting facts already checked: [Render free limits](https://render.com/docs/free) and [Render WebSockets](https://render.com/docs/websocket). This architecture does not depend on Manus-managed application services.
