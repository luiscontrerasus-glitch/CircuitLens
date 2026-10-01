# Demo script — approximately 2–3 minutes

## 0:00–0:20 · The problem

Show the landing page.

“A breadboard can look right and still do nothing. CircuitLens helps a beginner connect a visible wiring mistake to the electrical reason behind it.”

## 0:20–0:45 · Make the model explicit

Click **A light that stays dark**. Point to the **Generated example** label, then the terminal table and intended design.

“This demo uses an original generated diagram with known terminals. For a real photo, the user enters and confirms the terminals. This MVP does not claim automatic component recognition.”

## 0:45–1:15 · Find and explain

Check confirmation and click **Analyze connections**. Show the LED polarity finding and reference differences.

“The engine merges breadboard strips and jumpers into electrical nets. Here the cathode reaches power while the anode reaches ground. Every finding provides evidence, why it matters, and a correction.”

## 1:15–1:45 · Fix and verify

Set D1 terminal A to **D12** and B to **D18**. Confirm again and analyze.

“Changing the model invalidates the old result. The corrected model now has no supported-rule faults. This 9.1 milliamp estimate assumes a two-volt LED drop and a simple series path; it is not a hardware measurement.”

## 1:45–2:10 · Show technical range

Choose **Crossed rails**, confirm, and analyze. Show the critical direct-short finding. Then choose **Split the difference**, confirm, and analyze to show **2.50 V**.

“The same engine catches a rail short and calculates an ideal unloaded divider. These outputs are recomputed from the editable netlist.”

## 2:10–2:35 · Close with scope

Expand **Inspect the circuit graph**.

“CircuitLens is a working, local-first foundation for AI-assisted debugging. Today the perception step is manual, while graph checks are deterministic and testable. The next step is evaluated vision proposals, feeding this same review and validation workflow.”

## Recovery

If a photo or file picker causes trouble, return to a generated example. If you accidentally edit the wrong field, reload the example. No network or AI service is needed for the core demonstration.
