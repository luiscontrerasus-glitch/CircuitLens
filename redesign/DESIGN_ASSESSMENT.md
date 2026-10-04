# CircuitLens design assessment and direction

Base: `aff97f5906c8e7116bd51ebb0cbd2362e15afc15`.
Inspected: repository README, package/lockfile, technical handoff, frontend entry points, presentation modules, shared geometry, engine boundary, tests, production allowlist, and deployment/security documentation. Live homepage, workbench, all seven fixture states, and credits were opened in the cloud browser.

## Critical assessment

The existing interface is usable, but passing tests do not establish the quality of its presentation.

| Observed weakness                                                                                                                                               | Design response                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Broad, large headline and separated supporting copy compete with the actual demonstration.                                                                      | A direct breadboard explanation accompanies a tighter headline and an immediately usable instrument panel.                                                                                    |
| Pale blue surfaces dominate the navigation, canvas, and diagnosis, leaving little distinction between their roles.                                              | Graphite navigation, a dark circuit canvas, ivory property controls, and a restrained amber action color.                                                                                     |
| Typography mixes editorial serif flourishes with small technical labels, but terminal IDs use the same proportional face as surrounding copy.                   | Archivo for reading and navigation; system monospace for terminal IDs, supply values, counts, and technical labels.                                                                           |
| Workbench status is split between small text at the top, a findings button, and messages below the canvas. Supply and model size are hidden in settings/report. | A persistent circuit overview exposes the name, exact result category, voltage, part count, and derived net count. Unverified models display no stale net count.                              |
| Switching between physical and schematic views makes visual comparison depend on memory.                                                                        | A desktop linked-view option keeps both representations present and shares selection. Narrow screens retain one legible view at a time.                                                       |
| Component selection relies on small on-board labels or a low-emphasis strip beneath the drawing.                                                                | A separate inspector component selector supplements canvas selection and its keyboard behavior.                                                                                               |
| The example library gives every item the same treatment with little context.                                                                                    | Numbered, searchable examples with short explanatory subtitles and stronger selected state.                                                                                                   |
| A correction, confirmation, and analysis are visually separated.                                                                                                | The component’s terminal editor, evidence card, correction action, and confirmation controls form a consistent reading order.                                                                 |
| The technical handoff describes important uncertainty and recognition limits that need more accessible product-level explanation.                               | A dedicated homepage scope section states exactly what is supported, what is unmeasured, and why public recognition is unavailable.                                                           |
| Several historical stylesheets encode earlier identities.                                                                                                       | New shared tokens and diagram styling, a standalone homepage stylesheet, and a rewritten active workbench refinement layer. Historical styles/assets remain available for archived materials. |

Mobile/tablet rendering of the original was **not inspected**: the available cloud-browser API exposed no viewport-size control. No mobile defect is asserted from a desktop screenshot.

## Visual direction: an engineering instrument

Graphite (`#191d1b`), warm ivory (`#f5f4ee`), muted olive surfaces, and amber (`#dfb66d`). The material references are a bench instrument, a circuit board, and a technical notebook. Color distinguishes navigation, circuit context, and editable properties. Fault and success categories also have explicit text; they do not depend on color alone.

The original reticle mark connects the ideas of a lens and an electrical node. It is a small inline SVG, shared by the navigation and favicon, without an icon dependency. Subtle grid marks support diagram reading. The existing CSS assembly and exact schematic remain real, interactive product views rather than a generated marketing image.

Motion is limited to hover feedback, selection, and the existing restrained physical-board response. No scroll hijacking, artificial progress timer, hero video, or decorative animation library was added. Reduced-motion support is retained.

The homepage sequence is: understand the purpose → try an actual model correction → learn the workflow → inspect example evidence → select one of seven fixtures → understand scope → open the workbench.

## Reference principles, not copied interfaces

- [Linear’s redesign account](https://linear.app/now/how-we-redesigned-the-linear-ui): clear hierarchy among navigation, headers, and views; consistent alignment; restrained visual noise. Applied to the workbench shell and panel relationships.
- [Vercel Geist](https://vercel.com/geist/introduction): consistent component and typographic language. Applied through shared tokens and repeated status/control treatments, without copying Geist components or adding its dependencies.
- [Apple Human Interface Guidelines — Layout](https://developer.apple.com/design/human-interface-guidelines/layout): readable hierarchy and purposeful grouping. Applied to the component editor, related evidence, and next action.

## Implementation boundaries

No changes to `src/`, `server.js`, `render.yaml`, `Dockerfile`, package dependencies, analysis APIs, credentials, provider guards, request budgets, or the allowlisted production-build script. Gemini remains disabled by default. The six-photo evaluation limitation is explicitly preserved.

## Iterations completed

1. Rebuilt homepage structure and established shared colors, type, diagram styling, and navigation.
2. Reworked the workbench shell; added overview, searchable examples, component picker, and linked views.
3. Reviewed state transitions: moved errors outside the mobile-hidden inspector; made header titles follow selected fixtures; added preview-load failure messaging; confirmed edits clear status and counts before re-analysis.
4. Increased tiny metadata labels to at least 10 px in the new styles and darkened sampled small-text colors that failed a 4.5:1 contrast calculation. This is a targeted source-level contrast review, not a complete accessibility audit.

**Visual sign-off remains open.** These iterations were source and simulated-DOM reviews. The cloud browser rejected the local application URL with `net::ERR_BLOCKED_BY_CLIENT`. No rendered redesign screenshots, mobile overflow certification, or pixel-level visual assessment are claimed.
