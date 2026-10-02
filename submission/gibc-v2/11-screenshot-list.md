# Screenshot list and truthful captions

All seven files were captured from the actual locally running app after upgrade commit `5b5b8c6`. They are product screenshots, not design mockups. No screenshot contains credentials. Current capture width is 611 pixels; text is readable, and the responsive layout is the real interface rather than a stretched desktop mockup.

| File                                           | Suggested caption                                                    | Evidence                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| screenshots/01-home.png                        | CircuitLens: make the right connection                               | Real production-build homepage                                        |
| screenshots/02-circuit-review-fixture.png      | Review a generated teaching circuit before analyzing its netlist     | Fixture diagram and working editable circuit UI; no recognition claim |
| screenshots/03-confidence-review-simulated.png | Structured suggestions always need review — simulated test response  | Visible simulation/provenance label and review state                  |
| screenshots/04-fault-explanation-fixture.png   | A reversed LED, explained through confirmed terminal connectivity    | Real deterministic result from fixture netlist                        |
| screenshots/05-corrected-circuit-fixture.png   | Correcting the netlist clears the supported fault                    | Real re-analysis after manual correction; estimate assumptions shown  |
| screenshots/06-visual-overlay-simulated.png    | Inspect component boxes and terminal candidates — simulated provider | Synthetic image and test-provider label visible                       |
| screenshots/07-component-editing-simulated.png | Confirm or correct each terminal candidate — simulated provider      | Actual editable fields and scores; simulation text visible            |

Recommended primary uploads: 01, 04 and 05. Add 02 and 07 to show the review workflow. Preserve the captions and labels on all simulated images. No live model recognition succeeded, and these images must not imply otherwise. The JPGs elsewhere in submission/screenshots are prior baseline materials and are not used as new GIBC evidence here.
