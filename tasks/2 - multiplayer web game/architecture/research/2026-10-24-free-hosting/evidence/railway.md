# Railway evidence — 2026-10-24

**Scope.** Railway only. Public official Railway pages were searched and fetched on 2026-10-24. No account, login, deployment, browser automation, or product-code work was performed.

## Findings

### Free status and trial

Railway currently distinguishes a one-time trial from a recurring Free plan. Railway’s Free Trial documentation says the trial lasts up to 30 days and includes a one-time $5 grant; after 30 days or when the $5 is spent, it “reverts to the Free plan,” which provides **$1 of free credit per month** and does not roll over. The public pricing page likewise describes Free as “Start with a 30-day free trial with $5 credits, then $1 per month.” This is not an “all free usage is only a trial” model.

The pricing page says **“No credit card required”** for Free. The trial documentation says an unverified account may be a Limited Trial with restricted outbound network access and a limited set of ports; connecting GitHub and passing Railway’s automated verification can enable the Full Trial. The reviewed pages do not say that a card is needed to start the Free/trial path. The paid-plan reference separately says that, as of March 30, Railway requires a **post-paid card**; the exact applicability and accepted-card details for a later Hobby upgrade were not fully specified on the reviewed pages.

### Limits and cost-control behavior

After the trial, Railway’s pricing comparison lists the Free limits as: **1 project**, **3 services per project**, **1 replica per service**, up to **1 vCPU and 0.5 GB RAM per service**, **1 GB ephemeral disk**, **0.5 GB volume storage**, and 3 days of log history. The trial is more generous in some dimensions (for example, 5 projects and 5 services per project), so trial limits must not be treated as continuing Free-plan limits. Railway’s Free plan has community support; global regions are listed as trial-only and unavailable on Free.

The pricing reference gives usage prices of **$20/vCPU-month** and **$10/GB-month** for service CPU and RAM, plus **$0.05/GB** network egress and **$0.15/GB-month** volume storage. As an illustrative 30-day ceiling calculation, a service held at the Free maximum of 1 vCPU + 0.5 GB RAM for the whole month is about **$25/month** of CPU/RAM usage (1 × $20 + 0.5 × $10), before egress/storage. That plainly exceeds the recurring $1 Free credit. Railway does not publish a minimum allocation in the reviewed pages, so this does **not** prove that every lower-resource 24/7 process exceeds $1; it does prove that the advertised maximum configuration does not fit. The exact low-allocation cost, billing rounding, and whether a small always-on Node process can run reliably within $1 remain unverified.

Railway’s cost-control page says usage limits can shut workloads down once the configured hard limit is reached, and the minimum hard limit is **$10**. It also says Railway may try to restart resources in the next billing cycle, with manual redeploy possible if recovery fails. The reviewed pages do not explain how a no-card Free workspace behaves precisely when its $1 monthly credit is exhausted, so this should not be represented as a guaranteed $1 hard cutoff.

### Node, WebSocket, and lifecycle

Railway’s official Express guide identifies Express as a Node.js framework and documents deploying Node/Express apps through a one-click template, GitHub repository, CLI, or Dockerfile. The guide says Railway automatically detects a Node.js app via Railpack for a GitHub deployment. This establishes a supported Node deployment path, but the cited guide is not a `ws`-specific template and does not explicitly document the `ws` package.

Railway’s public-networking specifications explicitly support **WebSockets over HTTP/1.1**. They state that WebSocket connections are exempt from the ordinary request duration and inactivity limits and “can stay open indefinitely, even while idle.” Traffic is TLS-encrypted, so a Railway HTTPS service domain is compatible with secure WebSocket use (`wss`) at the protocol/edge level. The documented network ceilings are 10,000 concurrent connections, about 11,000 requests per second per domain, and 10,000 requests per connection; these are far above a two-player room’s expected connection count, although they do not establish CPU or application-level capacity.

Railway’s Serverless feature (formerly App-Sleeping) is configurable per service. When enabled, Railway detects inactivity from outbound traffic; a service is considered inactive after 5 minutes and in practice sleeps roughly 5–10 minutes after its last outbound packet. The first request wakes it, but Railway warns of cold-boot delay and that the first request may return 502. A running service with an active WebSocket may send no outbound packet while idle, so enabling Serverless is incompatible with promising an always-ready room endpoint without accepting wake-up behavior. Because the proposed server keeps room state in memory, a stopped container also creates a material state-loss/reconnect risk; this state-loss point is an inference from the proposed architecture plus Railway’s documented stop/wake behavior, not an explicit Railway guarantee. Serverless is opt-in/configurable, and the reviewed page does not state the default setting.

### Owner setup and teammate setup

The official Express guide documents a low-touch owner path: use a one-click template or deploy from a GitHub repository, then generate a public Railway domain. A template is an infrastructure shortcut, not a ready-made two-player Snake backend; the owner would still need to supply or select the application source and configure its deployment. The guide recommends ejecting from a template to create a copy in the owner’s GitHub account. Connecting GitHub may also be relevant to obtaining Full Trial network access.

The owner would therefore be the only person expected to create the Railway account, choose the plan/trial, deploy the Node service, and generate/share the public URL. The teammate flow can be designed as opening that public game link and joining a room; the official docs establish public-domain deployment but do not explicitly promise anonymous access for a particular game. No teammate Railway account should be needed merely to load a public URL, but the game’s own room/token rules could still require a join code or other in-game step. This account-less teammate conclusion is an operational inference, not a Railway-specific documented guarantee.

