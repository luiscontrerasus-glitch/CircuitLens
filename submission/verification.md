# Verification record

Actual software checks performed for this build, in this workspace. This is not hardware validation.

## Environment and commands

- Windows, Node.js 24.14.1, npm 11.11.0.
- `npm test`: **19 tests passed, 0 failed** on the completed engine, API, and pixel-mask modules.
- `npm run check`: JavaScript syntax checks passed.
- `npm run format:check`: source/document formatting checked using pinned Prettier.
- A clean temporary copy containing `server.js`, `package.json`, `src/`, and `public/`, with **no node_modules**, started successfully on port 3002. Its homepage returned HTTP 200, health endpoint returned OK, and all seven examples returned their expected status through HTTP.
- The workspace application was restarted on **http://127.0.0.1:3000**.

## Browser checks

Using the Codex in-app browser:

| Workflow                                | Observed result                                                                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Seven example → confirm → analyze flows | Correct statuses; see `browser-results.json`                                                                                                 |
| Reversed LED                            | Reversal plus three related reference findings                                                                                               |
| Correct D1 A/B to D12/D18               | Old results cleared; re-confirmation required; re-analysis passed with 9.1 mA estimate                                                       |
| Local JPG load                          | Successfully decoded a generated screenshot used as an image-input smoke test                                                                |
| Saturation mask                         | Rendered mask and pixel percentage; pure pixel behavior also covered by automated tests                                                      |
| Manual component addition               | Editable wire entry appeared                                                                                                                 |
| JSON import                             | `public/examples/healthy.json` populated the table and analyzed successfully                                                                 |
| Desktop layout                          | Inspected at a 1440 × 1000 viewport override                                                                                                 |
| Mobile layout                           | Inspected at 390 × 844; fixed hidden table text causing page overflow; document width matched viewport in both empty and populated workbench |
| Browser console                         | No application errors observed during the checked flows                                                                                      |

The initial download-event check timed out in the embedded browser; a saved file was not verified. Export actions also reveal the full JSON in a read-only text area with a select-to-copy fallback. That fallback was tested: the divider report parsed successfully with status `pass`, four components, and `2.50 V`; the select button focused and selected its JSON. Do not describe browser file saving as independently verified.

## Artifacts

- `screenshots/home-desktop.jpg`
- `screenshots/review-desktop.jpg`
- `screenshots/findings-desktop.jpg`
- `screenshots/home-mobile.jpg`
- `screenshots/review-mobile.jpg`
- `browser-results.json`

## Not tested or not implemented

- Real breadboard hardware, hidden electrical continuity, actual LED current, and component ratings.
- Automatic photo component recognition (not implemented), schematic OCR, perspective correction, and learned inference.
- Exhaustive browser/accessibility compatibility and automated continuous browser tests.
- Docker execution or public deployment: Docker and a configured hosting target were absent.
- Throughput, latency benchmarks, user studies, or recognition accuracy.
