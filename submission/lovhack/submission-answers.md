# Submission answers — LovHack Season 3

## What inspired the project?

CircuitLens turns a familiar maker frustration into a usable learning workflow. Instead of an opaque answer to a circuit photograph, it offers inspectable observations, editable connections and an electrical explanation the builder can challenge.

## What does it do?

CircuitLens supports circuit-image review, structured component and terminal suggestions, human correction and deterministic fault explanations. Its live vision request path is implemented. Manual netlists and seven fixtures work without AI. Three new synthetic images are provided for visual evaluation.

## How was it built?

Node and browser JavaScript connect Sharp preprocessing, OpenAI strict structured outputs, Ajv validation, detection-review controls and the pre-existing breadboard graph engine. The intended design never reaches the model; diagnoses and explanations are deterministic.

## What is working and what is unfinished?

39 automated tests pass. Reviewed simulated observations convert to graphs and produce expected correct/reversed/disconnected results. Browser polarity correction and a clean production-package smoke were verified. Five real API attempts failed for exhausted credits; no live visual extraction result or real-photo accuracy is claimed. Deployment reached a login boundary; no public URL exists.

## What is the intended impact?

Emphasize execution and the complete correction loop: the same graph that detects a reversed LED passes after the student fixes its terminals. Clearly separate the provider-simulated review segment from actual deterministic analysis.

## How was AI used?

Codex assisted development. The runtime adapter uses OpenAI gpt-4.1-mini-2025-04-14 for perception only. No custom training or third-party circuit dataset. See ai-disclosure.md for full privacy, synthetic-data and credential limitations.

## What existed before this event?

The published build window is September 26–October 4, 2026. This project was started September 30 and upgraded October 1. No work from older user projects was reused. Participant eligibility and final submission status remain unverified. See build-period-disclosure.md, which also discloses early uncommitted perception work.

## Challenges and lessons

Visual confidence is not certainty. Strict JSON still needs human review. Provider authentication does not guarantee usable credits. A reliable fallback and transparent provenance are necessary to demonstrate only what is actually working.

## Next steps

Resolve usable credits for the configured key, finish three live image evaluations, then collect consented real-photo ground truth and measure terminal accuracy/corrections. Authorize a Node hosting account and connect the repository for deployment.

## Links, team and attestations

Source: local repository on branch codex/circuitlens; no public source URL yet. Demo: local app and screenshots, with a prepared script; no video URL. Team identities, student/age eligibility and organizer attestations must be supplied truthfully by participants. No registration or submission has been performed. Do not claim use of Lovable or deAPI: neither built nor powers this app. Sponsor-specific eligibility is not claimed. The folder is tailored to the current Season 3 edition; confirm this matches the intended event.
