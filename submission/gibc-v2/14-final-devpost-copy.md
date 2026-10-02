# Final Devpost copy

## Project name

CircuitLens — See the fault. Understand the fix.

## Tagline

An inspectable circuit graph. Electrical evidence. A fix you can learn from.

## Inspiration

A breadboard circuit can look complete and still fail because one lead is backwards or one jumper lands a row away. A beginner needs more than a generic answer: they need to see which connection caused the problem and understand the electrical consequence.

## What it does

CircuitLens is an electronics debugging workbench. An observation pane sits beside an editable terminal schematic. Select a component to reach its terminal fields. The deterministic engine checks the reviewed circuit and compares it with an intended design. Findings identify evidence, severity, the electrical reason, and a specific fix. Editing immediately clears stale results; checking again reveals the corrected state.

Seven one-click fixtures demonstrate correct LED wiring, reversed polarity, a missing current limiter, a disconnected jumper, a supply short, an ideal resistor divider and a closed pushbutton. These are disclosed generated diagrams with fixture netlists. They run the real analysis engine without needing a vision request.

The runtime vision adapter takes consented image pixels and proposes structured component observations, boxes, terminal candidates, values and confidence. The review interface places the overlay beside accept/reject/edit controls. All proposals require review; unknown accepted terminals or values block conversion. Manual entry remains available after API failure. Circuit and report JSON can be exported and copied.

## How we built it

Visual perception → structured observations → human review → circuit graph/netlist → deterministic engineering analysis → educational explanation.

The Node server validates and strips image metadata with Sharp. The OpenAI Responses request uses image input and a strict JSON schema; Ajv validates returned observations. The intended circuit is never included in the perception request. The engineering layer maps breadboard row groups, merges ideal conductor nets, traverses passive paths and compares labeled pin connections. Its rule-based explanations remain independent of visual inference.

The original frontend uses HTML, CSS, JavaScript, SVG and Canvas. The redesign treats it as a lab instrument: an original lens-and-trace identity, schematic grids, cyan signal paths, copper evidence accents, component focus states, a healthy-state transition, and inspectable architecture. No large visual framework or stock logo was added. Motion respects system preferences and a user control; smaller screens retain contained graph/table scrolling.

## Challenges and what we learned

Perception uncertainty must stay explicit. A confident-looking box is not proof of continuity. Review changes invalidate both graph construction and prior findings. Rendering the terminal topology also requires matching the engine's breadboard grouping exactly and respecting the production security policy.

API credits were exhausted during earlier live testing. We kept the deterministic core and manual review useful, verified the perception integration with a clearly labeled simulated provider, and never substituted simulated success for a real inference result.

## What works and what is verified

42 automated tests pass, including all 300 terminal-label mappings, safe schematic rendering, original circuit rules and perception integration. The audit reports zero vulnerabilities. The production build starts without credentials and passes 29 asset/route checks plus all seven circuit outcomes. Browser verification covers four viewport widths, uploads, schematic selection, manual correction, education toggling, report copying, simulated perception review, unresolved/rejected detections, quota fallback, reduced motion and clean console checks.

Nine new browser screenshots are packaged. Five are selected for Devpost. A roughly three-minute spoken demo script and shot list tell the reversed-LED → evidence → correction story.

## Exact AI and hardware boundary

Runtime OpenAI vision is implemented but successful live recognition remains unverified. Five prior synthetic-input requests returned HTTP 429, diagnosed as `credit_balance_exhausted` / `insufficient_quota`; there are zero successful saved observations. No additional live calls were made during this redesign. The simulated review screenshot is labeled NOT AI INFERENCE.

All demo illustrations are original synthetic inputs, not hardware photographs. Circuit results describe supplied netlists, not measured continuity. The 9.1 mA LED result is a simple-path estimate, and 2.50 V is an ideal unloaded divider estimate. Scores are uncalibrated. Hidden contacts, split rails, obscured values and unsupported parts still require human judgment. There is no general SPICE solver, recognition benchmark, user study, adoption count or measured learning benefit.

## Why Track 03

The creative contribution is a reviewable boundary between uncertain visual observations and reproducible circuit reasoning. The execution is a functioning, tested workbench. The intended impact is to help students, makers and robotics teams learn a debugging method instead of blindly copying a fix. The interface makes that story visible through the circuit itself.

## Built With

JavaScript, HTML, CSS, SVG, Canvas 2D, Node.js, OpenAI Responses API, gpt-4.1-mini-2025-04-14, Sharp 0.35.5, Ajv 8.20.0, Prettier 3.6.2, npm, Git and Codex. Original code-generated teaching assets and lens/trace mark. Docker and Render deployment recipes are prepared; no public deployment is claimed. Full tool roles/licensing are in 06-built-with.md.

## Build and AI disclosure

The original base commit `e3f6275` and early perception scaffolding began September 30. The October 1 perception/review upgrade `5b5b8c6` and package `1576695` are preserved. The current design/presentation upgrade is a separate commit; dates are not backdated. Codex assisted implementation, debugging, tests, copy and original code-generated visuals. No model training or external image dataset was used.

The repository is locally prepared under MIT, but no public source URL, uploaded video, team identity or eligibility certification is fabricated. Confirm the conflicting event deadline and accepted build state before submitting. This is prepared copy, not an accepted event entry.

## What's next

Once usable credits are established, evaluate consented real circuit photos with component/terminal ground truth and correction rates. Improve grid localization, split-rail handling and passive-pin matching. Test learning outcomes with students before making educational-impact claims.
