# Submission answers — CSC Back-to-School Hackathon

## What inspired the project?

In a school electronics activity, a circuit that does not light up can become a guessing exercise. CircuitLens is designed for a student and teacher to inspect a shared model of the terminals, explain the error and test a correction. A classroom can use its guided circuits even without API credits.

## What does it do?

CircuitLens supports circuit-image review, structured component and terminal suggestions, human correction and deterministic fault explanations. Its live vision request path is implemented. Manual netlists and seven fixtures work without AI. Three new synthetic images are provided for visual evaluation.

## How was it built?

Node and browser JavaScript connect Sharp preprocessing, OpenAI strict structured outputs, Ajv validation, detection-review controls and the pre-existing breadboard graph engine. The intended design never reaches the model; diagnoses and explanations are deterministic.

## What is working and what is unfinished?

39 automated tests pass. Reviewed simulated observations convert to graphs and produce expected correct/reversed/disconnected results. Browser polarity correction and a clean production-package smoke were verified. Five real API attempts failed for exhausted credits; no live visual extraction result or real-photo accuracy is claimed. Deployment reached a login boundary; no public URL exists.

## What is the intended impact?

Anchor the story in an electronics club or classroom scenario, explicitly hypothetical. Show the learning explanation, manual fallback and a student correcting polarity. Do not claim classroom trials or a school partnership.

## How was AI used?

Codex assisted development. The runtime adapter uses OpenAI gpt-4.1-mini-2025-04-14 for perception only. No custom training or third-party circuit dataset. See ai-disclosure.md for full privacy, synthetic-data and credential limitations.

## What existed before this event?

The published event dates are September 4–October 4, 2026, encompassing this September 30/October 1 development. The page header and rules prose disagree about the October 5 deadline hour; confirm the submission time with the organizer instead of relying on this draft. See build-period-disclosure.md, which also discloses early uncommitted perception work.

## Challenges and lessons

Visual confidence is not certainty. Strict JSON still needs human review. Provider authentication does not guarantee usable credits. A reliable fallback and transparent provenance are necessary to demonstrate only what is actually working.

## Next steps

Resolve usable credits for the configured key, finish three live image evaluations, then collect consented real-photo ground truth and measure terminal accuracy/corrections. Authorize a Node hosting account and connect the repository for deployment.

## Links, team and attestations

Source: local repository on branch codex/circuitlens; no public source URL yet. Demo: local app and screenshots, with a prepared script; no video URL. Team identities, student/age eligibility and organizer attestations must be supplied truthfully by participants. No registration or submission has been performed. Tailored to the current CSC Back-to-School event, not CSC Hacks at Pitt. Published eligibility is high-school students ages 13–18; the user’s age/student status has not been verified. AI assistance must be disclosed.
