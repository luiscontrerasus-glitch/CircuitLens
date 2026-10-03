# Security, cost, and performance verification

October 3, 2026. No OpenAI request was sent during this launch task, no paid service was provisioned, and no credentials were added.

- `npm audit --json`: **0 vulnerabilities** (including moderate/high/critical); 38 dependency entries including optional/platform packages. Runtime packages are Ajv and Sharp; Prettier is a development dependency. There is no other paid runtime service, hosted database, analytics SDK, font subscription, or CDN dependency.
- `npm run security:check`: passed the source/untracked-file, reachable Git-blob, public/build-asset, and local-log scan. `.env.local` is ignored and untracked. The scan compares secret bytes internally without displaying them and detects both OpenAI- and Google-key-like strings. An ignored local environment file already existed; the default guard prevents its key from enabling live recognition. A pattern scan is not a comprehensive penetration test.
- `/api/vision-config` exposes only configuration status and the unavailable reason, not credential values. With live mode off, `/api/perceive` returns sanitized HTTP 503 `live_disabled` before touching the provider or its request budget. Explicit enablement without credentials returns `not_configured`. The evaluation CLI also fails closed when live mode is off. These boundaries have dedicated passing tests.
- The explicit provider-mock harness is clearly simulated and excluded from the production build. Seven generated fixtures and physical logical assemblies are labeled; no successful live vision or hardware validation is claimed.
- Production build: 59 allowlisted files; 49 static assets/routes and all seven analyses passed HTTP smoke. Environment files, test harnesses, credentials, runtime usage state, and this presentation folder are excluded.
- Existing same-origin API, body/image validation, metadata stripping, strict output schema, HTML escaping, CSP, and sanitized-error controls passed automated checks. Invalid JSON imports now show their error **inside the open Connections dialog**, avoiding a hidden alert behind the modal.
- Browser log check: **0 warnings/errors**. In 128 captured response/failure events, **0 failed requests or HTTP error responses**; the event buffer was neither truncated nor incomplete. This is evidence for the exercised flows, not every conceivable request.

## Basic performance and accessibility

Local warm homepage measurement: DOMContentLoaded approximately **115 ms**, Chrome FirstMeaningfulPaint approximately **115 ms**, and JS heap used approximately **6.2 MiB**. Raw metrics are in `browser-verification.json`. These are a single local observation, not Web Vitals certification, a mobile-network benchmark, or a prediction of Render cold-start latency.

Existing fitted diagrams, locally hosted assets, adaptive tablet/mobile schematic, and reduced-motion alternative remain intact. There was no new visual framework or paid rendering dependency. Desktop/tablet/mobile showed no document overflow. Semantic main/heading/skip-link checks and named visible controls passed; keyboard zoom and Fit worked. A full Lighthouse audit, assistive-technology audit, physical-device test, and multi-browser compatibility matrix were not performed.

Public hosting verification awaits account sign-in. Free-tier limits and strict no-payment-method deployment conditions are in `DEPLOYMENT.md`; the free service has no availability SLA. Gemini can be enabled after Free Tier key setup, billing-disabled confirmation, and live validation. The optional OpenAI alternative may cost money and must remain unselected here. See `GEMINI_SETUP.md`.

Gemini default routing never reuses the OpenAI key. A Gemini key without explicit Free Tier confirmation cannot trigger a request. The adapter fixes the allowed image-understanding model, has no paid fallback or extra SDK dependency, independently validates observations, and sanitizes provider errors. The confirmation is an operator attestation, not a Google billing-status query.
