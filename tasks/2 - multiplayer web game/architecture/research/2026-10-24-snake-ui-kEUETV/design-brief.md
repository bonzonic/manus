---
id: 2026-10-24-snake-ui-kEUETV
task: 2 - multiplayer web game
status: supporting design brief
scope: client visual direction and interaction states only
contract_source: ../../../plans/runs/2026-10-24-snake-mvp-kEUETV/handoff.md
---

# Snake client design brief

## Recommendation: “Wayfinder Grid”

Use a compact arcade field-guide aesthetic: a dark indigo game board framed by warm paper-colored panels, with one strong visual anchor—the live 40×24 arena as a marked expedition map. The interface should feel like two people sharing a physical board, not like a generic neon dashboard. Keep the board visually dominant; use crisp labels, small status chips, and short action copy around it.

This is a visual/client recommendation only. It does not change the frozen rules, protocol, lifecycle, acceptance criteria, hosting decision, or server authority in the owner handoff. There is no existing playable client to evaluate in this stage; the current task-root architecture is a superseded Treasure Sprint draft, while the Snake handoff is the governing contract.

## Design system

- **Ink night `#101827`** — page background, board cells, high-contrast outlines.
- **Slate blue `#1F3044`** — cards, board frame, inactive controls.
- **Warm paper `#F4F0E8`** — primary text and result surfaces; use dark ink text on paper.
- **Coral `#F06B55`** — Player 1 snake and accent; dark outline required.
- **Tide mint `#28B9A8`** — Player 2 snake and accent; dark outline required.
- **Saffron `#F2C45E`** — apples and success/ready emphasis.
- **Orchid `#B49AEF`** — mushrooms and boost state.

Use `Trebuchet MS, Segoe UI, sans-serif` for headings and `Segoe UI, system-ui, sans-serif` for body copy. Use a monospace fallback only for the room code and server tick/debug details if those are exposed. Use an 8 px spacing rhythm, 10–12 px card radius, thin warm borders, and almost no shadows; the board frame supplies the depth.

Accessibility is not color-only: Player 1 also uses a diagonal slash head marker and short hatch accents; Player 2 uses a chevron head marker and dotted accents. Apples are round fruit with a leaf; mushrooms are cap-plus-stem silhouettes with three spots. Each object has a text/ARIA label where it is represented in DOM. Maintain visible focus rings in warm paper or saffron against ink/slate backgrounds.

## Layout and DOM/component map

Desktop layout is a two-column composition: the arena occupies the main column, and a narrow match rail sits beside it. The board preserves its 40:24 ratio and scales to the available width. The rail never overlays the playable grid.

```text
#app-shell
├─ header.match-bar
│  ├─ a.brand-mark (“Wayfinder Grid”)
│  ├─ div.room-strip (#room-code, #copy-invite)
│  ├─ div.phase-strip (#round-phase, #countdown-label)
│  └─ div.connection-strip (#connection-chip, #latency-note)
├─ main.game-layout
│  ├─ section.arena-card
│  │  ├─ div.arena-frame
│  │  │  ├─ canvas#arena-canvas (40×24 renderer)
│  │  │  ├─ div#countdown-overlay
│  │  │  ├─ div#pause-overlay
│  │  │  └─ div#game-announcement[aria-live="polite"]
│  │  └─ div.arena-focus-target#arena-focus-target[tabindex="0"]
│  │     (visible focus ring; “Focus arena to steer” helper)
│  └─ aside.match-rail
│     ├─ section.player-card#player-one-card
│     ├─ section.player-card#player-two-card
│     ├─ section.controls-card#controls-card
│     │  ├─ p#keyboard-help
│     │  └─ div#direction-pad (four labelled buttons)
│     ├─ section.rules-card#rules-card
│     └─ section.lifecycle-card#lifecycle-card
└─ div#modal-layer
   ├─ section#entry-panel (create room / join room)
   ├─ section#lobby-panel
   ├─ section#results-panel
   └─ section#error-panel
```

The implementation may map these labels to the selected client framework or starter scene; they are stable responsibilities, not a demand for a specific file layout. Keep gameplay rendering in canvas (or an equivalent single board surface) and keep phase, status, controls, and action copy in DOM so they remain readable and testable.

### Arena renderer

Draw grid lines subtly enough that snakes and food win contrast. Render each segment as an inset rounded tile with a one-cell gap; render the head with its player-specific marker. Draw apple as a filled saffron fruit with a small leaf and dark outline. Draw mushroom as an orchid cap, stem, and three dark spots. On pickup, a short local highlight may circle the item, but the client must only show it after the authoritative effect/snapshot; it must not award growth or boost locally.

