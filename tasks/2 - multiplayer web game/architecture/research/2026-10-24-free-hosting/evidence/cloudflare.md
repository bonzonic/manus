# Cloudflare evidence

Retrieved 2026-10-24. Scope is limited to official Cloudflare documentation and Cloudflare’s official pricing page. This is read-only architecture research for the proposed two-player authoritative Snake service; no account, deployment, billing, browser automation, product code, or capacity test was performed.

## Free-plan status and limits

Cloudflare’s [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) says:

> “By default, users have access to the Workers Free plan.”

Its Workers table lists Free as **100,000 requests per day**, **no charge for duration**, and **10 milliseconds of CPU time per invocation**. The page says a WebSocket connection to a Worker is charged as the initial `Upgrade` request, while WebSocket messages routed through a Worker do not count as Worker requests. Requests to static assets are free and unlimited.

The [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) page says Free CPU time per HTTP request is 10 ms. If CPU is exceeded, Cloudflare returns Error 1102 (`Worker exceeded resource limits`) and terminates the invocation according to the configured limit. HTTP-triggered Worker duration has no hard limit while the client remains connected, but crashes, resource pressure, and runtime shutdowns can interrupt work. During routine runtime updates, existing requests and WebSocket connections get up to 20 minutes to finish.

The same page says:

> “Accounts on the Workers Free plan have a daily request limit of 100,000 requests, resetting at midnight UTC. When a Worker exceeds this limit, Cloudflare returns **Error 1027**.”

Route behavior can be configured as fail open, which bypasses the Worker, or fail closed, which returns a Cloudflare 1027 error page. This is not a capacity guarantee.

SQLite-backed Durable Objects are available on Workers Free. The [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) page says:

> “Workers Free plan: Only Durable Objects with SQLite storage backend are available.”

It also says:

> “If you exceed any one of the free tier limits, further operations of that type will fail with an error. Daily free limits reset at 00:00 UTC.”

The same page lists the Free DO compute allowances as **100,000 requests/day** and **13,000 GB-s/day**. DO request accounting includes HTTP requests, RPC sessions, WebSocket messages, and alarm invocations. Creating a WebSocket connection needs a request; outgoing WebSocket messages and incoming protocol pings have no charge. For compute-request billing, incoming WebSocket messages use a **20:1** ratio, so 100 incoming messages count as 5 requests for billing purposes.

