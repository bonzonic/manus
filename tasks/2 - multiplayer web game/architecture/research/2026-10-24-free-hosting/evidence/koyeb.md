# Koyeb hosting evidence

- **Provider:** Koyeb
- **Research date:** 2026-10-24
- **Scope:** Official Koyeb sources only. No account creation, login, deployment, billing action, or runtime test was performed.
- **Target:** Ephemeral two-player classic-grid Snake; proposed Node/ws authoritative server, 60 Hz simulation, 15 snapshots/s, in-memory rooms.

## Finding

Koyeb has a recurring free Web Service suitable for hobby/testing experiments, with 512 MB RAM, 0.1 vCPU, 2 GB SSD, one free instance per organization, and deployment only in Frankfurt or Washington, D.C. Koyeb explicitly says free instances “should not be used for production applications.” The service type supports WebSocket applications, public `koyeb.app` endpoints have built-in TLS, and WebSocket/gRPC streams can last up to 12 hours when client keep-alives are configured. However, free instances always scale to zero after one hour without traffic, cannot disable or customize that behavior, and have no documented SLA or free-tier reliability guarantee in the reviewed sources. This makes Koyeb a plausible owner-hosted demo/test endpoint, not a dependable production host for active multiplayer sessions.

The free allocation is described as a “forever free tier,” not an introductory credit or time-limited trial. A credit card is explicitly required for account validation. The reviewed FAQ also says Koyeb places a $29 pre-authorization hold and charges the prorated selected plan at signup; separately, it says use of the free Web Service itself is never charged. These statements should be treated as the current published billing terms without assuming that a free account can be opened without a card.

## Official excerpts

### 1. Free instance resources, region and lifecycle limits

