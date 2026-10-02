# Submission answers — ML Empowerment Build Challenge 3.0

## What inspired the project?

CircuitLens explores a practical boundary for applied multimodal AI: perception can suggest visible components and terminals, while a person resolves uncertainty and deterministic code reasons about the circuit. Its contribution is the structured review-and-validation system around visual predictions, not model training.

## What does it do?

CircuitLens supports circuit-image review, structured component and terminal suggestions, human correction and deterministic fault explanations. Its live vision request path is implemented. Manual netlists and seven fixtures work without AI. Three new synthetic images are provided for visual evaluation.

## How was it built?

Node and browser JavaScript connect Sharp preprocessing, OpenAI strict structured outputs, Ajv validation, detection-review controls and the pre-existing breadboard graph engine. The intended design never reaches the model; diagnoses and explanations are deterministic.

## What is working and what is unfinished?

39 automated tests pass. Reviewed simulated observations convert to graphs and produce expected correct/reversed/disconnected results. Browser polarity correction and a clean production-package smoke were verified. Five real API attempts failed for exhausted credits; no live visual extraction result or real-photo accuracy is claimed. Deployment reached a login boundary; no public URL exists.

## What is the intended impact?

Open the structured observation contract, point out null unknowns and uncalibrated scores, then demonstrate a correction before deterministic diagnosis. Present failed live attempts transparently. No recognition benchmark or custom trained model is claimed.

## How was AI used?

Codex assisted development. The runtime adapter uses OpenAI gpt-4.1-mini-2025-04-14 for perception only. No custom training or third-party circuit dataset. See ai-disclosure.md for full privacy, synthetic-data and credential limitations.

## What existed before this event?

The current 3.0 rules begin the event September 5, 2026. Development here occurred September 30 and October 1. The rules prose lists October 5 at 9 PM PDT while the page header lists October 9 at 11:45 PM PDT; verify the effective deadline before submitting. Earlier editions are not the target. See build-period-disclosure.md, which also discloses early uncommitted perception work.

## Challenges and lessons

Visual confidence is not certainty. Strict JSON still needs human review. Provider authentication does not guarantee usable credits. A reliable fallback and transparent provenance are necessary to demonstrate only what is actually working.

## Next steps

Resolve usable credits for the configured key, finish three live image evaluations, then collect consented real-photo ground truth and measure terminal accuracy/corrections. Authorize a Node hosting account and connect the repository for deployment.

## Links, team and attestations

Source: local repository on branch codex/circuitlens; no public source URL yet. Demo: local app and screenshots, with a prepared script; no video URL. Team identities, student/age eligibility and organizer attestations must be supplied truthfully by participants. No registration or submission has been performed. Rules target high-school and college students. Student status is unverified. No sponsor tools, training dataset, fine-tuning, performance metrics or prize eligibility beyond these documented facts are claimed.
