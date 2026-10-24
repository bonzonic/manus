# Render free-hosting evidence

**Retrieved:** 2026-10-24
**Scope:** Render only. Read-only public documentation research; no Render account, login, deployment, billing, or capacity test was performed.
**Proposed target:** Node.js authoritative server using `ws`, WSS for a two-player classic-grid Snake room. Proposed simulation is 60 Hz with 15 snapshots/second and ephemeral in-memory rooms.

## Findings

### Free Node web service and resource limits

Render explicitly lists web services, including Node.js applications, among service types that can run free. The documented Free web-service compute plan is 0.1 CPU and 512 MB RAM. Free web services are intended for testing, hobby projects, and previewing Render, not production applications. A Free web service is limited to one instance because free services do not support scaling beyond a single instance.

Render grants **750 Free instance hours per workspace per calendar month**. A Free web service consumes those hours while running; spun-down time does not consume them. If the workspace uses all 750 hours, Render suspends its Free web services until the next month; unused hours do not roll over.

Free web services count against workspace-included outbound bandwidth and build-pipeline minutes. The current outbound-bandwidth page lists **5 GB/month for the Hobby workspace plan**, shared across the workspace. Public-internet WebSocket responses count as outbound bandwidth; inbound traffic does not. Above the included bandwidth, Render bills $0.15/GB when a payment method is linked; without one, Render spins down the workspace services until the next month. The Free page similarly says that without a payment method Render suspends Free services after the outbound limit, and disables new builds after the build-pipeline limit. The retrieved pages do not state the Hobby build-pipeline-minute quantity.

### WebSockets, WSS, and lifecycle

Render web services accept inbound WebSocket connections from the public internet. Render's Node example uses the `ws` module, and the documentation says to use `wss` over the public internet. Public traffic, including WebSockets, is routed to one public service port (default 10000); a separate public WebSocket port is not supported.

Render says it does not enforce a maximum WebSocket duration, but connections can be interrupted by instance shutdowns, network issues, and platform maintenance. The documentation recommends keepalives and client reconnect with exponential backoff. Clients are not guaranteed to reconnect to the same instance after disruption. During shutdown Render sends `SIGTERM` and gives the instance a 30-second graceful-shutdown window, extendable to at most 300 seconds with a shutdown delay.

A Free web service spins down after **15 minutes without inbound traffic**, explicitly including HTTP requests and WebSocket messages from existing connections. It starts again when it receives an HTTP request or a new WebSocket connection; Render says this takes **about one minute**. The official wording is about inbound traffic, so it does not establish that server-to-client snapshots alone keep a Free instance awake. That point is an implementation-relevant gap, not a verified guarantee.

Render may restart Free web services at any time. Free services have ephemeral filesystems, and local filesystem changes are lost on redeploy, restart, or spin-down. The docs do not explicitly spell out JavaScript heap loss for in-memory rooms; however, an instance restart or spin-down necessarily terminates the running process, so ephemeral in-memory room state should be treated as lost (inference from the documented lifecycle, not a quoted Render guarantee). WebSocket connections close when the connected instance shuts down.

### Payment/card and owner setup

Render's official first-deploy tutorial states: **“This tutorial uses free Render resources. No payment is required.”** It says the prerequisites are a Render signup and a repository connected to a supported Git provider. The tutorial then instructs the owner to create a Web Service, choose the Free compute plan, and deploy. The FAQ states that all-Free services can still be billed if a payment method has been added and that, without one, Render disables services instead of charging when a limit would incur a charge.

This supports “no payment method is required” for the documented free tutorial, but it is not proof that every signup, workspace, or future onboarding flow will never request a card. No billing screen was opened.

### Blueprint templating

Render Blueprints can template a Free Node web service. The official Blueprint example defines a web service with `plan: free`; the Blueprint specification lists `runtime: node` and `plan: free` as supported values and identifies the Free web-service plan as 0.1 CPU/512 MB. A minimal Blueprint can therefore represent the owner-managed service configuration (`type: web`, `runtime: node`, `plan: free`, repository, build command, and start command).

Blueprint setup still requires an owner to commit and push the YAML, connect a Git provider, open **New > Blueprint** in the Render Dashboard, review the changes, and click **Deploy Blueprint**. Render says the Blueprint is the source of truth and automatically redeploys affected resources after relevant changes. This proves free-resource templating, not native Manus-managed Game integration; the task handoff separately says that external-provider support is not proof of that integration.

## Fit for the proposed Snake

**Potentially suitable for a small hobby/demo slice, with explicit operational caveats.** Render supplies a public Node web service, WSS, and a Free plan, so a single authoritative two-player room server is technically compatible with the documented service type. The proposed rooms can remain ephemeral and server-owned, avoiding a database for the core demo.

The fit is not “always-on” or production-grade. The first visit after idle can incur about a one-minute cold start. A Free instance can be restarted or spun down, closing WebSockets and losing process-memory rooms; the client therefore needs interruption/reconnect behavior and the product must tolerate room loss. Free capacity is documented as 0.1 CPU/512 MB, but Render does not publish a useful two-player Snake capacity guarantee here; 60 Hz/15 snapshots and actual room count require measurement that this research did not perform. Public outbound snapshots consume the workspace's 5 GB Hobby allowance, while client-to-server traffic does not.

