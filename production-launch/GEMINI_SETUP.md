# Gemini Free Tier key handoff

Integration and offline verification are complete. **64 tests pass**, including ten Gemini-specific tests. No real Google/OpenAI request has been made during this launch. The live result remains unvalidated until a free-tier key is configured and an actual request succeeds. Existing deterministic demo footage must not be described as live recognition.

## Required personal setup

1. Open [Google AI Studio's API keys page](https://aistudio.google.com/api-keys) and sign in with your Google account. Create an API key in a **new Free Tier project with no linked billing account**. Do not choose Set up billing, add a card, activate a paid tier, or use a billed project. Check the project's Billing Tier is Free Tier. If no free project/model quota is available, stop; manual CircuitLens features remain usable.
2. Keep the key private. In the existing, ignored `.env.local` at the repository root, add/update these entries locally. Do not paste the key into chat or commit it:

```dotenv
VISION_PROVIDER=gemini
GEMINI_API_KEY=your_key_entered_locally
GEMINI_FREE_TIER_CONFIRMED=true
LIVE_VISION_ENABLED=true
```

3. Set `GEMINI_FREE_TIER_CONFIRMED=true` only after checking the project's billing status. It is an operator confirmation, **not an automatic billing-account check**. CircuitLens cannot infer a project's billing status from its key. Changing the project's billing later would invalidate that confirmation; keep billing disabled.
4. Tell me **“Gemini key configured; project is Free Tier and billing is disabled.”** I can then restart the server with the ignored environment file, test one permitted image request, review the actual observations and uncertainty, and continue deployment. You may also identify a circuit photo you are comfortable sending to Google for an actual-photo check. Do not include personal/confidential information in it.

## Integration behavior

The default provider is `gemini`, with the fixed image-understanding model `gemini-2.5-flash`. Google's [pricing page](https://ai.google.dev/gemini-api/docs/pricing) currently lists its input/output as free on the Free Tier. Quotas and account/region availability vary; check the actual project in AI Studio. The integration uses the [GenerateContent REST API](https://ai.google.dev/api/generate-content), image bytes, and a JSON schema, with no grounding tools, file-storage service, automatic retries, or paid fallback.

The key stays server-side in an `x-goog-api-key` header; it is never placed in a request URL or browser configuration. Normalized, metadata-stripped images go to Google only after consent. Google's [unpaid-service terms](https://ai.google.dev/gemini-api/terms) describe data use; the UI discloses that submitted images/responses may improve Google's products.

Gemini proposes observed parts, normalized boxes, terminal candidates, values, visible evidence, confidence, and warnings. Shared Ajv/coordinate/terminal validation rejects malformed output. Safety blocks, truncated JSON, quota exhaustion, invalid keys, and network failures leave manual entry available. Unknown terminals are retained; low confidence and unknowns are flagged; every detection starts pending. Accepted observations populate the existing graph only after review. Circuit diagnoses still come from the deterministic engine.

OpenAI's integration remains available only when explicitly selecting `VISION_PROVIDER=openai` and configuring its credentials. It is outside this $0 launch. An old OpenAI key never enables Gemini or triggers fallback. Do not select it here.

The 20-attempt/day and ten-second cooldown guards remain shared. Free hosting's ephemeral disk can reset the local ledger on restart; Google's unbilled project quota is authoritative. Do not buy a persistent disk to preserve this guard. Public live requests also need a private `VISION_ACCESS_CODE`; configure it as a server secret when preparing the eventual free deployment. Provider quotas are not replaced by this application limit.

## Verification boundary

Automated Gemini tests use mocked HTTP envelopes. The browser test server (`node scripts/mock-vision-server.js --gemini`, port 3007) labels every returned observation **SIMULATED TEST RESPONSE · NOT AI INFERENCE** and never contacts Google. Its review UI populated four pending parts, flagged a removed terminal as uncertain, blocked conversion until correction and re-acceptance, then built a circuit and identified reversed D1 through the real engineering engine. No console warnings/errors occurred. The harness is excluded from `dist`.

After a real key is configured, successful schema parsing does not establish circuit-recognition accuracy. Evaluate actual visible terminals manually, preserve uncertainty, and report any discrepancy. A corrected digital model cannot verify hidden contacts or physical hardware safety.
