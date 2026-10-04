# Redesign CircuitLens homepage and engineering workbench

Draft: visual acceptance is still outstanding. Do not merge or deploy.

The existing interface makes users gather circuit status, selected-part details, and diagnostic evidence from several weakly differentiated regions. This change gives the product a consistent instrument identity and groups the information needed to understand and correct a circuit.

## Changes

- Rebuild the homepage around the actual linked assembly/schematic demo and its deterministic polarity-correction workflow.
- Introduce graphite navigation, ivory controls, muted olive circuit surfaces, amber actions, a custom lens/node mark, and shared typography/diagram styling.
- Add a model overview, searchable numbered examples, inspector component selection, and desktop linked views.
- Refine the terminal editor, evidence cards, mobile inspector, unverified states, error visibility, and preview failure state.
- Preserve all seven fixtures, circuit semantics, manual review, import/export, and disabled public recognition.

No runtime dependency, engine, backend, security guard, credential, or deployment configuration changes.

## Validation

- 67 original automated tests pass.
- 43 JavaScript syntax checks pass.
- 64-file production build passes.
- 54 HTTP assets/routes and all seven demo outcomes pass in the production smoke test.
- Runtime npm audit: zero vulnerabilities. Secret scan and Prettier checks pass.
- Optional simulated-DOM tests exercise actual frontend modules against the real local API. These do not verify layout or painting.

## Outstanding before acceptance

The cloud browser inspected production and captured baseline screenshots, but rejected the local preview. Responsive redesign screenshots, actual browser-console review, full keyboard traversal, upload decoding, and visual iteration remain required. Read `redesign/REVIEW.md` for precise test boundaries and the acceptance checklist.