The SQLite Free allowances on that page are **5 million row reads/day**, **100,000 rows written/day**, and **5 GB total SQL stored data**. `setAlarm()` is billed as one row written; deletes count as rows written. Cloudflare’s public [plans page](https://www.cloudflare.com/plans/) currently instead lists SQLite DO SQL rows read as **50M/day**, while its other DO values match the DO pricing page. This is an official-source inconsistency. Treat the lower, specific DO pricing-page value (5 million/day) as the conservative planning number until Cloudflare clarifies it.

The [Durable Objects limits](https://developers.cloudflare.com/durable-objects/platform/limits/) page lists Free account limits of **100 Durable Object classes** and **5 GB total SQLite-backed DO storage per account**. It lists a **32 MiB received WebSocket message size**, a **30-second default CPU limit per DO request** configurable to 5 minutes of active CPU time, and a soft limit of **1,000 requests/second per individual Object**. An overloaded Object returns an overloaded error to the caller. DO HTTP/RPC wall time is unlimited while the caller remains connected; alarm handlers have a 15-minute wall-time limit.

## WSS and Durable Object WebSocket APIs

Cloudflare’s official [Using the WebSockets API](https://developers.cloudflare.com/workers/examples/websockets/) example constructs a browser client with:

> `new WebSocket("wss://example-websocket.signalnerve.workers.dev")`

The example checks the `Upgrade: websocket` header, creates a `WebSocketPair`, and returns a `101` response with the client WebSocket. The official [Workers WebSockets API](https://developers.cloudflare.com/workers/runtime-apis/websockets/) page says Workers can communicate in real time over WebSockets and that a chat room or game match needing coordination among multiple connections should use Durable Objects as the single point of coordination.

The official [Durable Object WebSocket server example](https://developers.cloudflare.com/durable-objects/examples/websocket-server/) routes the Worker’s upgrade request to a DO stub (`idFromName`, `get`, then `stub.fetch(request)`), accepts the server socket, tracks sessions, and broadcasts messages. It states:

> “WebSocket connections pin your Durable Object to memory, and so duration charges will be incurred so long as the WebSocket is connected (regardless of activity).”

It recommends the WebSocket Hibernation API to avoid duration charges during inactivity.

## Lifecycle, hibernation, and 60 Hz Snake timers

The [Durable Object lifecycle](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/) page states that a hibernateable DO is currently hibernated after 10 seconds of inactivity. Hibernation requires all of these conditions:

> “No `setTimeout`/`setInterval` scheduled callbacks are set”; no unfinished I/O or `waitUntil()` promise; no outbound connection; no WebSocket standard API; and no request/event still being processed.

When hibernated, the DO is removed from memory and its in-memory state is discarded; important state must be persisted. Hibernated WebSockets remain connected, but the constructor runs again when an event wakes the object. DOs can be shut down for deployments, inactivity, runtime updates, or placement decisions. WebSocket connections are automatically terminated during shutdown, so clients need reconnect and state restoration logic.

The [Durable Object WebSocket guide](https://developers.cloudflare.com/durable-objects/best-practices/websockets/) recommends the Hibernation WebSocket API. It uses `this.ctx.acceptWebSocket(server)` instead of `server.accept()`, then event methods such as `webSocketMessage` and `webSocketClose`; attachments can be restored with `serializeAttachment`/`deserializeAttachment`. The guide states that alarms, incoming requests, and scheduled callbacks—including `setTimeout` and `setInterval`—prevent hibernation.

Therefore a classic authoritative Snake loop that runs a **60 Hz timer** and emits **15 snapshots/s** cannot be hibernate-eligible while that timer is active. A standard `server.accept()` connection also pins the DO in memory and incurs duration charges for the entire connection, even when idle. Hibernation is useful for sparse/event-driven traffic, not for a continuously ticking room. Replacing the 60 Hz timer with input-driven advancement or bounded alarms would be a rules/architecture change, not a free hosting assumption; alarms also have a 15-minute wall-time limit and are not a 60 Hz scheduler.

A rough quota illustration, not a capacity measurement: if one room is one DO with two clients sending input at 60 messages/s each for one active hour, that is 432,000 incoming messages. Under the documented 20:1 DO billing ratio this is about 21,600 DO request-equivalents, plus connection requests. Outgoing snapshots are not billed as incoming WebSocket messages, but the continuously active timer and connected standard sockets consume DO duration. At 128 MB allocated memory, 13,000 GB-s/day corresponds to about 104,000 seconds (roughly 28.9 room-hours) of continuously active one-room DO wall time before other work, CPU, requests, and any account-level usage are considered. This is arithmetic from published allowances, not a supported concurrency promise.

## Static asset hosting

The official [Static Assets billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) page says:

> “Requests to static assets are free and unlimited.”

It also says there is no additional cost for storing Assets. However, when `run_worker_first` causes matching paths to invoke Worker code, those requests use the Worker quota; if the Free request limit is exceeded, they receive **429 Too Many Requests** rather than falling back to static asset serving. A Godot Web client bundle can therefore be served as static assets, while the dynamic Worker/DO WebSocket path remains subject to Worker and DO limits.

## Owner setup and teammate setup

The official [Static Assets Get Started](https://developers.cloudflare.com/workers/static-assets/get-started/) guide says a project can deploy to a `*.workers.dev` subdomain or custom domain using `wrangler deploy`. The [workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) page says Cloudflare accounts come with a configurable `workers.dev` subdomain, allowing quick deployment without first onboarding a custom domain. It describes `workers.dev` as a Free website intended for personal or hobby projects, not business-critical production.

The official [Deploy to Cloudflare buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/) page says the button lets developers quickly deploy a public GitHub/GitLab repository **on their own Cloudflare account**. Cloudflare clones the source repository into the user’s GitHub/GitLab account, lets the user choose names, builds and deploys it, and automatically provisions declared resources including Durable Objects. The page’s exact deployment sequence is therefore a one-time **owner/deployer flow**, not a teammate-only open-link flow. It also says Deploy to Cloudflare buttons require public GitHub/GitLab repositories, support Workers applications rather than Pages applications, and do not support non-GitHub/GitLab or private repositories.

After the owner completes deployment, teammates can simply open the resulting public `workers.dev` game URL if the owner leaves it publicly accessible. They do not need Cloudflare accounts merely to visit that URL. The deployment docs do not prove any native integration with the installed Manus-managed Game route, and this research did not initialize or deploy a project.

## Payment/card requirement

The reviewed official Cloudflare Workers/DO pricing and deployment pages explicitly document Free availability and a $5/month minimum for the Workers Paid plan, but they do **not** explicitly say whether creating/using a Free account or activating SQLite Durable Objects requires a payment card. Cloudflare’s official support landing page routes billing questions to its billing documentation, but the public page fetched here did not expose a Free-plan card rule. Do not claim “no card required” from these sources. The accurate status is: **Free quotas are documented; card requirement is unverified; Paid-plan billing would be a separate owner decision.**

## Node/ws migration delta

Cloudflare’s documented model is not a drop-in Node `ws` server. The proposed Node/ws process would need to become a Worker entrypoint that validates the WebSocket upgrade and forwards it to a room Durable Object stub. Each room would normally map to one DO identity (`idFromName`/`get`), with room state and session handling inside the DO. Standard WebSocket handling uses `server.accept()` and event listeners; hibernatable handling uses `ctx.acceptWebSocket()` plus DO methods such as `webSocketMessage` and `webSocketClose`. Process-global in-memory rooms cannot be assumed to survive DO restart or hibernation, so important room/reconnect state needs SQLite or serialized attachments. The continuously running 60 Hz simulation would intentionally keep the object active and incur duration usage; it is not compatible with the “free while hibernated” premise.

## Source index

1. https://developers.cloudflare.com/workers/platform/pricing/ — Pricing.
2. https://developers.cloudflare.com/workers/platform/limits/ — Limits.
3. https://developers.cloudflare.com/durable-objects/platform/pricing/ — Pricing.
4. https://developers.cloudflare.com/durable-objects/platform/limits/ — Limits.
5. https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/ — Lifecycle of a Durable Object.
6. https://developers.cloudflare.com/durable-objects/best-practices/websockets/ — Use WebSockets.
7. https://developers.cloudflare.com/durable-objects/examples/websocket-server/ — Build a WebSocket server.
8. https://developers.cloudflare.com/workers/examples/websockets/ — Using the WebSockets API.
9. https://developers.cloudflare.com/workers/runtime-apis/websockets/ — WebSockets.
10. https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/ — Billing and Limitations.
11. https://developers.cloudflare.com/workers/static-assets/get-started/ — Get Started.
12. https://developers.cloudflare.com/workers/configuration/routing/workers-dev/ — workers.dev.
13. https://developers.cloudflare.com/workers/platform/deploy-buttons/ — Deploy to Cloudflare buttons.
14. https://www.cloudflare.com/plans/ — Cloudflare Pricing.
