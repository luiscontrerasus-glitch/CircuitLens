# CircuitLens: $0 deployment

Prepared October 3, 2026, continuing commit `60c827c`. No paid service was activated, no provider requests were made, and no public deployment URL exists yet. Render's dashboard opened at its sign-in page; an authenticated hosting account was unavailable.

## Prepared configuration

Use a native Node web service on Render's **Free** instance in a free workspace **without a payment method**. This keeps the existing Node server, same-origin API, image validation, and static frontend together. `render.yaml` declares `plan: free`; its former paid disk/service configuration has been removed. No database, disk, subscription, or external font/CDN is required. Gemini Free Tier recognition is integrated and awaiting key setup. Complete `GEMINI_SETUP.md` and real-response validation before enabling live mode for deployment. OpenAI remains an optional paid alternative and must stay unselected here.

Render's free services sleep after 15 minutes of inactivity and can take about a minute to wake. The workspace allowance is 750 free instance hours per month. Storage is ephemeral. Free bandwidth/build allowances have limits: with no payment method, exceeding them suspends services or disables builds instead of charging overages. Free instances lack production reliability guarantees; this is appropriate for a hobby/hackathon demonstration, not an always-on commercial service. See [Render free-service documentation](https://render.com/docs/free) and [Node web-service instructions](https://render.com/docs/web-services).

## Exact steps requiring your account

1. Publish the final commit: `git push origin main`. The configured remote is `https://github.com/luiscontrerasus-glitch/CircuitLens.git`. Preserve the existing history; do not force-push.
2. Sign into [Render](https://dashboard.render.com/). Choose a free/Hobby workspace with **no card or payment method**. Stop if a payment method or paid plan is required.
3. Select **New → Web Service**, connect the GitHub repository above, and choose branch `main`. Name the new service `circuitlens-free`; do not upgrade or repurpose an existing paid service.
4. Select **Node**, root directory blank, build command `npm ci && npm run build`, start command `node dist/server.js`, and instance type **Free**. Set the health check to `/api/health`. Add no database, persistent disk, or other add-on.
5. Set `NODE_VERSION=24.14.1`, `NODE_ENV=production`, `HOST=0.0.0.0`, and `LIVE_VISION_ENABLED=false`. Let Render supply `PORT`. Do **not** configure `OPENAI_API_KEY`, `VISION_ACCESS_CODE`, or provider credentials. Review the final plan and billing settings before creating the service.
6. Deploy, then copy the actual assigned HTTPS URL into your submission. A URL must not be inferred from the service name.
7. At that URL, check `/api/health` returns the free deterministic mode and `/api/vision-config` returns `configured:false`, `live_enabled:false`, and the unavailable explanation. Open all seven examples and repeat the reversed-LED correction in `RECORDING_GUIDE.md`.

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
