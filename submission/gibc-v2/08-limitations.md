# Limitations and verification boundary

- Successful live OpenAI visual extraction is unverified: five calls failed for exhausted credits, with zero saved successful observations.
- Review scores are model estimates, not calibrated probabilities. Hidden continuity, occluded parts, resistor markings, LED physical cues and split rails need human interpretation.
- Synthetic diagrams are easier than real hardware photographs. No real-photo dataset, hardware measurements, recognition-accuracy evaluation or student study was performed.
- Supported scope: wires, resistors, LEDs, effective two-terminal buttons and logical VCC/GND rails. ICs and sensors are unsupported.
- Graph rules are not a full circuit simulator or safety certification. Parallel networks can invalidate simple series estimates. Supply and component ratings must be checked against real parts.
- Reference comparison depends on IDs and A/B conventions. It does not solve arbitrary graph isomorphism or resistor lead interchangeability.
- Browser workbench state clears on refresh; exports preserve netlists, not uploaded photos. Editing a fixture netlist does not alter its original illustration.
- Daily request accounting is for one server process/replica with persistent storage. It is not a monetary spending cap.
- No public deployment or public repository is available. A video script is prepared; no demo video has been recorded or uploaded by this session.
- GIBC deadline text conflicts; current eligibility and acceptance of post-rules-deadline work require confirmation. No registration, organizer approval, award or submission completion is claimed.

## Presentation boundaries

The new schematic is terminal topology before conductor merging, not a physically positioned PCB layout or general circuit simulator. Its successful-state motion is a status cue, not measured current flow. The illustration stays fixed when its editable fixture changes; the netlist, diagram topology and results update. Screenshots prove product behavior on disclosed inputs, not image-recognition accuracy. Browser responsiveness was checked at four widths; no full accessibility audit or all-device certification is claimed.
