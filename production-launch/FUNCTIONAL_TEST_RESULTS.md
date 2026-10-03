# Final functional verification

October 3, 2026; launch built on `60c827c`. `npm test` completed with **64 passed, 0 failed, 0 skipped, 0 cancelled** in approximately 1.12 seconds. The former 51-test suite is preserved; three cost-boundary tests and ten Gemini-specific tests were added. All 54 entries in the original launch table below still pass; the ten additional cases follow. Provider calls in tests use injected mocks, never the real OpenAI service.

## All automated test results

Every entry below passed. Names are condensed only for readability.

| #   | Test                                                                | Result |
| --- | ------------------------------------------------------------------- | ------ |
| 1   | HTTP API, validation, security, static assets                       | Pass   |
| 2   | Assembly identity, orientation, findings across seven demos         | Pass   |
| 3   | Review blocks pending, unresolved, duplicate accepted parts         | Pass   |
| 4   | Unresolved terminals do not fabricate physical connections          | Pass   |
| 5   | Continuous camera interpolation is finite and continuous            | Pass   |
| 6   | Cinematic scroll scene boundaries and invalid-input clamps          | Pass   |
| 7   | Separate marketing/workspace accessible entry points                | Pass   |
| 8   | Breadboard strips connect within each half and row                  | Pass   |
| 9   | Jumper union is transitive                                          | Pass   |
| 10  | Healthy fixture                                                     | Pass   |
| 11  | Reversed fixture                                                    | Pass   |
| 12  | Missing-resistor fixture                                            | Pass   |
| 13  | Disconnected fixture                                                | Pass   |
| 14  | Short fixture                                                       | Pass   |
| 15  | Divider fixture                                                     | Pass   |
| 16  | Button fixture                                                      | Pass   |
| 17  | Series current and divider output                                   | Pass   |
| 18  | Comparison tolerates physical relocation                            | Pass   |
| 19  | Missing/extra components and value mismatch                         | Pass   |
| 20  | Resistor-bypass wire creates unsafe LED path                        | Pass   |
| 21  | Open button interrupts conduction                                   | Pass   |
| 22  | Low resistance flags estimated overcurrent                          | Pass   |
| 23  | Reject malformed input and duplicate IDs                            | Pass   |
| 24  | Live evaluation CLI fails closed in free mode                       | Pass   |
| 25  | Default free launch blocks provider despite a key; seven demos work | Pass   |
| 26  | Explicit enablement without credentials remains unavailable         | Pass   |
| 27  | Seven diagrams fit narrow/wide canvases without topology changes    | Pass   |
| 28  | Unmeasured canvas and invalid zoom defaults                         | Pass   |
| 29  | Strict perception schema rejects malformed fields                   | Pass   |
| 30  | Unknown holes/resistance remain unresolved                          | Pass   |
| 31  | Low confidence requires explicit review                             | Pass   |
| 32  | Empty observations cannot produce passing empty circuit             | Pass   |
| 33  | Confirmed healthy perception feeds deterministic engine             | Pass   |
| 34  | Confirmed reversed perception feeds deterministic engine            | Pass   |
| 35  | Confirmed disconnected perception feeds deterministic engine        | Pass   |
| 36  | Human polarity correction clears deterministic fault                | Pass   |
| 37  | Rejected detection excluded; unknown accepted part blocks           | Pass   |
| 38  | Image decoder rejects non-image/SVG/corrupt/oversized input         | Pass   |
| 39  | Valid PNG normalized without fixture metadata                       | Pass   |
| 40  | Provider request uses image/strict schema without intended design   | Pass   |
| 41  | Quota/network/malformed-provider errors fall back without retries   | Pass   |
| 42  | Schema-invalid model JSON blocked from netlist conversion           | Pass   |
| 43  | Provider refusals preserve review fallback                          | Pass   |
| 44  | UTC ledger reset and same-day cooldown                              | Pass   |
| 45  | Persistent daily limit counts failures                              | Pass   |
| 46  | Serialization and unreadable-ledger fail-closed behavior            | Pass   |
| 47  | Compact diagrams preserve editable parts and symbol bounds          | Pass   |
| 48  | Terminal labels agree across all 300 breadboard holes               | Pass   |
| 49  | Schematic preserves editable parts and engine-only highlighting     | Pass   |
| 50  | Imported labels escaped; unresolved terminals unrendered            | Pass   |
| 51  | Mock vision HTTP consent/conversion/origin/fallback                 | Pass   |
| 52  | Public live access-code requirement; manual engine stays open       | Pass   |
| 53  | Color mask highlights saturated pixels without source mutation      | Pass   |
| 54  | Dark/transparent pixels excluded                                    | Pass   |

