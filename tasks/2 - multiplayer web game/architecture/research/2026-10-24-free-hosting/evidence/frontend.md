# Render static frontend gap — 2026-10-24

Parent performed one targeted follow-up after the provider research to establish whether a free static frontend is available separately from the sleeping Node backend. Source fetched: https://render.com/docs/free . No account or deployed application was used.

> “You can also deploy static sites on Render for free.”

> “Static sites are free to deploy on Render. As with web services, they count against your monthly included amounts of outbound bandwidth and pipeline minutes.”

The same page's static-site glossary says:

> “Deploy this service type to host a static website (HTML/CSS/JS) over a global CDN at a public URL.”

Its Free web-service section says:

> “Render spins down a Free web service that goes 15 minutes without receiving any inbound traffic. This includes both HTTP requests and WebSocket messages from existing connections.”

> “This process takes about one minute. Render displays a loading page to connecting browsers while a service is spinning up.”

Proposed two-resource topology: a free static frontend shows the game UI and backend-connecting state, while a separate free Node web service owns rooms over WSS. This isolates UI delivery from the backend instance's startup. Neither the page nor this research proves a specific Godot export's MIME/security headers, successful load, server capacity or actual no-card onboarding. Shared bandwidth/build limits still apply to both resources. Do not use a free expiring Postgres database or artificial traffic to keep the backend awake.
