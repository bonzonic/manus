# Fly.io hosting evidence

**Retrieved:** 2026-10-24
**Scope:** Fly.io only; public first-party sources; no account, deployment, billing, or runtime actions performed.
**Use case:** Proposed two-player authoritative Node/`ws` Snake server, ephemeral in-memory rooms, 60 Hz simulation and 15 snapshots/s.

## Evidence-backed findings

### Free status and legacy distinction

New Fly.io organizations do **not** receive ongoing free hosting. The current Resource Pricing page says: “No. New organizations don't have a free tier or a monthly free usage allowance.” New accounts instead receive “a free trial ... for up to 2 hours of Machine runtime or 7 days, whichever comes first.” Fly’s Free Trial page further says trial Machines “are set to automatically stop after running for 5 minutes.” When the trial ends or its resource limits are exhausted, “your apps will stop until you add a payment method.”

The current trial limits are 2 total VM hours shared across all Machines, 10 Machines maximum, 20 GB of volume storage, up to 2 vCPUs per Machine, and up to 4 GB memory per Machine. Dedicated IPv4 and performance-optimized vCPUs are excluded. These are trial limits, not an ongoing free tier.

Legacy allowances are separate. Fly says it stopped selling Hobby, Launch, and Scale plans on October 7, 2024, and still honors the old allowances only for organizations that had those plans before they were sunset. Those legacy allowances include up to three shared-cpu-1x 256 MB VMs, 3 GB persistent volume storage, and specified outbound-transfer allowances. This does not establish eligibility for a new account in 2026.

### Card/payment requirement

Fly states that a credit card is not needed to start the free trial. Adding a card during the trial ends the trial and starts billable usage: “adding a card ends the free trial and your usage starts counting toward your bill from that point on.” After the trial ends, the pricing page says a new account must add a credit card to keep using billable resources. The same page states: “All organizations (except for Linked Organizations) require a credit card on file.”

### WebSockets and lifecycle

Fly’s official WebSockets article answers the support question directly: “The answer is ‘Yes’.” Its example uses raw WebSockets with Node and `ws`, an HTTP service, and TCP service configuration. The article says Fly’s TLS traffic is terminated at the network edge, so the application can handle the connection on its internal port without special TLS handling.

Idle behavior depends on configuration. Fly Proxy’s current reference says autostop/autostart stops, suspends, or starts existing Machines “based on incoming requests to your app.” With `auto_stop_machines` set to `"stop"` or `"suspend"`, the proxy evaluates excess capacity every few minutes. If an app has only one Machine and that Machine has “no traffic (a load of 0),” the proxy stops or suspends it. With `auto_start_machines = true`, the proxy waits for a request and starts a stopped/suspended Machine when required. Fly’s launch guide says newly launched services commonly have `auto_stop_machines = true` and are stopped when idling.

If autostop is disabled, Fly’s reference says Machines “stay running unless they exit on their own or are stopped during a deploy or scaling operation,” and the proxy does not stop them automatically even if idle. That avoids idle disconnects but incurs billable runtime after the trial.

Fly’s public documentation does **not** explicitly say whether an already-open, otherwise quiet WebSocket is counted as sufficient “traffic” to prevent autostop. Therefore it is not verified that an idle persistent WebSocket survives an autostop decision. Treat this as a material lifecycle gap; do not assume an open socket alone prevents stop/suspend.

### Owner versus teammate setup

A one-time owner setup is not a dashboard-only or zero-setup flow. Fly’s current launch guide requires the owner to install `flyctl`, sign up or sign in, and use Fly Launch to create an app and a `fly.toml` configuration before deployment. The guide says new accounts start on Pay As You Go and may be prompted for credit-card payment information. The official WebSocket example likewise requires a Fly account and a deploy of the application.

After deployment, Fly provides a public `*.fly.dev` hostname. The launch guide says, “Visit your newly deployed app at https://my-app-name.fly.dev/”. Thus, after the owner has deployed a public app and configured any room/join UX, teammates can plausibly open the link without Fly accounts or hosting setup. The official sources do not document the proposed game’s room-token flow, access control, reconnect behavior, or whether teammates need a special invite URL; those remain application decisions.

## Fit for the proposed Snake

Transport fit is positive: Fly explicitly supports WebSockets, and its official example demonstrates a Node server using raw `ws`. A single small Machine could plausibly host an authoritative in-memory two-player room, but no capacity, latency, or 60 Hz/15 snapshots-per-second measurement was performed or promised by these sources.

Free-hosting fit is negative for an ongoing demo. New users receive only 2 total VM-hours or 7 days, whichever comes first, and trial Machines auto-stop after 5 minutes. After that, keeping the server available requires a payment method and billable runtime. The smallest always-on current example is a `shared-cpu-1x` 256 MB Machine at $2.19 per 30 days of continuous runtime, plus applicable outbound transfer; this is a paid estimate, not a free allowance.