Source: [Koyeb Instances](https://www.koyeb.com/docs/reference/instances), retrieved 2026-10-24; page last updated May 27, 2026.

> “The **Free Instance** allows you to preview the Koyeb platform and deploy a [Web Service] **free of charge**.”
>
> “Each Free Instance provides 512MB of RAM, 0.1 vCPU, and 2GB of SSD. Each organization is limited to one Free Instance.”
>
> “Free Instances are perfect for testing the platform and working on hobby projects, and should not be used for production applications.”
>
> “They can be deployed in only one [region], either Frankfurt or Washington, D.C.”
>
> “They can’t be used as a [Worker Services].”
>
> “They can’t have custom [Scaling] configurations.”
>
> “They can’t be used with [Volumes] to add persistent storage to your services.”
>
> “They scale [down to zero] when they don’t receive any traffic for 1 hour.”

The same page documents instance replacement and shutdown behavior:

> “If an Instance is not working correctly, a new Deployment is promoted, or the Instance’s Service is deleted, the Instance will be stopped. This will remove the Instance from the Service load balancer’s list of targets and then stop and delete the Instance.”
>
> “When an Instance stop is requested, Koyeb signals the container to shutdown gracefully.”
>
> “Koyeb doesn’t directly hard-kill the container, instead the platform sends a termination signal `SIGTERM` and waits for a default configured grace period of 30 seconds to exit cleanly. If the container does not exit during this period, a forced stop is performed to terminate all remaining processes (`SIGKILL`).”

### 2. Scale-to-zero and held WebSocket connections

Source: [Koyeb Scale-to-Zero](https://www.koyeb.com/docs/run-and-scale/scale-to-zero), retrieved 2026-10-24; page last updated May 27, 2026.

> “When your Service remains idle for a given period of time without receiving requests, it will automatically scale down your active Instances to zero and update your Deployment to the [`Sleeping`] status.”
>
> “Your Service will be scaled down to zero if all of the following conditions are met for a given period of time called **idle period**: * No traffic is received from the Internet. * No held connection (e.g. websocket or HTTP/2 stream) from the Internet to your Service. * No new deployment occurred.”
>
> “The Koyeb Free Instance automatically scales down to zero when it doesn’t receive any traffic for 1 hour. Scale-to-zero on this Instance cannot be disabled, and the idle period cannot be customized.”
>
> “As soon as a new request is received, the Service wakes up and scaled up to at least one Instance or more depending on your autoscaling criteria.”
>
> “You can wake a Service up using a WebSocket connection, but that connection may only live for a few minutes.”

Interpretation constrained to the text: an actively held WebSocket is listed as a condition that prevents scale-to-zero, but Koyeb does not promise that the free instance will remain healthy or available for a game session. The page does not give a free-instance-specific cold-start number. The phrase “may only live for a few minutes” is a documented limitation for a WebSocket used to wake a sleeping service; it is not evidence that every already-active WebSocket is capped at a few minutes.

### 3. WebSocket runtime, TLS and connection duration

Source: [Koyeb Services](https://www.koyeb.com/docs/reference/services), retrieved 2026-10-24; page last updated May 27, 2026.

> “**Web Service**: to run any HTTP, HTTP/2, WebSocket, or gRPC applications.”

Source: [Koyeb Edge Network: Load Balancing and TLS](https://www.koyeb.com/docs/reference/edge-network), retrieved 2026-10-24; page last updated May 27, 2026.

> “Our Global Edge Network provides native load balancing, TLS encryption.”
>
> “WebSockets and gRPC streams have a maximum duration of **12 hours** when keep-alives are configured on the client.”
>
> “When you create an App with a public Service, external connections to the Service using the Service’s `koyeb.app` subdomain are automatically encrypted with TLS.”
>
> “TLS connections are terminated at the edge to increase performance and are securely transported within the encrypted Service Mesh to your application.”

The official pages explicitly document WebSocket support plus TLS on public `koyeb.app` endpoints. A targeted official search found no page using the literal `wss://` notation, so the exact client URL spelling is not quoted here; encrypted WebSocket transport is supported by the combination of the two documented facts.

The same Edge Network page publishes platform-wide limits:

> “Koyeb enforces the following per-service limits: * 10,000 concurrent requests across all regions where the service is deployed * 5,000 concurrent requests per individual region.”
>
> “Requests exceeding these thresholds will be rejected with an `HTTP 502 Bad Gateway` error.”

These are published service limits, not a capacity or latency guarantee for the 0.1-vCPU free instance.

### 4. Free tier is recurring, not the discontinued credit/trial

Source: [Koyeb Pricing Frequently Asked Questions](https://www.koyeb.com/docs/faqs/pricing), retrieved 2026-10-24; page last updated May 27, 2026.

> “Each organization has access to: * One `free` web Service in the Frankfurt or Washington, D.C. regions with 512MB of RAM, 0.1 vCPU, and 2GB of SSD. * One free PostgreSQL database limited to 5 hours of active time and 1GB of storage.”
>
> “You will never be charged when using the `free` web Service.”
>
> “As outlined in our [sustaining free compute in a hostile environment] blog post, we are committed to providing a forever free tier and keeping Services affordable.”
>
> “The $5.50 credit has been replaced by the `free` Instance type, which provides 512MB RAM and 0.1 vCPU.”
>
> “The $5.50 in free credit will be removed from all accounts starting on **February 1, 2024**.”

This is direct evidence for a recurring “forever free tier,” not an introductory time-limited trial. It does not establish that the terms can never change.

### 5. Card requirement and billing behavior

Source: [Koyeb Pricing Frequently Asked Questions](https://www.koyeb.com/docs/faqs/pricing), retrieved 2026-10-24; page last updated May 27, 2026.

> “We require a credit card to prevent fraud and abuse.”
>
> “We verify the card you enter by placing a $29 pre-authorization hold and immediately canceling it. Depending on your card issuer, the hold will disappear immediately, or after between 7 and 21 days.”
>
> “Am I charged when I enter my credit card? **Yes.** Right after we place the $29 pre-authorization hold to verify your card, we also charge you the pro-rated amount for the plan you select. For instance, when signing up, the selected plan is Pro, so you will be charged the pro-rated amount for Pro based on the remaining days of the current month.”
>
> “You will never be charged when using the `free` web Service.”

The FAQ therefore explicitly requires a card even though it separately states that the free Web Service is not charged. No card requirement was inferred from third-party material.

### 6. Deploy to Koyeb setup

Source: [Deploy to Koyeb Button](https://www.koyeb.com/docs/build-and-deploy/deploy-to-koyeb-button), retrieved 2026-10-24; page last updated May 27, 2026.

> “The Deploy to Koyeb button lets you deploy applications from a GitHub repository or a Docker image with a single click.”
>
> “The Deploy to Koyeb button can be configured to deploy from GitHub repositories or public, pre-built Docker images hosted on a container registry. When configured to deploy from a private repository, the Koyeb user account must be linked with GitHub and have access to the repository.”
>
> “The Deploy to Koyeb button configuration is passed using URL query parameters.”
>
> “`type` (required): The Deployment source to use. Can be `git` or `docker`.”
>
> “`name` (required): The name of the application to deploy.”
>
> “`service_type`: The type of Service to launch: either `web` or `worker` (defaults to `web` when not set).”
>
> “`instance_type`: The type of Instance the Service should deployed.”
>
> “`ports`: A port to expose for your application.”
>
> “`env`: An environment variable to pass to the application.”
>
> “`regions`: A region where the Service should be deployed.”
>
> For a Git source, the documented required arguments include `repository` and `branch`; the examples use a public GitHub repository and a `buildpack` builder. For this Node/ws proposal, the owner would need to expose the Web Service port and choose the free instance/allowed region in the Koyeb UI or generated link. The page describes the deployment mechanism; it does not prove that a generated link bypasses Koyeb account or card requirements.

## Fit for the proposed Snake server

- **Runtime fit:** Node/ws can conceptually run as a public Koyeb Web Service because Koyeb documents WebSocket applications as a supported Web Service type. Public TLS plus WebSocket support is consistent with an encrypted browser connection, although the literal `wss://` spelling was not found in the official pages reviewed.
- **Resource fit:** The free instance has only 0.1 vCPU, 512 MB RAM and 2 GB SSD. That is plausibly enough for a tiny two-player in-memory simulation, but no benchmark or free-instance capacity guarantee was found. The proposed 60 Hz loop and 15 snapshots/s therefore remain unmeasured.
- **Session lifecycle:** An open WebSocket is listed among the conditions that prevent idle scale-to-zero. Nonetheless, the free instance always scales to zero after one hour without traffic, cannot opt out, and Koyeb explicitly discourages production use. Deployments, health failures and instance stops can delete the running instance, so in-memory rooms should be treated as disposable and reconnect/restart behavior must be designed accordingly.
- **Game permission/reliability:** No reviewed Koyeb page explicitly prohibits games. The documented “testing and hobby projects” positioning permits treating it as a hobby/demo candidate, but “should not be used for production applications” means it is not evidence of reliable live-session hosting or an SLA-backed game service.
- **Regions:** A free service can run in only Frankfurt or Washington, D.C. This is a material latency choice for players outside those areas.
- **Two-player topology:** One free Web Service can be the authoritative room server; teammates do not need hosting accounts for the game itself once the owner has deployed it. That teammate flow is a project-level operating assumption, not a Koyeb-documented feature.

## Owner and teammate setup

**Owner:** Prepare a public GitHub repository or public pre-built Docker image; add a Deploy to Koyeb button/link with `type`, `name`, source (`repository` + `branch` for Git or `image` for Docker), service type `web`, exposed port, and allowed region. The owner must handle Koyeb account setup and the documented mandatory card validation. No setup or deployment was performed in this research.

**Teammates:** The intended low-workflow path is to open the owner-provided deployed game URL. Koyeb’s button documentation does not state that teammates need Koyeb accounts, nor does it document a special “join game” link. Therefore the account-free teammate flow is a product-operational assumption that must be confirmed after an owner deploys; it is not a verified Koyeb feature.

## Gaps and decision caution

1. No official free-tier SLA, uptime promise, active-session capacity, measured latency, or guarantee against instance restart was found.
2. No official Koyeb page reviewed uses the literal `wss://` URL syntax. WebSocket support, TLS encryption, and 12-hour keep-alive stream duration are documented.
3. No free-instance-specific cold-start latency was found. General scale-to-zero documentation says a sleeping service wakes on a new request; the free page only fixes the one-hour idle threshold.
4. No official page explicitly says whether a game is permitted. The evidence supports hobby/testing use and warns against production applications.
5. No live account, card validation, Deploy to Koyeb link, or runtime test was performed, so the owner setup and actual active-session behavior remain unverified.
6. The FAQ’s card-validation/prorated-plan language and its statement that the free Web Service is never charged should be reviewed by the owner at signup; this evidence does not reconcile or override Koyeb’s current billing UI.

## Sources

1. [Koyeb Instances](https://www.koyeb.com/docs/reference/instances)
2. [Koyeb Scale-to-Zero](https://www.koyeb.com/docs/run-and-scale/scale-to-zero)
3. [Koyeb Services](https://www.koyeb.com/docs/reference/services)
4. [Koyeb Edge Network: Load Balancing and TLS](https://www.koyeb.com/docs/reference/edge-network)
5. [Koyeb Pricing Frequently Asked Questions](https://www.koyeb.com/docs/faqs/pricing)
6. [Deploy to Koyeb Button](https://www.koyeb.com/docs/build-and-deploy/deploy-to-koyeb-button)
7. [Koyeb Regions](https://www.koyeb.com/docs/reference/regions)
