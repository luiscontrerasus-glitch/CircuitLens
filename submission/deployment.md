# Deployment status and handoff

Production package and clean runtime dependency installation verified locally. Build command: `npm ci && npm run build`; start: `node dist/server.js`. Server host must bind `0.0.0.0` and use the assigned port. Configure `OPENAI_API_KEY` as a secret; `VISION_ACCESS_CODE` protects public inference. Persist `VISION_USAGE_FILE` and run one process/replica. Manual analysis can remain public without spending inference credits.

`render.yaml` is prepared with a single Node service, health check, host-generated demo code and a persistent disk. This requires a paid disk-capable tier; no resources or costs were authorized/provisioned. [Render blueprint reference](https://render.com/docs/blueprint-spec). The public deployment attempt reached https://dashboard.render.com/login; no authenticated session or configured Git remote was available. No public URL exists. Login/host authorization and a repository connection are still needed.

Dockerfile is prepared but Docker CLI was unavailable, so no image build/run is claimed. The Sites hosting connector expects Workers-compatible server output; this Node HTTP/native-Sharp/file-ledger app has not been ported to that runtime. No static-only substitute was published.

The current key can authenticate but inference reports exhausted credits. Do not claim deployed live vision until billing and deployment are separately verified. The next immediate user-dependent action is confirming usable API credits in the organization that owns the configured key. Later hosting authorization is a distinct deployment dependency.
