# Demo video — three-minute story

Target: approximately 3:00 at a natural pace, with short pauses while the circuit changes. English narration. No hardware footage is required or implied. All circuit inputs shown here are original synthetic diagrams. Perception footage uses the explicitly labeled development test provider; do not relabel it as live AI.

## 0:00–0:20 — A light that stays dark

“This circuit should light an LED. It has power, a resistor, and a return wire. But the LED stays dark. Something is wrong. Where do you start when every connection looks almost right?

CircuitLens turns that question into a circuit you can inspect.”

Show the reversed-LED generated diagram, then the new landing screen. Launch “Diagnose a dark LED.” The demo loads a disclosed fixture and runs the actual rule engine in one click.

## 0:20–0:50 — Make the connections explicit

“Here is the observation. Beside it is the structure: power, breadboard groups, components, and ground. This is an editable terminal graph. The generated diagram is labeled; we are analyzing its fixture netlist, not pretending a model recognized hardware.

Select the LED and CircuitLens takes you straight to its anode and cathode. Every connection is something you can inspect and change.”

Select D1 in the schematic. Show its two terminal fields. Return to the workbench, then use the diagnostics shortcut.

## 0:50–1:20 — Reveal the evidence

“The engine finds reversed polarity. The cathode reaches power; the anode reaches ground through the passive network. An LED normally conducts in the opposite direction.

The report shows the evidence, the electrical reason, and the fix: disconnect power and swap the leads. It also compares these connections with the intended design. These explanations come from deterministic rules.”

Keep the first polarity finding readable. Briefly toggle “Explain the why.” Select “Inspect D1.”

## 1:20–1:50 — Fix, then re-check

“Let's correct the model. The anode goes to D12; the cathode goes to D18. Editing immediately clears the old result. After checking the terminals, I run the analysis again.

Now the supported checks pass. The simple series-path estimate is 9.1 milliamps. That's a calculated estimate, not a physical measurement. We have gone from a dark LED to an explanation we can verify.”

Edit D1, confirm, analyze. Pause on the healthy banner and estimate. Show the corrected schematic if time permits.

## 1:50–2:20 — Make uncertainty visible

“For uploaded images, the vision adapter proposes components, boxes, terminals, and confidence. This review footage is explicitly simulated. Successful live extraction is still unverified because our previous OpenAI requests ran out of credits.

The review interface works: inspect the overlay, accept or reject a part, and correct its terminal candidates. Unknown connections block graph construction. Manual entry remains available when the API fails.”

Cut to the labeled simulated review. Show accepted and pending states beside the image. Never show credentials, access codes, terminal windows, or private paths.

## 2:20–3:00 — Explain the architecture and impact

“AI observes. A person reviews. The engineering engine reasons about the resulting netlist. CircuitLens separates those jobs so an uncertain visual guess cannot silently become an electrical fact.

Seven one-click examples cover polarity, missing jumpers, shorts, current limiting, dividers, and switches. The project passes 42 automated tests and its production smoke checks. The workbench also works on smaller screens and supports reduced motion.

For students, makers, and robotics teams, the opportunity is to learn how to debug, rather than blindly copy a fix. Real-photo evaluation and classroom testing come next. CircuitLens: see the fault, understand the fix.”

Show the architecture section, then the demo library. End on the wordmark/hero. Record the actual app; no fake console output, inference success, learning outcomes, or public URL.
