# CircuitLens refinement

This continues the unfinished refinement after commit `3ee9aed`. The diagnostic engine, seven fixtures, image review, graph editing and previous presentation assets are preserved.

## Selected direction

Three homepage directions were rendered and inspected at desktop and mobile sizes before implementation. The saved prototypes are in `prototypes/`.

| Concept                          | Character                                                                | Decision                                                                      |
| -------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| A: linked assembly and schematic | A light engineering atlas with paired representations and editorial type | Selected: explains the product with an actual inspectable circuit immediately |
| B: fault case study              | Dark physical assembly with a dramatic fault narrative                   | Strong mood, but the schematic and product interaction were less apparent     |
| C: product instrument            | An actual application capture alongside compact introductory copy        | Clear software identity, but screenshot text became too small on mobile       |

The selected implementation uses the real fixture and engineering API. Selecting a component links both representations; previewing the polarity correction actually changes terminals and runs the deterministic engine. Generated geometry and fixture provenance are visible. Archivo supplies the interface type; Georgia italic gives the editorial headings contrast without another font download. Ink blue selection and restrained rust fault marks distinguish interaction from diagnosis.

## Application refinement

The workbench remains a separate application. A compact toolbar, restrained example library, fitted circuit canvas and contextual inspector establish its hierarchy. The assembly occupies the available canvas; schematic strokes, labels, selection targets and fault evidence are clearer. Zoom controls and keyboard `+`, `-`, `0` provide inspection and recovery to fit. Pointer pan and pinch handlers operate on presentation geometry, never circuit topology.

Tablet hides the library by default and retains the inspector. Phone prioritizes a readable compact schematic with a contextual inspector sheet. The sheet scrolls independently and leaves the whole fitted circuit visible above it. Opening the example library closes the sheet. Important controls, connections editing, review and export stay accessible through the existing dialogs.

## Visual review

Both final pages were captured and inspected at 1920, 1440, 768 and 390 CSS pixels. Review corrected an inherited mobile block layout that shrank the diagram, reduced the inspector sheet height, switched tablet homepage diagrams to compact topology, and removed a board resize transition that produced misleading full-page captures. Console review also found and fixed a homepage render race while its initial analysis was pending.

`before/` preserves the prior implementation. `final/SELECTED.md` identifies the five strongest presentation captures; all responsive and simulated-review evidence remains available. Earlier official presentation assets and Git history have not been rewritten.
