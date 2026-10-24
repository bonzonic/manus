# Browser behavior seam

`app.js` is the only behavioral browser entry. It consumes the stable IDs supplied by the static lane, connects to same-origin `/ws`, applies only confirmed `welcome`, `snapshot`, `inputAck`, `effect`, `result`, and `error` envelopes, and forwards controls as sequenced turn intent. `client-model.js` retains server-owned bodies, food, score, boost, and outcomes; presentation intent expires after 150 ms and is never authoritative.

`board-renderer.js` draws procedural board cells and confirmed food/snakes to `#arena-canvas`. `dom-renderer.js` updates lifecycle, HUD, result, announcement, and connection text. `protocol-client.js` contains the narrow send/controller seam. HTML, CSS, SVG, manifest, and their stable IDs remain owned by the sibling static lane.
