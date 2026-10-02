# Technical implementation

## Visual contract and image preprocessing

The server validates JPEG/PNG/WebP input with Sharp 0.35.5, caps size and input pixels, rotates/resizes to at most 1600 pixels and re-encodes without source metadata. The OpenAI Responses adapter uses `gpt-4.1-mini-2025-04-14`, image input, `store:false` and strict JSON-schema output. Ajv 8.20.0 independently validates the response. Unknown holes and values remain unresolved.

The contract includes image kind, summary, visible supply voltage, component IDs/types, normalized boxes, terminal points/hole candidates, LED anode/cathode order, values, switch state, evidence, warnings and scores. The model sees no intended circuit and produces no final fault diagnosis. No model training or recognition benchmark was performed.

## Review and deterministic reasoning

All observations start pending. Review controls show model and endpoint confidence, accept/reject decisions, editable fields and manual additions. Scores are uncalibrated. Edits invalidate results and return the detection to pending. Accepted observations feed the pre-existing netlist validation and engineering engine.

A–E and F–J row strips are mapped separately for rows 1–30. Union-find merges wires and closed switches. Resistors and LEDs remain edges. Passive-path traversal and labeled pin-net comparison check open paths, polarity, current-limiter omissions, shorts, bypasses, component/value and connection differences. Reference IDs and A/B pin conventions matter. Explanations come from deterministic templates. Simple series LED estimates assume a 2 V drop; divider estimates assume no output load.

## Failure and security boundaries

The provider path uses a 60-second timeout, bounded requests and sanitized errors. Calls are serialized, have no automatic retry, and count toward a persistent limit of at most 20 attempts per UTC day including failures. Public live requests require a private access code. The ledger requires one server process and persistent storage. This is not a provider spend cap.

`OPENAI_API_KEY` stays in ignored server `.env.local` locally or a host secret in production. The allowlisted build excludes credentials, usage state and test providers. Uploaded photos are not saved by the app; provider processing policies apply. Manual analysis remains usable after API failure.

## Evidence and deployment

Upgrade commit: `5b5b8c6`, preserving base `e3f6275`. Full suite: 39 passed, zero failed. Audit: zero vulnerabilities. Production startup without credentials, seven route/asset checks and seven fixture results passed. Browser review/correction and simulated quota fallback passed. Live inference successes: zero.

Dockerfile and Node Render blueprint are prepared. Container execution is unverified because Docker was unavailable. Render reached login; no public service or public repository exists. Original source is MIT licensed, with separate dependency/API terms.
