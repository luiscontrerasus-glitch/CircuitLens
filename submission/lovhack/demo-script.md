# LovHack Season 3 demo emphasis

Emphasize execution and the complete correction loop: the same graph that detects a reversed LED passes after the student fixes its terminals. Clearly separate the provider-simulated review segment from actual deterministic analysis.

# Demo script — 2–3 minutes

**0:00–0:20 — Problem.** “An LED that stays dark could mean reversed polarity, a missing connection, or something we cannot see. CircuitLens makes the evidence inspectable.”

**0:20–0:50 — Separate visual perception from reasoning.** Show the three clearly labeled synthetic vision images. Explain that live analysis sends only pixels, with consent, and that a reference is never sent to the model. State the current API-credit blocker before presenting any simulated material. Do not repeatedly trigger known quota failures.

**0:50–1:25 — Review.** For a developer demonstration, run the explicitly labeled simulated provider harness and show candidate boxes, terminal scores, accept/reject, a missing detection, and LED A/B edits. Narrate “This provider response is simulated for interface testing, not a successful AI inference.” Alternatively show the captured simulated-review screenshot. Never remove its label. There is currently no genuine recorded-model replay to show.

**1:25–2:10 — Working engineering demo.** On the normal app choose the fixture “A light that stays dark.” Confirm the netlist and analyze. Show the reversed-LED evidence and specific fix. Change D1 A to D12 and B to D18, re-confirm and analyze: the fault clears and the simple-path current estimate is 9.1 mA. Explain that the physical diagram is unchanged when the netlist is edited.

**2:10–2:35 — Reliability.** Show “One row away”: the graph reports an open path. Show “The first light”: no supported-rule faults. These results come from the real deterministic engine using fixture netlists, not image recognition.

**2:35–2:55 — Honest scope.** “The runtime visual API path is implemented and tested with mocks; live extraction remains unverified because every current provider attempt ran out of credits. Manual correction keeps the workbench usable. We have 39 passing automated tests, but no real-photo benchmark or measured learning outcomes.”

Once usable API credits are confirmed, replace the simulated segment with an actual request, retain provenance, review all detections, and update the evidence files. Do not claim this future demonstration has already happened.