## Owner and teammate experience

**Owner (documented steps):** create/sign into a Render account, connect the repository's supported Git provider, create a Web Service or Blueprint, select `node` and `free`, supply build/start configuration, and deploy. The resulting web service receives a unique `onrender.com` URL; public WebSocket clients should use its `wss://` URL and the application path.

**Teammates (partly inferred):** Render documents a public `onrender.com` URL that can be opened in a browser. If the game implements room creation/join without a separate application account, teammates should only need the owner-provided link. Render's docs do not verify anonymous app access or the game's own room/auth flow, so “open a link only” is an application assumption, not a Render guarantee. Teammates do not need to own the hosting account under the proposed ownership model.

## Gaps and unknowns

- No account or deployment was used, so current Dashboard prompts, regional availability, actual cold-start measurement, and the live URL were not verified.
- Render documents “about one minute” for spin-up but gives no latency distribution or service-level guarantee.
- The docs do not explicitly confirm that server-only WebSocket snapshots prevent Free idle spin-down; only inbound traffic is named.
- No useful maximum-open-connection or 60 Hz simulation capacity is promised. Free CPU/RAM are published, but game capacity remains unmeasured.
- The Hobby build-pipeline-minute allowance was not stated on the retrieved official pages.
- “No payment is required” is explicit for the tutorial, not a universal guarantee about every future signup/onboarding flow.
- Free services are explicitly not for production applications, may restart at any time, and can be suspended by monthly limits or unusually high service-initiated traffic.
- Nothing in these Render pages proves native integration with the installed Manus Game route.

## Exact primary excerpts

1. **Free tier — `https://render.com/docs/free`**
   > “Render *spins down* a Free web service that goes 15 minutes without receiving any inbound traffic. This includes both HTTP requests and WebSocket messages from existing connections.”

   > “A Free web service spins back _up_ whenever it next receives an HTTP request or new WebSocket connection. This process takes about one minute.”

   > “Render grants *750 Free instance hours* to each workspace per calendar month.”

   > “Render might restart a Free web service at any time.”

   > “Free web services don't support ... Scaling beyond a single instance.”

   > “*`free`*: 0.1 CPU / 512 MB RAM.”

2. **WebSockets on Render — `https://render.com/docs/websocket`**
   > “*Render web services can accept inbound WebSocket connections from the public internet.*”

   > “*Always use the `wss` protocol for WebSocket connections over the public internet.*”

   > “Render does not enforce a maximum duration for WebSocket connections.”

   > “*Clients are not guaranteed to reconnect to the same instance after a disruption.*”

   > “Render sends it a `SIGTERM` signal and gives it a 30-second window to shut down gracefully.”

   > “*Outbound* WebSocket messages from your services over the public internet count as outbound bandwidth usage.”

3. **Blueprints (IaC) — `https://render.com/docs/infrastructure-as-code`**
   > “Blueprints are Render's infrastructure-as-code (IaC) model for defining, deploying, and managing multiple resources with a single YAML file.”

   > “services:\n  - type: web # A Python web service named django-app running on a free instance\n    plan: free”

   > “Commit and push your changes to your Git provider.”

   > “Open the Render Dashboard and click *New > Blueprint*.”

   > “If everything looks correct, ... click *Deploy Blueprint*.”

4. **Blueprint YAML Reference — `https://render.com/docs/blueprint-spec`**
   > “The service's compute plan, such as `free` or `1c-2g`. Sets the service's available compute resources.”

   > “*`free`*” is listed for a Web Service as “0.1 CPU” and “512 MB.”

5. **Your First Render Deploy — `https://render.com/docs/your-first-deploy`**
   > “*This tutorial uses free Render resources. No payment is required.* All you need is a repository connected to a supported Git provider with the web app you want to deploy.”

   > “You can deploy either of these service types for free on Render.”

   > “Every Render web service and static site receives a unique `onrender.com` URL.”

6. **Render FAQ — `https://render.com/docs/faq`**
   > “*Yes, if you've added a payment method.* If you exceed your monthly included amount of outbound bandwidth or build pipeline minutes, Render bills you for a supplementary amount.”

   > “*If you haven't added a payment method and you would incur charges, Render instead disables your services for the duration of the current billing period.*”

7. **Outbound Bandwidth — `https://render.com/docs/outbound-bandwidth`**
   > “*Hobby* | 5 GB” under monthly included bandwidth.

   > “WebSocket responses sent from your web services to browsers and other clients over the public internet” are billed outbound bandwidth.

   > “*Otherwise,* Render spins down your workspace's services until the start of the next month.”

## References

[1]: https://render.com/docs/free "Deploy for Free — Render Docs"
[2]: https://render.com/docs/websocket "WebSockets on Render — Render Docs"
[3]: https://render.com/docs/infrastructure-as-code "Render Blueprints (IaC) — Render Docs"
[4]: https://render.com/docs/blueprint-spec "Blueprint YAML Reference — Render Docs"
[5]: https://render.com/docs/your-first-deploy "Your First Render Deploy — Render Docs"
[6]: https://render.com/docs/faq "Render FAQ — Render Docs"
[7]: https://render.com/docs/outbound-bandwidth "Outbound Bandwidth — Render Docs"
