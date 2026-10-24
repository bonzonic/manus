# Netlify evidence — 2026-10-24

## Decision

**Whole current game on Netlify alone: No.** Netlify is a good conditional fit for the static Godot Web/frontend portion, but not for the proposed authoritative Node/ws server: the game needs a persistent WebSocket endpoint, a continuously running 60 Hz simulation, and in-memory room state. Netlify Functions execute in ephemeral, request-oriented runtimes with finite limits; Edge Functions are even more constrained. Netlify's own real-time example uses Netlify only for token-authentication code and delegates the persistent WebSocket layer to Ably's managed WebSocket servers. Therefore a full deployment requires an external realtime/backend service (for example, the separately researched Render/Cloudflare backend), or a redesign around a managed realtime provider.

## Supporting excerpts

### 1. Functions are ephemeral and return-oriented

Source: [Netlify Functions overview](https://docs.netlify.com/build/functions/overview/)

> “When the event happens, Netlify hands your code the event payload, runs it in an ephemeral runtime environment, and acts on whatever it returns.”

This is incompatible with treating one function instance as the authoritative room process whose memory and 60 Hz loop are continuously available. It also means in-memory room state cannot be assumed to survive across requests/instances.

### 2. Functions have finite execution limits

Source: [Configuration for functions](https://docs.netlify.com/build/functions/configuration/)

> “Synchronous execution limit | 60 seconds | No”
>
> “Scheduled execution limit | 30 seconds | No”
>
> “Background execution limit | 15 minutes | No”

The proposed server is a continuously running Node/ws process, so these bounded request/background runtimes do not provide the required persistent WebSocket server or durable in-memory simulation.

### 3. Edge Functions are not a persistent game loop

Source: [Edge Functions limits](https://docs.netlify.com/build/edge-functions/limits/)

> “CPU execution time per request: 50 ms”
>
> “Response header timeout: 40 s”

These per-request limits rule out a 60 Hz authoritative simulation and do not establish WebSocket-server hosting.

### 4. Netlify's own WebSocket pattern requires an external realtime service

Source: [Build Real-Time Applications with Web Sockets + Serverless](https://www.netlify.com/blog/web-sockets-in-a-serverless-world/)

> “Serverless and WebSockets is a bit of a contradiction.”
>
> “At Ably, our mission is to make Realtime Edge Messaging simple and seamless ... we do this by provisioning auto-scaling, managed web socket servers that you can use in your apps!”
>
> “Now you will have a Netlify hosted project which uses Ably to maintain a WebSocket connection.”

The example's Netlify Function creates a short-lived Ably token; Ably, not Netlify, maintains the persistent socket. This is an integration/proxy/authentication pattern, not hosting the authoritative game server on Netlify.

### 5. Free static/frontend hosting is available, but usage is capped

Source: [Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)

> “$0/month, forever, for 300 credits/month with a hard limit and no auto recharge option.”
>
> “Core features available to all plans ... Deploy from AI, Git, or API ... Custom domains with SSL support ... Global CDN for fast & reliable performance ... Serverless functions & storage.”

The Free plan is therefore suitable for publishing a static browser client/landing page, subject to Netlify's current hard monthly credit cap. It does not turn the serverless functions into a persistent backend. Teammates can use a public deployed link without their own provider accounts; only the owner needs to deploy/configure it (that access model is an operational implication, not a Netlify uptime guarantee).

## Feasibility summary

- **Frontend:** Yes, conditionally. Netlify Free can deploy and serve the static Godot Web output through its CDN/custom-domain hosting.
- **Authoritative backend:** No, not as the current Node/ws + 60 Hz + in-memory-room design. Functions/Edge Functions are request-bounded/ephemeral, and Netlify's own WebSocket guidance uses Ably for the persistent connection.
- **Whole game:** No on Netlify alone. Conditional yes with frontend on Netlify plus an external realtime backend/service; this remains a separate deployment and may require backend/protocol changes.
- **Free/eligibility caveat:** Netlify Free is listed as $0/month with 300 credits/month and a hard limit/no auto-recharge. Do not infer guaranteed uptime, restart frequency, or capacity from these plan facts.