## Snake fit assessment

Railway is **technically plausible** for the proposed authoritative two-player Node/WebSocket server: Node deployment is documented, WSS/WebSocket transport is documented, indefinite WebSocket connection duration is documented, and the published network limits are not the likely bottleneck for two players. A one-owner deployment with teammates opening a shared URL is also plausible.

Railway is **not proven to satisfy recurring free 24/7 hosting** for this use. The recurring allowance is only $1/month. A continuously allocated service at the Free maximum is approximately $25/month before egress/storage, and the docs do not give a minimum allocation or guarantee that a continuously available authoritative server fits inside $1. Enabling Serverless could reduce idle cost, but it introduces cold starts and may stop an in-memory room service, which conflicts with a simple always-available room model. The practical recommendation is therefore: treat Railway Free as suitable for bounded experiments or short-lived trial validation, not as a verified free-forever 24/7 host for the server-authoritative Snake requirement. A paid Hobby plan would be a separate owner billing decision and was not initiated.

## Gaps and cautions

* The reviewed official pages do not state a minimum CPU/RAM allocation, exact metering/rounding for a very small service, or a measured 24/7 cost for a Node/WebSocket process.
* They do not explicitly document the `ws` library, Godot Web export, or an authoritative multiplayer game template.
* They do not establish Free-plan uptime/SLA, restart frequency, regional latency, or how an in-memory room behaves across redeploys/crashes; those would require separate bounded testing or further official documentation.
* The exact post-trial behavior when the $1 credit is exhausted without a payment card is not clear from the reviewed pages. Railway documents usage hard limits, but the minimum hard-limit setting is $10.
* Teammate access through a shared public URL is an operational inference. Railway documents generating a public domain, not the game’s anonymous room/authentication policy.

## Sources and exact excerpts

1. **Pricing** — https://railway.com/pricing
   > “Free — $ 0 per month”
   > “Start with a 30-day free trial with $5 credits, then $1 per month”
   > “No credit card required”
   > “Up to 1 vCPU / 0.5 GB RAM per service”
   > “Projects — 5 during trial, then 1” and “Services per project — 5 during trial, then 3”
   > “Global regions — Trial only, unavailable on the free plan”

2. **Free Trial** — https://docs.railway.com/pricing/free-trial
   > “The trial gives access to basic features for up to 30 days and includes a one-time grant of $5.”
   > “After 30 days passes or $5 is spent, the free trial reverts to the Free plan, which provides $1 of free credit per month. The credit does not roll over month to month.”
   > “If your account is not verified ... your trial will have some network restrictions.”
   > “If you do not connect a GitHub account ... you will be on the Limited Trial.”

3. **Pricing Plans** — https://docs.railway.com/reference/pricing/plans
   > “Free — For running small apps with $1 of free credit per month”
   > “Free — $0 / month”
   > “Free ... Replicas 1 ... RAM 0.5 GB ... CPU 1 vCPU”
   > “RAM — $10 / GB / month” and “CPU — $20 / vCPU / month”
   > “Network Egress — $0.05 / GB”
   > “Not anymore as of March 30th, Railway requires the use of a post-paid card.”

4. **Specs & Limits** — https://docs.railway.com/networking/public-networking/specs-and-limits
   > “Support for websockets over HTTP/1.1.”
   > “Websocket connections are exempt from these duration and inactivity limits, and can stay open indefinitely, even while idle.”
   > “Maximum Connections — 10,000 concurrent connections”
   > “HTTP Requests/Sec — 11,000~ RPS”
   > “Requests Per Connection — 10,000 requests”
   > “All traffic must be HTTPS and use TLS 1.2 or above.”

5. **Deploy an Express App** — https://docs.railway.com/guides/express
   > “Express ... is ... a web application framework for Node.js”
   > “This guide covers how to deploy an Express app to Railway ... One-click deploy from a template ... From a GitHub repository ... Using a Dockerfile.”
   > “Railway automatically detects that it's a Node.js app via Railpack.”
   > “Navigate to the Networking section ... Click Generate Domain to create a public URL for your app service.”

6. **Cost Control** — https://docs.railway.com/pricing/cost-control
   > “Railway provides controls over resource usage in the form of usage limits, resource limits ... and serverless auto-sleeping of inactive services.”
   > “If your resource usage for the billing cycle exceeds the limit you configured, we will shut down your workloads.”
   > “The minimum amount you can specify as the hard limit is $10.”
   > “Enabling Serverless on a service tells Railway to stop a service when it is inactive.”

7. **Serverless** — https://docs.railway.com/deployments/serverless
   > “When Serverless is enabled for a service, Railway automatically detects inactivity based on outbound traffic.”
   > “Once a service stops sending packets it is considered inactive after 5 minutes. ... in practice a service sleeps somewhere between 5 and 10 minutes after its last outbound traffic.”
   > “A service is woken when it receives traffic ... It may take a small amount of time ... (cold boot time).”
   > “The first request sent to a slept service may return a 502 Bad Gateway response.”

**Evidence path:** `C:\Users\wongn\Documents\Interview\Manus\tasks\2 - multiplayer web game\architecture\research\2026-10-24-free-hosting\evidence\railway.md`
