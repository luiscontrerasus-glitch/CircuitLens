# Judging notes

The technical contribution is the bridge between an editable physical-build model and explainable electrical checks:

- Breadboard topology normalization and union-find net creation.
- Passive-network path search for LED orientation, open paths, and current-limiter bypasses.
- Reference comparison using labeled pin-net signatures rather than row coordinates.
- Fault localization linked to image annotations and component rows.
- A strict confirmation/invalidation loop that keeps findings tied to reviewed input.
- Tested API, graph rules, original generated fixtures, and local pixel processing.

Ask the presenter to move a correct circuit to other rows, remove the resistor, open the button, or bridge the rails. The result is recalculated, not selected from an expected-output list. Fixture expected codes are used in automated tests, never as analysis outputs.

No runtime LLM is present. The system is not an LLM wrapper, but it also does not satisfy an automatic-photo-recognition claim. Its current scope is transparent assisted review and deterministic validation.
