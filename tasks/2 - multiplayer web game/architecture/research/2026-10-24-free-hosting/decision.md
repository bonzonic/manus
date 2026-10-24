# Free hosting — decision brief

**Recommend Render Free for the first team demo**, keeping the proposed Node/WebSocket server. Use a free static frontend and free room-server service, then share the frontend link. Only an owner/deployer needs hosting setup; teammates need no server software or hosting account under the intended guest-room design. [Full sourced comparison](research.md).

Render's documented allowance is recurring: 750 running instance-hours/workspace/month, with 5 GB/month shared Hobby outbound bandwidth. The free deployment tutorial says no payment is required, but actual account onboarding has not been tested. Select free resources only; attaching a payment method can enable overage charges. These are hobby/demo limits, not a production reliability or game-capacity guarantee.

**Main compromise:** after 15 minutes without inbound traffic, the free backend sleeps. Waking it takes about one minute. The frontend can show a startup message; it must not start a match before both players connect. Restarts/quotas can interrupt play, and process-memory rooms can be lost. No external uptime watcher or fake keepalive is proposed.

**Alternative:** Cloudflare Workers/Durable Objects have real free quotas and a deploy-button flow, but require replacing the Node/ws room host with Cloudflare-specific APIs. A continuous 60 Hz timer uses active-duration quota rather than idle hibernation savings. Card requirements remain unverified. Koyeb has a recurring free instance but requires a card and documents account-plan billing/authorization behavior. Railway's recurring $1/month is not proven sufficient for an always-available server; Fly.io offers no ongoing free tier for new users.

**Owner experience:** prepared source/export and deployment configuration, then account login, repository connection, free-plan review and dashboard deployment. It is a few guided setup steps, not literally zero deployment work. **You confirmed teammates only need shared-link play:** they can open the resulting game link after successful deployment, without hosting accounts, installs or individual deployments. Only the owner/deployer handles the initial setup.

**Important execution limit:** the installed Manus-managed Game workflow still requires a Cloud Computer before initialization. This research establishes the provider options, not native external-deploy support. Resolve an allowed external deployment/export/source-deliverable route before implementation; do not purchase paid hosting. No provider was selected, no account/billing action performed, and no game deployed or capacity-tested.

**Decision:** proceed with the Render Free hosting design, accepting its roughly one-minute idle wake-up and hobby-service limits, or explore the Cloudflare backend alternative?
