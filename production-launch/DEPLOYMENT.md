# CircuitLens: $0 deployment

Prepared October 3, 2026, preserving history through `60c827c`, `89fef5f`, and `2db3896`. Render is authenticated; the dashboard shows Hobby/Free, no card on file, no pending charges and no invoices. Actual Gemini photo assessment is complete and documented in `REAL_PHOTO_EVALUATION.md`. Google Free Tier/no billing is owner-confirmed, not independently established through the API. The public service is live at https://circuitlens-free.onrender.com and passed the 49-route/seven-demo smoke check.

## Prepared configuration

Use a native Node web service on Render's **Free** instance in a free workspace **without a payment method**. This keeps the existing Node server, same-origin API, image validation, and static frontend together. `render.yaml` declares `plan: free`; its former paid disk/service configuration has been removed. No database, disk, subscription, or external font/CDN is required. Gemini recognition is locally configured and tested; the public service starts with live recognition disabled until its server-side credentials and access code are configured. OpenAI remains optional and must stay unselected here.

Render's free services sleep after 15 minutes of inactivity and can take about a minute to wake. The workspace allowance is 750 free instance hours per month. Storage is ephemeral. Free bandwidth/build allowances have limits: with no payment method, exceeding them suspends services or disables builds instead of charging overages. Free instances lack production reliability guarantees; this is appropriate for a hobby/hackathon demonstration, not an always-on commercial service. See [Render free-service documentation](https://render.com/docs/free) and [Node web-service instructions](https://render.com/docs/web-services).

## Deployment record

The repository was published to the public GitHub `main` branch without force-pushing. Render service `circuitlens-free` deployed commit `2db3896` on the Free Node plan. Public verification passed health/configuration checks, all seven deterministic analyses, the homepage linked demonstration, the reversed-LED path, a 390px mobile layout with no horizontal overflow, and a browser log check with zero warnings/errors. Public Gemini remains disabled (`LIVE_VISION_ENABLED=false`); no API key was transmitted to Render.

## Exact steps requiring your account for optional live Gemini

1. Keep the existing service on the Free plan with no card or payment method.
2. If optional public Gemini is later approved, add server-side `GEMINI_API_KEY`, a private `VISION_ACCESS_CODE`, `VISION_PROVIDER=gemini`, `GEMINI_FREE_TIER_CONFIRMED=true`, and `LIVE_VISION_ENABLED=true` through Render environment settings. Never use OpenAI as a fallback.
3. Recheck `/api/vision-config`, the access-code gate, the six-photo assessment boundary, and deterministic seven-demo smoke tests before enabling live recognition.

Alternatively, use `render.yaml` as a [Blueprint](https://render.com/docs/blueprint-spec) after reviewing the same Free plan and no-payment-method conditions. Do not enable paid overages, upgrade to avoid cold starts, or add an artificial keep-alive service.

## Local production rehearsal

```powershell
npm ci
npm test
npm run build
$env:NODE_ENV='production'
$env:LIVE_VISION_ENABLED='false'
$env:HOST='0.0.0.0'
$env:PORT='3005'
node dist/server.js
```

In a second terminal, run `node scripts/smoke-production.js http://127.0.0.1:3005 production-launch/production-smoke.json`. Do not overwrite committed launch evidence casually. The build allowlists 59 files; tests, local environment files, runtime ledgers, presentation media, and provider mocks are excluded. `npm ci` installs build dependencies at the repository root; the start command uses those runtime packages normally.

After Gemini Free Tier key setup and validation, configure server secrets `GEMINI_API_KEY` and a private `VISION_ACCESS_CODE`, set `VISION_PROVIDER=gemini`, `GEMINI_FREE_TIER_CONFIRMED=true`, and `LIVE_VISION_ENABLED=true`. Keep the Google project unbilled and the Render instance Free without a payment method. The local daily ledger can reset on an ephemeral host; Google's project quota remains authoritative. No paid disk is required. OpenAI remains outside this $0 launch. The engineering engine is not a physical continuity tester or SPICE simulator.