A thin top edge of the arena can carry a small `40 × 24 · finite field` rule note in the lobby/rules view, but hide it during active play if it competes with the grid. Do not implement an unlimited-space camera in version one; the arena frame is the future seam for another arena policy.

### Player cards and HUD

Each player card shows seat label, name (`Player 1`/`Player 2` or the chosen guest name), snake swatch plus marker, `Length`, `Apples`, connection/ready state, and boost timer when active. The local seat gets a quiet `You` badge and a stronger border; the remote seat never appears as a fake bot. During play, show `BOOST · 3.8 s` with a shrinking text/timer indicator; a small orchid halo around the boosted snake is supplementary only.

The match bar should keep room code, copy-invite action, phase, and connection state visible without covering the board. Input acknowledgements can appear as a single compact line in `#game-announcement` (for example, `Turn queued` or `Turn rejected: choose a new direction`), not as a stream of toasts.

## Controls and focus

Keyboard is the primary desktop control: Arrow keys and W/A/S/D map to Up/Left/Down/Right. The arena focus target must have a visible focus outline and an explicit helper: `Focus the arena, then use arrows or W A S D to turn.` Do not steal focus from room-code inputs or buttons; after the user clicks the arena, keep focus there during play. Ignore gameplay key commands while typing in a form or while the server phase is not accepting turns.

Provide a visible four-direction alternative in `#direction-pad` as a 2×2 diamond/grid of real buttons, each with a text label and `aria-label`: Up, Left, Down, Right. Use CSS triangle/chevron glyphs or inline original SVG paths, not an icon package. Buttons are disabled in lobby/countdown/results and while the seat is unavailable; during pause/resume they remain visibly disabled and explain why through the status text. The pad sends the same bounded turn command as keyboard input; it is not a second movement system.

Show the local queue budget as a quiet status (`Turn queue 0/2`, `Turn queued 1/2`, or a server-confirmed rejection). Never imply that an input was applied merely because a key was pressed. The server acknowledgement/snapshot remains the authority.

## Visible states and copy

| State | Required visual treatment and user-facing copy |
|---|---|
| **Cold start / entry** | Paper-colored entry panel over the ink shell. Primary actions: `Create a room` and `Join with room code`; secondary `Paste invite link`. Explain: `No account needed. Share one link with one teammate.` Invalid code says `That room code is not available. Check the code or create a new room.` |
| **Room created / waiting** | Lobby shows the eight-character room code and `Copy invite`, one occupied seat and one `Waiting for a teammate` seat. Keep rules visible in a compact list: finite grid, apples grow, mushrooms boost speed, both players ready before countdown. |
| **Lobby / both seats present** | Two player cards show connection and `Not ready`/`Ready`. The primary button reads `Ready up`; after local opt-in it reads `Ready — waiting for teammate`. Do not start locally when only one player is ready. If a seat refreshes, show `Reconnecting Player 2…` while reserving that seat. |
| **Countdown** | Board and initial snakes are visible but frozen. Center overlay says `Both players ready` and a large `Starting in 3`, then 2, 1. Phase chip says `COUNTDOWN`; turn controls are disabled. A disconnect cancels readiness/countdown as specified by the server and returns to the lobby reservation state. |
| **Playing** | Phase chip `PLAYING`, player cards, length/apple counts, and local `Turn queue 0/2`. Use a thin, non-blocking announcement for confirmed effects (`Apple collected · length 6`, `Speed boost · 3.8 s`). Keep the board as the dominant element. No local death, win, growth, or boost claim before server confirmation. |
| **Pause / reconnecting** | Freeze the board in place and apply a readable dim veil, not a spinning loader. Copy: `Match paused` and `Player 2 is reconnecting. Bodies and timer are frozen.` Show remaining reconnection grace only if the server provides it. Do not show a winner, award food, or let the remaining player farm movement. |
| **Resuming** | Keep the exact authoritative board snapshot visible. Overlay says `Connection restored` then `Resuming in 3`, 2, 1; phase chip `RESUMING`. Clear presentation-only pending turns on reconnect and keep controls disabled until the server countdown completes. |
| **Boost active** | Keep regular HUD plus orchid `BOOST` chip and an explicit countdown (`BOOST · 3.8 s`). Add a restrained pulse/halo to the boosted snake and mushroom pickup highlight. Refresh resets the timer display; it must not stack a second multiplier. Pause freezes this timer. |
| **Terminal collision / death confirmation** | On server result, briefly emphasize the relevant head/collision marker, then freeze the board. Use reason copy such as `Player 1 hit the wall` or `Both snakes collided head-on`; never display a client-inferred reason. Transition to results with both final lengths and apple counts. |
| **Results / winner** | Warm paper result panel with a clear sentence: `Player 1 wins · last survivor`, `Player 2 wins · longer at timeout`, or `Draw · both snakes died together`. Include `Length`, `Apples`, and authoritative reason. Keep `Play again` opt-in status for each seat; the button/status must say `Waiting for Player 2 to choose rematch` until both agree. |
| **Results / mutual rematch** | When both opt in, show `New round starting` and the new round countdown; reset visual prediction and IDs. Never reuse old round state in the HUD. If one player leaves from results, retain the finalized result and return the remaining seat to lobby per server state. |
| **Invalid / full / expired room** | Use the error panel, not a blank board: `This room is full`, `This room has expired`, or `That invite is no longer valid`. Give one next action (`Create a new room` or `Try another code`) and preserve no stale seat credentials in visible URL or copy. |
| **Network interruption / server loss** | Use a persistent connection chip and clear panel: `Connection lost. Reconnect or create a new room.` Never fabricate a result. If the server restarts and room state is gone, explain that the interrupted match cannot be resumed and offer `Create a new room`. |
| **Leave / seat loss** | Confirm explicit leave with plain copy (`Leave this match? During play, leaving may forfeit the round.`). After server confirmation, show `You left the room` or the authoritative result; never silently turn a leave into a win. |

