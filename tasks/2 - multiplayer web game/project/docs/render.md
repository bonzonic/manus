# Render packaging proposal

`render.yaml` is a proposed future configuration only. It describes exactly one Render `web` service from this package root (`rootDir: .`), Node 22.12.0, the Free plan, `npm ci --ignore-scripts` for build, `npm start` for start, and `/healthz` for health checks. Render injects `PORT`; the server honors `process.env.PORT` and the proposed `HOST=0.0.0.0` binding. Browser traffic uses same-origin `/ws`, which lets an HTTPS route select `wss` automatically. `ALLOWED_ORIGINS` remains an explicit deployment-time setting.

No Render account, service, public URL, deployment, uptime, HTTPS/WSS measurement, or S10 result exists in this implementation stage. This document and `render.yaml` are packaging semantics only; no credential or deployment claim is stored in the repository.
