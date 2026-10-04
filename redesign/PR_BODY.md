# Redesign CircuitLens homepage and engineering workbench

Draft for owner design review. Actual local desktop/tablet/mobile visual verification is complete. Do not merge or deploy.

The existing interface makes users gather circuit status, selected-part details, and diagnostic evidence from several weakly differentiated regions. This change gives the product a consistent instrument identity and groups the information needed to understand and correct a circuit.

## Changes

- Rebuild the homepage around the actual linked assembly/schematic demo and its deterministic polarity-correction workflow.
- Introduce graphite navigation, ivory controls, muted olive circuit surfaces, amber actions, a custom lens/node mark, and shared typography/diagram styling.
- Add a model overview, searchable numbered examples, inspector component selection, and desktop linked views.
- Refine the terminal editor, evidence cards, mobile inspector, unverified states, error visibility, and preview failure state.
- Preserve all seven fixtures, circuit semantics, manual review, import/export, and disabled public recognition.

No runtime dependency, engine, backend, security guard, credential, or deployment configuration changes.

### Final owner-requested refinements

- Reduce the desktop hero's top padding and demo gap by 36 pixels combined; the interactive demonstration now begins at y=370 in the 1440-pixel capture. Slightly tighten mobile hero spacing.
- Enlarge schematic net/component labels and physical component labels, with a separate size for desktop linked panes. Circuit coordinates, topology, selection and editing remain unchanged.
- Increase mobile secondary text and give navigation, view-switch, zoom and inspector controls 44-pixel minimum targets. Checked 320, 360, 390 and 768-pixel workbench widths without horizontal overflow.
- Re-ran 67/67 tests, production build, seven-demo/54-route production smoke, syntax, formatting and runtime audit. Browser checks verify all seven linked diagrams without clipped labels, synchronized R1 selection, zoom/Fit, mobile correction to pass, homepage correction, reduced-motion schematic and an empty warning/error console.

Latest screenshots are `redesign/screenshots/refined-*.png`; the earlier approved captures are preserved. Evidence: `redesign/qa/refinement-browser-demos.json` and `production-smoke-refined.json`.

## Validation

- 67 original automated tests pass.
- 43 JavaScript syntax checks pass.
- 64-file production build passes.
- 54 HTTP assets/routes and all seven demo outcomes pass in the production smoke test.
- Runtime npm audit: zero vulnerabilities. Secret scan and Prettier checks pass.
- Actual browser review at 1440 × 1000, 768 × 1024, and 390 × 844: all seven Physical/Schematic/Source demo views; linked selection; search; zoom/Fit; mobile inspector and polarity correction; real-photo decoding with Gemini disabled; valid/invalid imports; export/report copy previews; reset; keyboard Space, Escape/focus restoration; reduced-motion schematic with zero-duration transitions.
- Actual screenshots include desktop/mobile complete homepages and workbench inspector states in `redesign/screenshots/after-*.png`. Compared with the preserved production before captures.
- Fixed homepage board-edge clipping and the credits page's missing favicon request, then rechecked the rendered result.
- Earlier optional simulated-DOM evidence remains available; actual browser evidence is in `redesign/qa/browser-verification.json` and `browser-demos.json`.

## Review limitations

No physical-device, full assistive-technology, or 200% browser-zoom audit is claimed. Export JSON/report copy previews were verified; native download delivery was not certified. Gemini remains disabled, and the six-photo 0/6 complete-reconstruction result is preserved. Read `redesign/REVIEW.md` for exact evidence and scope. Production, deployment configuration, and all prior Git history remain intact.

## Visual evidence

- [Desktop homepage](https://github.com/luiscontrerasus-glitch/CircuitLens/blob/circuitlens-astra-redesign/redesign/screenshots/refined-home-desktop.png)
- [Desktop linked workbench](https://github.com/luiscontrerasus-glitch/CircuitLens/blob/circuitlens-astra-redesign/redesign/screenshots/refined-workbench-desktop.png)
- [Mobile homepage](https://github.com/luiscontrerasus-glitch/CircuitLens/blob/circuitlens-astra-redesign/redesign/screenshots/refined-home-mobile.png)
- [Mobile workbench and inspector](https://github.com/luiscontrerasus-glitch/CircuitLens/blob/circuitlens-astra-redesign/redesign/screenshots/refined-workbench-mobile-inspector.png)
