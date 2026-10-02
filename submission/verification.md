# Verification — October 1, 2026 upgrade

## Automated and production

- Node 24.14.1, Windows; 39 tests passed, zero failures. All 19 original tests retained, 20 added.
- Tests use mocks for API responses and explicitly simulated observations, never billed inference.
- Coverage: strict schema, malformed and empty responses, refusal, low confidence, unknown terminals/values, corrected polarity, rejection, all three perception-to-graph cases, image decoding, sanitized errors, consent/origin/access controls, daily persistence, concurrent calls, cooldown, and existing engine/API regression.
- Production allowlist build succeeds. A clean `npm ci --omit=dev --prefix dist` succeeded with zero audit findings; the resulting app started from `dist` on port 3000 without credentials.
- Production HTTP smoke: homepage, config, health, perception JS and all three new PNG images returned 200; seven fixture analyses gave their expected statuses. Evidence: `evaluation/production-smoke.json`.
- JavaScript syntax check and Prettier check run separately; no TypeScript or ESLint is configured.
- Docker CLI unavailable, so container image execution remains unverified. Render login required; no remote Git repository configured and no public deployment URL.

## Actual live requests

Five Responses requests: correct synthetic circuit three times, reversed synthetic circuit once, disconnected synthetic circuit once. All returned HTTP 429. A diagnostic identified provider type `insufficient_quota` and code `credit_balance_exhausted`. Earlier generic quota labels in attempt logs are preserved as the historical responses seen then. API authentication/model-list access returned HTTP 200. No inference succeeded. Logs under `evaluation/live-vision*.json` record attempts; they are not successful perception records. Failed attempts count toward the app's daily ledger; whether the provider bills failed requests is not asserted.

## Browser verification

A separate development server on port 3003 injected a conspicuously labeled simulated reversed-circuit observation. UI actions verified: image selection, consent, four pending detections, per-part acceptance, graph conversion, confirmation, reversed-LED diagnosis, terminal correction and re-analysis passing with 9.1 mA estimate. Adding an unknown detection invalidated the graph and blocked conversion; rejecting it restored eligibility to build. The production build frontend also loaded independently without a key, leaving manual workflows available. Screenshots named `vision-*-simulated` are interface evidence, not live-model evidence.

The browser viewport override did not take effect (reported width remained 1265), so new mobile verification is not claimed. The original mobile screenshots and `browser-results.json` are September 30 baseline evidence only. The seven old fixture screenshots do not show runtime visual recognition.

## Security and scope

Secrets are excluded from the production allowlist and Git. The read-only secret scan passed across 345 working-tree/public/build files and reachable Git blobs without displaying key bytes. `.env.local` is ignored and untracked. The managed sandbox blocked spawning Git inside Node; the same read-only scanner succeeded with the approved sandbox override. No photographed hardware or arbitrary-image benchmark was evaluated. Confidence is uncalibrated and inferred connections always need review. Passing supported rules is not physical continuity or safety certification.

Final browser recheck: pending counts update immediately after edits; LED correction cleared the deterministic fault again. A separately labeled simulated quota-error harness on port 3004 showed a sanitized failure and still allowed manual component creation. No additional live requests were made.
