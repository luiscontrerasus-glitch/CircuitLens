# Redesign verification

Baseline preserved: `1576695`, perception upgrade `5b5b8c6`, original base `e3f6275`. No engineering-rule implementation was changed by the design work.

## Automated and production

- 42 tests pass, zero failures. Three new schematic tests cover all 300 terminal mappings, fixture component preservation/engine-driven highlighting, escaped labels, unknown terminals, same-group loops, reversed symbol leads and CSP-compatible markup.
- Dependency audit: zero vulnerabilities. No new runtime dependencies.
- Syntax checks and formatter pass. Production allowlist contains 37 files; credentials, usage state, test provider and submission assets remain excluded.
- Clean runtime installation from the lockfile, production startup without a key and 29 nonempty static asset/route checks pass. Production smoke checks all seven reference comparisons: healthy/pass, reversed/review, no-resistor/critical, disconnected/review, short/critical, divider/pass, button/pass.
- Reproducible smoke: start the production package without credentials on port 3005, then run `node scripts/smoke-production.js`. Evidence: `redesign-production-smoke.json`. It makes zero perception requests.

## Real browser verification

The main app, production package and explicitly simulated test harness were checked through the browser.

| Check                         | Result                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Seven one-click fixtures      | Correct engine status; healthy LED 9.1 mA estimate; divider 2.50 V ideal estimate                                  |
| Component schematic selection | D1 selected → D1 terminal A focused; selection marked                                                              |
| Evidence navigation           | Inspect D1 reaches its editable terminal row                                                                       |
| Manual correction             | D18/D12 changed to D12/D18; stale findings disappear, re-confirm/re-check passes                                   |
| Education toggle              | WHY disappears/reappears without changing diagnosis                                                                |
| Report export/copy            | Healthy report JSON generated and 2172 characters selectable in copy fallback                                      |
| Simulated perception          | Consent, boxes, confidence, pending/accepted state and reviewed graph conversion work                              |
| Missing/rejected observations | Missing X1 blocks build; rejecting X1 enables accepted-set conversion                                              |
| Simulated quota error         | Sanitized error, no retry; manual component can still be added                                                     |
| Upload preview                | Correct PNG decodes at 1000×656; no components silently inferred                                                   |
| Color fallback                | Saturation mask works and explains its limited meaning                                                             |
| Screen widths                 | 1440 desktop, 1280 laptop, 768 tablet, 390 mobile inspected; no document overflow                                  |
| Small-screen graph/table      | Scroll within their panes; schematic stays legible rather than shrinking its labels                                |
| Reduced motion                | User control yields signal display:none and trace animation:none; same disable rules present for system preference |
| Console/assets                | No captured browser errors/warnings; no broken images; production asset checks pass                                |

Browser testing is not an all-device or formal accessibility certification. Keyboard focus semantics are implemented; the end-to-end browser flows above primarily use pointer actions. No latency benchmark or physical current measurement is claimed.

## AI boundary and submission assets

Zero live inference requests were made during this redesign. The earlier five attempts all failed with exhausted credits; zero successful saved model observations exist. Simulated providers are excluded from the production artifact. All diagrams are synthetic, not real photographs.

Nine new JPEG captures are in `../gibc-v2/screenshots-final/`; five selections/captions are in file 11. The narration is approximately 391 words and targets a three-minute story. README and submission disclosures are updated. The product remains locally functional; source publishing, public hosting and a recorded/uploaded video have not occurred.

## Security and history

The local key remains ignored/untracked in `.env.local`. The source, public/build outputs and reachable Git history are scanned with `npm run security:check`; plaintext secret bytes are never printed. MIT licensing and original commits are preserved. The final status document records the tested implementation commit separately from its subsequent documentation-only status commit, avoiding a circular self-referential hash claim.
