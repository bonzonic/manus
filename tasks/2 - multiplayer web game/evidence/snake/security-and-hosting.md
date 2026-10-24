# Security and hosting evidence

Retrieved 2026-10-24.

## WebSocket security

Source: https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html

> Validate the `Origin` header on every handshake. Always use an explicit allowlist of trusted origins.

> For browser clients using tokens, prefer sending the token in the first message over WSS. Avoid tokens in URL query strings because they can leak into access logs.

> Until token validation succeeds, accept only the authentication message and do not send protected data. Close the connection on authentication failure or timeout, and limit unauthenticated connections.

> Treat all WebSocket messages as untrusted input.

> Implement backpressure controls to prevent memory exhaustion from fast message producers.

> Avoid logging sensitive data - never log complete message contents, authentication tokens, session IDs, or personal information that could violate privacy regulations.

Architecture implications: validate Origin before upgrade; use a bounded first-message admission/resume handshake; send existing seat credentials in the first WSS message rather than a URL; reject gameplay until a socket owns a valid seat; validate and bound messages; keep tokens out of invites, public configuration, captures and logs; bound pending connections and outbound queues. Fresh guest admission intentionally allows a player with an available room invitation to acquire an unoccupied seat; room codes do not prove existing seat ownership or provide confidentiality.

OWASP's general illustrative message-rate defaults are not appropriate for a realtime game sending input 20 times per second. Game-specific limits must be justified and tested; proposed values in the architecture are limits to verify, not copied benchmarks.

## Available computers

`manus-device.list_devices` was called read-only. It returned only the connected Windows desktop and an unallocated ordinary Manus Sandbox. No available Cloud Computer was listed. No region, selected host, public WSS endpoint or cloud resource capacity was established. No switch, purchase, allocation or selection write was made.

The installed Game multiplayer contract requires an owner-selected cloud computer before Game initialization. The user can attach an already-owned cloud computer via the computer icon; if none is owned, the supported purchase entry is https://manus.im/app#settings/my-computer/create . The current Cloud Computer reference lists Basic starting at $10/month, with traffic/overage and billing limits to recheck at actual setup. No purchase is authorized by this planning task.

The general persistent-computing Reserved-hosting guidance is not the installed Game project's multiplayer route. Do not promise that changing website residency supplies a selected Game server or bypass the Game cloud-computer selection gate.
