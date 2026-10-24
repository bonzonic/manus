# Implementation notes

The server owns room admission, credentials, reconnect epochs, ready/countdown phases, fixed-step movement, food, boost duration, collision, terminal outcome, and mutual rematch. Rule state is kept socket-free in `server/game/rules.js`; room state and lifecycle are in `server/rooms/`; envelope builders are in `server/authoritative-server.js`.

`server/index.js` supplies one native HTTP server and one `ws` endpoint. It validates bounded versioned client messages, checks room membership and round/epoch state, caps per-connection message rate and output bytes, and broadcasts authoritative snapshots. The joined package serves the approved static shell from the same origin; the client still cannot fabricate authoritative state.

The browser behavior is DOM-free in `public/client-model.js`, with a 150 ms presentation-only turn intent. `protocol-client.js` sends only frozen client message types; `app.js` derives the same-origin WebSocket URL and consumes the static lane's stable IDs. Renderers never award growth, score, boost, death, victory, or opponent state.

The application stage intentionally did not run the repository full suite. Public HTTPS/WSS, latency-injected browser acceptance, Render deployment, S10, and independent verification remain future gates.
