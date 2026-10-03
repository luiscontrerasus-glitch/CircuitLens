# CircuitLens technical handoff

This document describes the current implementation to preserve during the future visual redesign. It is descriptive and does not change the current product.

## Runtime and architecture

CircuitLens is a private, dependency-light Node application. `server.js` serves the static `public/` site and same-origin JSON endpoints. The production build copies an explicit allowlist into `dist/`; it excludes `.env.local`, tests, provider mocks, runtime ledgers, source photographs and presentation files. The server validates JSON and image request sizes, strips image metadata through Sharp, applies a strict content security policy, and exposes deterministic examples through `/api/examples` and `/api/analyze`.

The engineering engine is in `src/engine.js`, with fixtures and reference expectations in `src/examples.js`. It evaluates connectivity, polarity, missing or extra parts, resistance and simple measurements. It is a logical review engine, not a continuity tester, SPICE simulator or hardware safety instrument.

Photo review is split across `src/perception.js`, `src/vision-provider.js`, `src/gemini-perception.js`, and `src/vision-budget.js`. The pipeline validates and normalizes observations, preserves unresolved parts and low confidence, and blocks pending or unsupported observations from silently becoming a circuit. Gemini is the configured optional provider; OpenAI remains an explicit alternative only. The public deployment currently has live recognition disabled.

## UI entry points

`public/index.html` is the editorial homepage: linked physical assembly and schematic demonstration, seven example links, explanation panels, credits, and workbench entry points. `public/workbench.html` is the application surface. Its main regions are the compact navigation bar; collapsible `#example-library`; central `#live-graph` with Physical, Schematic and Source image views; zoom/Fit controls; contextual `#inspector-panel`; and the mobile inspector sheet opened by `#mobile-inspect`.

Selection is shared by the physical assembly, schematic, source-linked observation and inspector. The reversed-polarity narrative selects D1, swaps A/K, confirms reviewed values and runs Analyze connections to clear the deterministic finding.

## Styling and motion

`public/refinement.css` is the primary workbench visual system. `public/cinematic.css` and homepage styles provide the editorial presentation. Layout uses CSS grid and responsive media queries. Desktop is a three-region instrument; tablet and mobile collapse the library and move the inspector into a sheet. The `prefers-reduced-motion` path disables transitions and favors the schematic representation. Preserve semantic labels, skip links, focus states, contrast and no-horizontal-overflow behavior.

## Functionality that must remain

Preserve IDs and expected statuses: `healthy` pass, `reversed` review, `disconnected` review, `no-resistor` critical, `short` critical, `divider` pass, and `button` pass. Preserve Physical/Schematic synchronization, component identity and terminal orientation, findings/evidence links, zoom and Fit, manual image review, consent and unavailable-live-AI messaging, import/export, invalid-import handling, reset/New, keyboard access, reduced motion, and the public access-code gate for any future live provider.

## Verification baseline

The baseline is 67/67 automated tests, 42 JavaScript syntax checks, a 59-file build, 49 public/static smoke routes, zero npm audit vulnerabilities, and a passing secret scan with `.env.local` ignored and untracked. Six licensed real breadboard photographs were tested against Gemini; none produced a complete verified reconstruction. Sources, hashes and outputs are in `test-images/README.md` and `REAL_PHOTO_EVALUATION.md`. Do not describe deterministic fixtures or the demo video as live photo recognition.

Render service `circuitlens-free` runs on the Free Node plan with no card, database, disk or paid add-on. Keep `LIVE_VISION_ENABLED=false` until server-side Gemini credentials and a private `VISION_ACCESS_CODE` are intentionally configured and reviewed. Never commit or expose `.env.local` or provider keys.