For a paid deployment, use of autostop must be decided explicitly. Autostop can reduce idle cost, but the docs do not verify how an open quiet WebSocket is treated. Disabling autostop is the safer lifecycle choice for a real-time authoritative room, but then the Machine runs and bills continuously. The one-time owner deployment can leave teammates with only a link, but it does not satisfy the requested ongoing-free-hosting constraint.

## Gaps and cautions

- Active WebSocket handling during Fly Proxy autostop is not explicitly documented in the reviewed official pages; this requires a separately authorized runtime test or a more specific first-party statement.
- No current free-forever compute allowance exists for new organizations according to Fly’s current pricing page. Legacy free allowances apply only to organizations already on discontinued plans before October 7, 2024.
- No capacity, latency, uptime, regional routing, reconnect, or 60 Hz simulation measurements were made.
- The public sources do not prove native integration with the installed Manus-managed Game route; provider support is only provider support.
- The owner’s exact account-verification/payment prompts may vary; no account was created or inspected.
- No deployment, billing, install, login, browser automation, or product-code work was performed.

## Primary source excerpts

[1] **Fly.io Resource Pricing** — https://docs.fly.io/about/pricing

> “No. New organizations don't have a free tier or a monthly free usage allowance.”
>
> “New accounts do get a free trial, which lasts for up to 2 hours of Machine runtime or 7 days, whichever comes first. You don't need a credit card to start the trial. After the trial ends, you'll need to add a credit card to keep using billable resources.”
>
> “The smallest always-on app costs $2.19 per 30 days.”
>
> “All organizations (except for Linked Organizations) require a credit card on file.”

[2] **Fly.io Free Trial** — https://docs.fly.io/about/free-trial

> “A free trial on Fly.io includes 2 hours of machine runtime or 7 days of access, whichever comes first.”
>
> “2 total VM hours (Shared across any machines you launch)”
>
> “Note: Trial Machines are set to automatically stop after running for 5 minutes”
>
> “If you hit any of the limits below before your 7 days are up, your trial is considered exhausted, and your apps will stop until you add a payment method.”
>
> “adding a card ends the free trial and your usage starts counting toward your bill from that point on.”

[3] **Fly.io Discontinued Plans** — https://docs.fly.io/about/discontinued-plans

> “Fly.io stopped selling Hobby, Launch, and Scale plans on October 7, 2024.”
>
> “If you purchased a Launch or Scale plan before October 7, 2024, you can remain on those plans unless you convert to Pay As You Go, delete your payment method, or otherwise stop using Fly.io.”
>
> “Up to 3 shared-cpu-1x 256mb VMs”
>
> “3GB persistent volume storage (total)”

[4] **WebSockets and Fly** — https://fly.io/blog/websockets-and-fly/

> “One of the regular questions we get at Fly is ‘Do you support WebSocket connections?’. The answer is ‘Yes’”
>
> “This has been put together to use only raw WebSockets (and express for serving up pages) and no other libraries.”
>
> “Fly’s default configuration is to serve up internal port 8080 on external port 80 unsecured and 443 with TLS. That TLS traffic is terminated at the network edge so from the application’s point of view, it’s all traffic on one port and no need to do anything special to handle TLS.”

[5] **Autostop/autostart Machines** — https://docs.fly.io/launch/autostop-autostart

> “Use autostop/autostart to automatically start and stop or suspend existing Machines based on incoming requests.”
>
> “When a request arrives and no Machine is running, Fly Proxy starts a stopped Machine and routes the request to it.”
>
> “The action ... that Fly Proxy should take when the app is idle for several minutes.”
>
> “If ‘off’, Fly Proxy will never stop Machines.”

[6] **Fly Proxy autostop/autostart** — https://docs.fly.io/reference/fly-proxy-autostop-autostart

> “Fly Proxy runs a process to determine whether an app has excess capacity every few minutes.”
>
> “If there's only one Machine in the region: the proxy checks if the Machine has any traffic; if the Machine has no traffic (a load of 0), then the proxy stops or suspends the Machine.”
>
> “Machines stay running unless they exit on their own or are stopped during a deploy or scaling operation.”

[7] **Launch a demo app** — https://docs.fly.io/getting-started/launch-demo

> “The first step is installing all the tools you need to work with Fly Launch. Which is one tool: flyctl.”
>
> “Sign up for an account or sign in to your existing account.”
>
> “At some point, you'll be prompted for credit card payment information. New accounts start on our Pay As You Go plan.”
>
> “Visit your newly deployed app at https://my-app-name.fly.dev/”
