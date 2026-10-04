# CircuitLens redesign review package

**Status: implemented locally; visual sign-off and GitHub publication outstanding. Nothing deployed or merged.**

Branch: `circuitlens-astra-redesign`.
Base: `aff97f5906c8e7116bd51ebb0cbd2362e15afc15`.

## What changed

- New graphite/ivory/olive/amber visual identity, custom reticle mark, shared typography and component colors.
- Rebuilt homepage with the real linked circuit demo and working polarity correction, evidence walkthrough, eight-entry example/new-circuit grid, and explicit product limits.
- Workbench overview with actual model voltage, part/net counts, and pass/review/critical/unverified states.
- Searchable example library, an independent component picker, and desktop linked assembly/schematic view.
- Restructured inspector and evidence surfaces; stronger selected, empty, disabled, and error states; a taller scrolling mobile inspector.
- Updated credits to match the visual system. Kept all historical release assets.
- Zero new runtime dependencies. Circuit analysis, provider safeguards, and deployment files are unchanged.

See [the design assessment](DESIGN_ASSESSMENT.md) for criticism, rationale, references, and the scope of inspection.

## Verification

| Check                                     | Result                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Original automated suite                  | 67/67 pass                                                                         |
| JavaScript syntax                         | 43 files pass                                                                      |
| Production build                          | 64 allowlisted files                                                               |
| Production HTTP smoke                     | 54 assets/routes and all seven fixture outcomes pass; zero perception requests     |
| npm audit, runtime dependencies           | 0 vulnerabilities                                                                  |
| Secret scan                               | Pass; environment files remain ignored and untracked                               |
| Repository-wide Prettier check            | Pass                                                                               |
| DOM client regression                     | Pass for desktop/tablet/mobile media-query simulations; rendering is not simulated |
| Actual redesigned-page browser inspection | Blocked                                                                            |
| Desktop/mobile/tablet after screenshots   | Not captured                                                                       |
| GitHub push / PR                          | Blocked by missing authentication                                                  |

### Seven preserved outcomes

| Demonstration     | ID             | Result   |
| ----------------- | -------------- | -------- |
| Healthy LED       | `healthy`      | Pass     |
| Reversed polarity | `reversed`     | Review   |
| Open connection   | `disconnected` | Review   |
| Missing resistor  | `no-resistor`  | Critical |
| Crossed rails     | `short`        | Critical |
| Voltage divider   | `divider`      | Pass     |
| Push-button LED   | `button`       | Pass     |

[Production smoke evidence](qa/production-smoke.json) includes findings and measurements.

### DOM test scope

[The optional DOM harness](qa/dom-regression.mjs) imports the real client modules and calls the real local HTTP API. It verifies the seven demos, component/selection identity, linked views, search/no-results behavior, correction and confirmation, invalidation, zoom/keyboard Fit, dialogs, source view, disabled recognition, valid/invalid imports, netlist export, New, manual component creation, reduced motion, and mobile inspector controls. Homepage checks verify linked selection, actual correction to pass, and restoration to review.

Media-query widths are simulated at 1440, 768, and 390. Image decoding, canvas painting, layout measurements, and ResizeObserver behavior are stubbed. **These tests cannot establish appearance, clipping, responsive overflow, focus visibility, or browser-console correctness.** A full tab-order audit has not been done. The normal `npm test` suite remains dependency-free apart from the existing project dependencies.

## Before screenshots

These are real captures of production, not redesigned screens.

- [Homepage, desktop](screenshots/before-home-desktop.jpg) — 1348 × 926.
- [Workbench, desktop](screenshots/before-workbench-desktop.jpg) — 1363 × 936.
- Individual fixture captures and the original credits page are in `screenshots/`.

Before/after comparison is intentionally unfinished: the available cloud browser cannot reach this session’s local server, and its documented API provides no viewport-size setter. An offline file preview was also explicitly rejected by browser security policy. The original production interface was inspected directly. The redesigned interface has not been rendered in that browser.

## Preview from the delivered bundle

Use your existing repository clone, with a clean working tree. Adjust the bundle path to where you downloaded it:

```sh
git fetch /path/to/CircuitLens-astra-redesign.bundle circuitlens-astra-redesign:refs/heads/circuitlens-astra-redesign
git switch circuitlens-astra-redesign
npm ci
npm start
```

Node 22.8+ is required. Open `http://127.0.0.1:3000/` and `http://127.0.0.1:3000/workbench.html`. The branch starts with public recognition disabled and requires no key. Do not add or enable a provider key for review.

If the branch name already exists locally, fetch into a different review branch rather than force-overwriting it. If this branch later becomes available on GitHub, use `git fetch origin` and switch to `origin/circuitlens-astra-redesign` in a local review branch.

Reproduce standard checks:

```sh
npm test
npm run check
npm run format:check
npm run build
npm run security:check
```

For the optional DOM harness, install `happy-dom` 20.14.5 in a temporary directory outside the repository, then set `CIRCUITLENS_DOM_MODULE` to that installation’s absolute `node_modules/happy-dom/lib/index.js` path. Run `node redesign/qa/dom-regression.mjs workbench 390` (or `768`, `1440`); use `home` to test the homepage. This tooling is not a runtime dependency.

## Remaining acceptance work

1. Open this branch in a reachable local development browser; capture homepage, workbench, and credits at 1440 × 1000, 768 × 1024, and 390 × 844.
2. Inspect all seven fixtures in Physical/Schematic/Source; inspect desktop Linked views. Check actual diagram sizing, label collisions, pan/zoom, fit, and selected-state correspondence.
3. Exercise keyboard tab order, SVG Enter/Space selection, dialogs/Escape/focus restoration, reduced motion, mobile drawer scrolling, and browser-console errors. Check actual text contrast and controls at 200% zoom.
4. Verify image upload and manual review with an actual decoded image, imported netlists, invalid imports, JSON/report downloads, New, and analysis-error handling in the browser.
5. Correct any visual or browser-specific regressions, capture after screenshots, and add them to this package before design acceptance.
6. Authenticate GitHub with repository write access, push only this branch, and create a draft pull request using [PR_BODY.md](PR_BODY.md). Keep production and Render unchanged.

The task’s visual-completion gate is not satisfied yet. Do not merge or deploy based only on passing automated tests.
