# CircuitLens: complete 2:30 narration

Companion to `CircuitLens_Zero_Cost_Demo.mp4`. The supplied video contains captions and actual browser interactions, **without recorded narration or music**. Read this script at a measured pace with short pauses for inspection. All circuits are generated deterministic examples; no live AI recognition or real hardware success is implied.

## 0:00–0:15 — Homepage

CircuitLens helps you follow a circuit's connections, understand a fault, and decide what to change. This demonstration runs entirely without API credits. We're using generated example circuits, with deterministic engineering checks rather than live AI photo recognition.

## 0:15–0:30 — Linked demonstration

The homepage pairs a logical physical assembly with its connection schematic. Select the LED and both views identify the same part. The correction preview updates the model. These positions explain its terminals; they are not geometry inferred from a photograph.

## 0:30–0:45 — Workbench

Opening the workbench gives us the circuit immediately. The example library is on the left, the fitted canvas occupies the center, and the contextual inspector stays on the right. We start from the healthy example, then introduce a known fault.

## 0:45–1:00 — Choose the reversed LED

Choose Reversed polarity. The circuit highlights findings directly on affected components. Selecting D1 brings its anode and cathode into the inspector, alongside the evidence. We can trace the problem without losing sight of the rest of the circuit.

## 1:00–1:20 — Explain the fault

Switch to Schematic. D1 remains selected because both representations share the same editable terminals. The rule finds that the cathode reaches the supply and the anode reaches ground through the passive network. The explanation recommends disconnecting power and swapping the LED leads. These findings describe the reviewed model, not a measurement of hidden contacts.

## 1:20–1:35 — Explore the model

Zoom in to inspect the connections, then Fit restores the complete circuit. Selecting R1 changes the inspector to its related evidence. Returning to D1 restores the LED explanation. Selection, topology, and diagnostics remain linked.

## 1:35–1:55 — Correct and verify

Choose Swap A / K. The model's anode moves to D12 and its cathode to D18. Review the component types, terminals, and values, confirm them, and Analyze connections. The engine runs its supported rules again. The reversed polarity finding clears and the model passes its supported checks.

## 1:55–2:15 — Corrected circuit

Return to Physical to inspect the corrected logical assembly. The selected LED and inspector agree with the schematic. This is a corrected digital model; actual wiring still needs human inspection. The workbench also supports manual photo review, connection editing, and circuit export without API access.

## 2:15–2:30 — Close

All seven examples remain editable and available for free. Optional Gemini recognition uses an unbilled Free Tier project. Actual photo testing found missed parts and incorrect predictions, so every observation needs human review. This video demonstrates generated fixtures. CircuitLens makes engineering evidence inspectable, with the circuit itself at the center.