Error text should name what happened and the next action. Avoid generic `Something went wrong`, silent retries, or fake opponent placeholders.

## Narrow-screen treatment

Below roughly 760 px, collapse the match rail below the board and keep the arena first. The board scales to the viewport width with a minimum readable cell size; do not crop the finite field or place controls over grid cells. Put player cards in a two-up compact row, then the direction pad and rules. Keep the room code and connection chip in a wrapping match bar. Make the copy-invite action a full-width button only when the code would otherwise wrap awkwardly.

The visible direction pad is the preferred small-screen fallback even though touch/mobile polish is not a first-version acceptance requirement. Preserve a comfortable hit target and a visible focus/pressed state. If the viewport is too short for board plus controls, allow normal page scroll; never compress text below readable sizes or hide the connection/error message.

## Motion and reduced motion

Use motion only to communicate state: a 160–220 ms countdown number change, a brief pickup highlight, and one result-panel reveal. Do not animate every segment, continuously bob cards, or run a decorative background effect. `@media (prefers-reduced-motion: reduce)` must remove transforms, pulses, and countdown scaling; keep the state changes as immediate text/color changes with the same timing information. Network/pause overlays should be static and readable.

## Implementation guardrails

1. Keep all phase, result, food, boost, body, score, and countdown values server-confirmed. The client may present at most the contract’s bounded, presentation-only turn intent and must reset it on pause, death, reconnect, or new round.
2. Keep room, lobby, countdown, play, pause/resume, results, rematch, expiry, leave, and server-loss states visibly distinct; do not collapse lifecycle failures into a generic modal.
3. Reuse original CSS shapes, canvas paths, or tiny inline SVG paths for all board objects. No paid generation, downloaded assets, external image host, or icon dependency is needed for this direction.
4. Keep the board renderer independent from DOM status so canvas scaling does not make copy inaccessible. Use `aria-live="polite"` for state/effect announcements and `aria-live="assertive"` only for terminal connection/result errors.
5. Treat this brief as a design handoff, not an acceptance-criteria edit. The frozen owner handoff remains the source of truth for rules, protocol, lifecycle deadlines, and verification.

## Delta and handoff

- **Established:** the current Snake contract already defines the phases, reconnect pause/resume, authoritative outcomes, food semantics, two-player room flow, and future arena seam.
- **Proposed here:** one visual language, named DOM responsibilities, accessible keyboard/four-direction input presentation, procedural object shapes, responsive layout, state copy, and reduced-motion behavior.
- **Not done:** no code, asset sourcing, mockup, screenshot, browser session, build, server, or acceptance test. No owner plan, contract, or verifier record was edited.

Implementation should translate these responsibilities into the selected client starter only after the parent resolves the managed Game versus explicit source-code route and admits the implementation stage. The next design review should inspect the first real lobby/board/results render at desktop and narrow widths, while preserving the state list above.
