# Gemini Free Tier configuration and verification

Integration and actual-photo evaluation are complete. **67 offline tests pass**. The owner configured the ignored local key and confirmed Free Tier with billing disabled. Real requests returned observations for all six licensed photographs across deliberate model comparisons; accuracy is limited, and no complete circuit was validated. See `REAL_PHOTO_EVALUATION.md`. Existing deterministic demo footage must not be described as live recognition.

## Setup for a new installation

1. Open [Google AI Studio's API keys page](https://aistudio.google.com/api-keys) and sign in with your Google account. Create an API key in a **new Free Tier project with no linked billing account**. Do not choose Set up billing, add a card, activate a paid tier, or use a billed project. Check the project's Billing Tier is Free Tier. If no free project/model quota is available, stop; manual CircuitLens features remain usable.
2. Keep the key private. In the existing, ignored `.env.local` at the repository root, add/update these entries locally. Do not paste the key into chat or commit it:

```dotenv
VISION_PROVIDER=gemini
GEMINI_API_KEY=your_key_entered_locally
GEMINI_FREE_TIER_CONFIRMED=true
LIVE_VISION_ENABLED=true
```

3. Set `GEMINI_FREE_TIER_CONFIRMED=true` only after checking the project's billing status. It is an operator confirmation, **not an automatic billing-account check**. CircuitLens cannot infer a project's billing status from its key. Changing the project's billing later would invalidate that confirmation; keep billing disabled.
4. Restart the server after configuration. For a built production package, use `node --env-file=.env.local dist/server.js` from the repository root; never copy the environment file into `dist`. Test public, nonconfidential photos and review actual predictions before accepting any terminal.

## Integration behavior

The default provider is `gemini`, with the default image-understanding model `gemini-3.8-flash`. Explicit `GEMINI_VISION_MODEL=gemini-3.5-flash-lite` is also allowlisted; there is no automatic model change. Google's [pricing page](https://ai.google.dev/gemini-api/docs/pricing) currently lists its input/output as free on the Free Tier. Quotas and account/region availability vary; check the actual project in AI Studio. The integration uses the [GenerateContent REST API](https://ai.google.dev/api/generate-content), image bytes, and a JSON schema, with no grounding tools, file-storage service, automatic retries, or paid fallback.

The key stays server-side in an `x-goog-api-key` header; it is never placed in a request URL or browser configuration. Normalized, metadata-stripped images go to Google only after consent. Google's [unpaid-service terms](https://ai.google.dev/gemini-api/terms) describe data use; the UI discloses that submitted images/responses may improve Google's products.

Gemini proposes observed parts, normalized boxes, terminal candidates, values, visible evidence, confidence, and warnings. Shared Ajv/coordinate/terminal validation rejects malformed output. Safety blocks, truncated JSON, quota exhaustion, invalid keys, and network failures leave manual entry available. Unknown terminals are retained; low confidence and unknowns are flagged; every detection starts pending. Accepted observations populate the existing graph only after review. Circuit diagnoses still come from the deterministic engine.

OpenAI's integration remains available only when explicitly selecting `VISION_PROVIDER=openai` and configuring its credentials. It is outside this $0 launch. An old OpenAI key never enables Gemini or triggers fallback. Do not select it here.

The 20-attempt/day and ten-second cooldown guards remain shared. Free hosting's ephemeral disk can reset the local ledger on restart; Google's unbilled project quota is authoritative. Do not buy a persistent disk to preserve this guard. Public live requests also need a private `VISION_ACCESS_CODE`; configure it as a server secret when preparing the eventual free deployment. Provider quotas are not replaced by this application limit.

## Verification boundary

Automated Gemini tests use mocked HTTP envelopes. The browser test server (`node scripts/mock-vision-server.js --gemini`, port 3007) labels every returned observation **SIMULATED TEST RESPONSE · NOT AI INFERENCE** and never contacts Google. Its review UI populated four pending parts, flagged a removed terminal as uncertain, blocked conversion until correction and re-acceptance, then built a circuit and identified reversed D1 through the real engineering engine. No console warnings/errors occurred. The harness is excluded from `dist`.

After a real key is configured, successful schema parsing does not establish circuit-recognition accuracy. Evaluate actual visible terminals manually, preserve uncertainty, and report any discrepancy. A corrected digital model cannot verify hidden contacts or physical hardware safety.
