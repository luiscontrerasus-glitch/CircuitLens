# CircuitLens — Make the right connection

## Inspiration

An LED that stays dark can turn a beginner electronics exercise into trial and error. A breadboard photograph shows the parts, but it does not make the electrical nets underneath obvious. CircuitLens helps a builder inspect the assumptions, identify a supported wiring fault and understand why a correction matters.

## What it does

CircuitLens is a working web workbench for small breadboard circuits. It combines an editable circuit model, image review, deterministic graph checks and educational explanations. A user can choose a reference design, confirm component types and terminals, analyze connections, read the evidence and proposed fix, then edit and re-analyze the same circuit.

The upgrade adds an optional structured visual-perception path. A consented image goes to OpenAI with a strict observation schema. The intended circuit is never included. The visual layer is asked for component types, bounding boxes, terminal candidates, LED orientation, visible values, evidence and confidence. Every proposed detection begins pending. Users can accept, reject, edit or add missing information before converting the observations into the existing netlist.

## The hybrid invention

Image → structured visual observations → human confirmation → circuit graph → deterministic rules → educational explanation.

The model handles visual suggestions. The electrical engine maps breadboard strips, merges ideal conductor connections, compares the confirmed topology with a reference and applies supported fault rules. Diagnoses and explanations are reproducible code outputs tied to confirmed terminals. A wrong visual suggestion can be corrected without replacing the engineering engine.

## What works today

Seven guided fixtures demonstrate a correct LED circuit, reversed LED, missing current limiter, disconnected jumper, supply short, resistor divider and pushbutton circuit. These examples load disclosed fixture netlists; their results are computed by the real engine. Manual polarity correction clears the reversed-LED finding. Findings include evidence, an electrical explanation, a specific fix, severity and a qualitative confidence statement.

The detection-review interface is verified end to end using an explicitly simulated provider, including overlays, per-detection decisions, pending state after edits and graph conversion. Manual entry remains usable after a simulated quota failure. The full automated suite passes 39 tests, the dependency audit reports zero vulnerabilities, and a production package starts cleanly without credentials and passes all seven fixture analyses.

## Live AI verification boundary

The runtime OpenAI vision request path is implemented, but successful live recognition is unverified. Five prior live requests on the synthetic inputs (correct three times, reversed once, disconnected once) returned HTTP 429; the provider diagnostic identified `credit_balance_exhausted` / `insufficient_quota`. No additional live requests were made during finalization. There are no saved successful model observations. Simulated perception is labeled explicitly in the development harness and its screenshots.

The three visual inputs are original labeled synthetic teaching diagrams, not hardware photographs. We do not claim photo-recognition accuracy, physical continuity sensing, component measurements, user adoption or learning gains. The project is locally functional and prepared for Node hosting; no public deployment has been completed.

## Why Track 03

CircuitLens combines visual software, graph algorithms, circuit concepts and interface design in a functioning prototype. The creative contribution is the reviewable boundary between uncertain perception and deterministic explanation. Its intended educational value is to help beginners reason about mistakes instead of receiving an unsupported answer.

## Next steps

Complete live image evaluations after usable credits are confirmed, then evaluate consented real photographs with terminal ground truth and correction-rate measurements. Improve grid alignment, split-rail representation and passive-pin matching before expanding component scope. Educational impact should be tested with students rather than assumed.