## Additional Gemini tests � all passed

| #   | Test                                                                    | Result |
| --- | ----------------------------------------------------------------------- | ------ |
| 55  | Pixel/schema request to fixed free image model; no tools or key URL     | Pass   |
| 56  | Default Gemini routing; no old OpenAI-key reuse; Free Tier confirmation | Pass   |
| 57  | Missing key, disallowed model and malformed-image guard                 | Pass   |
| 58  | Sanitized quota/auth/provider/network errors; no retries                | Pass   |
| 59  | Refusal/truncation/unexpected parts/malformed/oversized JSON rejection  | Pass   |
| 60  | Independent validation and uncertainty retained for human review        | Pass   |
| 61  | Reviewed observations feed engine; polarity correction clears fault     | Pass   |
| 62  | HTTP consent/image/budget guard and accepted-observation conversion     | Pass   |
| 63  | HTTP blocks key without billing-disabled confirmation                   | Pass   |
| 64  | Distinct Gemini/OpenAI/recorded/simulated UI provenance                 | Pass   |

Gemini browser harness: four pending observations populated the existing editor. Clearing D1's terminal flagged uncertainty and blocked conversion. Editing resets acceptance; after correcting and re-accepting D1, the model built and the engine identified its reversed polarity. The simulated disclosure remained visible on desktop and mobile, with no mobile document overflow or console warnings/errors. These checks used mocked Gemini responses, not a live Google request. Actual-photo accuracy remains pending key setup.

## Production build and smoke

`npm run check`: **40 JavaScript files passed syntax checks**. `npm run build`: **59 allowlisted files**. The production package started on port 3005 and `scripts/smoke-production.js` passed **49 assets/routes**, CSP checks, and all seven fixture analyses. No perception requests were made. `production-smoke.json` contains exact findings and measurements. Docker execution and public hosting were not tested; deployment is awaiting account sign-in.

| Example           | API outcome | Findings | Physical / schematic components |
| ----------------- | ----------- | -------- | ------------------------------- |
| Healthy LED       | pass        | 0        | 4 / 4                           |
| Reversed polarity | review      | 4        | 4 / 4                           |
| Open connection   | review      | 2        | 4 / 4                           |
| Missing resistor  | critical    | 3        | 4 / 4                           |
| Crossed rails     | critical    | 3        | 5 / 5                           |
| Voltage divider   | pass        | 0        | 4 / 4                           |
| Push-button LED   | pass        | 0        | 5 / 5                           |

All seven examples were opened in the production browser in **both representations**. Faults were visibly highlighted on the affected model parts; explanations came from deterministic rules. R1 selection persisted between Physical and Schematic with the matching inspector. D1 evidence and reversed terminals agreed; Swap A/K, confirmation, and Analyze produced **Checks passed** on desktop and mobile. Zoom reached 125%; Fit and keyboard zero restored the complete diagram.

Export used the application's JSON fallback in this browser, yielding four corrected components. New/reset cleared the model; importing the exported JSON restored D1 anode D12/cathode D18 and re-analysis passed. The native file-download behavior still needs a physical-phone check. Generated PNG upload worked on desktop and mobile, with the image name and manual-review path visible. Live Analyze image and consent were disabled and the free-mode explanation was visible outside collapsed advanced settings.

Malformed JSON import was rejected. Browser verification initially found its global alert hidden behind the Connections modal; the implementation now repeats errors inside that open dialog and clears old dialog errors on the next operation. A fresh production reload verified the visible in-dialog error. No failed request or console warning/error was observed during the exercised production flows.

Home/workbench links, example navigation, mobile library and inspector open/close/scroll, reduced-motion schematic default, and zero-transition behavior passed. See `browser-verification.json` and `MOBILE_TEST_RESULTS.md`. Checks used Chromium viewport emulation; touch dispatch was unsupported and no real phone or alternate browser was tested.

Updated images are in `screenshots/`; selection and captions are in `screenshots/SELECTED.md`. Live AI recognition remains unvalidated and disabled, and physical circuit continuity is not measured.
