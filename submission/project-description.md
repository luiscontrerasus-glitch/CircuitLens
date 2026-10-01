# CircuitLens — Make the right connection

CircuitLens helps students turn a mysterious breadboard failure into an understandable debugging step. Open a photo or a generated experiment, confirm the parts and terminals, then inspect findings that explain the evidence, electrical consequence, and correction.

Its substantive core is an electrical graph engine. Breadboard strips and jumpers are merged into nets; passive paths expose reversed LEDs, missing current limiters, open circuits, and direct rail shorts. Reference comparison checks labeled pin connectivity rather than image similarity, so moving a correct circuit to different rows preserves agreement.

The working MVP includes seven generated examples, three reference designs, a local color-feature image aid, editable netlists, fault overlays, educational explanations, simple series/divider estimates, JSON interchange, automated tests, and a responsive interface. It runs locally without credentials or production dependencies.

This implementation deliberately keeps a person responsible for photo interpretation. It does not include automatic component recognition, a pretrained vision model, arbitrary circuit simulation, or hardware validation. The product concept is AI-assisted debugging; the delivered foundation is a transparent, rules-based workbench that future evaluated perception systems can feed.
