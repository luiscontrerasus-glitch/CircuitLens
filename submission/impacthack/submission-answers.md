# Submission answers — ImpactHack 2026

## What inspired the project?

The ImpactHack contribution completes and strengthens an existing electronics workbench with structured visual-perception integration and a confidence-aware human review layer. The aim is to make debugging more understandable for beginners while retaining a usable manual path when the model or network is unavailable.

## What does it do?

CircuitLens supports circuit-image review, structured component and terminal suggestions, human correction and deterministic fault explanations. Its live vision request path is implemented. Manual netlists and seven fixtures work without AI. Three new synthetic images are provided for visual evaluation.

## How was it built?

Node and browser JavaScript connect Sharp preprocessing, OpenAI strict structured outputs, Ajv validation, detection-review controls and the pre-existing breadboard graph engine. The intended design never reaches the model; diagnoses and explanations are deterministic.

## What is working and what is unfinished?

39 automated tests pass. Reviewed simulated observations convert to graphs and produce expected correct/reversed/disconnected results. Browser polarity correction and a clean production-package smoke were verified. Five real API attempts failed for exhausted credits; no live visual extraction result or real-photo accuracy is claimed. Deployment reached a login boundary; no public URL exists.

## What is the intended impact?

Explicitly show the prior September 30 workbench and identify the October 1 review/integration additions. Preserve the test-provider label during simulated perception. Discuss educational potential, not demonstrated social outcomes.

## How was AI used?

Codex assisted development. The runtime adapter uses OpenAI gpt-4.1-mini-2025-04-14 for perception only. No custom training or third-party circuit dataset. See ai-disclosure.md for full privacy, synthetic-data and credential limitations.

## What existed before this event?

ImpactHack starts October 1. The base project and preliminary perception/budget scaffolding existed before that date. The rules allow prior foundations only with meaningful new contributions. The October 1 upgrade must be presented as an extension, never as an entirely new October 1 codebase. Organizer acceptance has not been obtained. See build-period-disclosure.md, which also discloses early uncommitted perception work.

## Challenges and lessons

Visual confidence is not certainty. Strict JSON still needs human review. Provider authentication does not guarantee usable credits. A reliable fallback and transparent provenance are necessary to demonstrate only what is actually working.

## Next steps

Resolve usable credits for the configured key, finish three live image evaluations, then collect consented real-photo ground truth and measure terminal accuracy/corrections. Authorize a Node hosting account and connect the repository for deployment.

## Links, team and attestations

Source: local repository on branch codex/circuitlens; no public source URL yet. Demo: local app and screenshots, with a prepared script; no video URL. Team identities, student/age eligibility and organizer attestations must be supplied truthfully by participants. No registration or submission has been performed. Published rules require current high-school students; eligibility is unverified. Educational and technical categories are plausible framing, not an award claim. This is not hardware validation or an independently measured impact study.
