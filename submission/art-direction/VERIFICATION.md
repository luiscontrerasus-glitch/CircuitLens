# Redesign verification — 2026-10-03

The marketing website and engineering application now have separate entry points. Three visual directions and the complete desktop/mobile workspace prototype were inspected before implementation. Direction A was selected. The diagnostic engine, references, perception schema, and API security rules remain unchanged.

## Automated and production checks

- `npm test`: 49 tests passed; zero failures, skips, or cancellations. The previous 48 cases are retained; compact schematic coverage checks editable identity, fault counts, and symbol bounds across all seven fixtures.
- `npm run check`: syntax checks passed for 33 JavaScript files.
- `npm run build`: 53 allowlisted production files; secrets and development fixtures excluded.
- Production package started with `node dist/server.js`. `scripts/smoke-production.js` passed all static route/asset requests and all seven deterministic demo outcomes. No perception requests are made by this smoke test. See `production-smoke.json`.
- `npm audit`: zero vulnerabilities. See `audit.json`.
- `npm run security:check`: repository files and reachable Git blobs scanned successfully; environment files remain ignored and untracked. Secret bytes are never printed.
- Prettier and `git diff --check` pass.

## Actual browser interaction checks

- All seven fixtures loaded and analyzed through the example library: healthy LED, reversed LED, open connection, missing resistor, crossed rails, voltage divider, and push-button LED. See `browser-demos.json`.
- LED polarity swap invalidated the old result; confirmation and reanalysis cleared the findings. Opening a closed button produced open-path findings; its exported JSON retained the changed switch state.
- Selection synchronized between physical model, schematic, source image, and contextual inspector. Schematic Enter-key selection and report-to-component navigation were checked.
- Component addition and removal, terminal editing, native modal closing, and library collapse were exercised.
- Exported JSON was read from the export fallback, saved, imported after reset, and reanalyzed against the LED reference: four parts and passing rule checks. The built-in browser did not expose a completed download event during the download check; automatic file saving is not claimed as verified. The visible, copyable JSON fallback and its round trip are verified.
- Reset cleared components, source image, selection, results, and fixture state.
- Image upload and simulated perception review were exercised against the local test harness. Pending or unresolved observations blocked conversion. Accepted, corrected observations created an editable model. Existing observations reopen without rescanning.
- Simulated observations are explicitly labeled “SIMULATED TEST RESPONSE · NOT AI INFERENCE” and “TEST FIXTURE - NOT LIVE AI.” No actual model inference was performed in this redesign QA.
- Console inspection returned no warnings or errors during final application checks.

## Responsive and visual review

Both complete pages were captured and visually reviewed at CSS widths 1440, 1920, 768, and 390. No page-level horizontal overflow or broken images were detected (`viewport-checks.json`). The marketing software photograph intentionally scrolls within its own mobile frame; the actual application uses adapted schematic coordinates and a stacked inspector. Mobile example selection closes the library and keeps the compact navigation available.

OS reduced motion defaults to schematic, with computed transition duration zero. The manual reduced-motion control was also checked. No continuous animation or scroll hijacking is used by the new marketing page.

Visual review prompted fixes for mobile diagram legibility, redundant mobile component rows, physical model scale, fixture provenance in the compact header, reopening observations, and a sticky observation header that overlapped scrolled content. The final desktop/mobile review captures show an accessible close button, readable evidence, and explicit simulation provenance.

Final images contain no terminal windows, private filesystem paths, debugging UI, credentials, or claims of validated live AI. `SELECTED.md` supplies five upload captions and order. Obsolete captures created during this redesign were removed; earlier official screenshots and videos were preserved.

## Limits

Live OpenAI vision, physical hardware continuity, and a real camera capture were not validated in this pass. A generated assembly illustrates logical terminals; it does not infer photo geometry or prove hidden contacts. Ordinary-laptop GPU performance was not measured on a separate device. No new video was commissioned for this replacement art direction; earlier official exports remain historical presentation assets.
