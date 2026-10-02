# Built with — complete technologies and tools

| Technology / tool                                 | Actual use                                                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| JavaScript ES modules                             | Browser and server source                                                                            |
| HTML / CSS                                        | Interface and responsive layout                                                                      |
| Canvas 2D, DOM, File/Blob, fetch                  | Image display, overlays, local imports/exports, requests                                             |
| Node.js 24.14.1 (tested), Node 22.8+ prerequisite | HTTP server, filesystem, URL/path, crypto, assertions and built-in tests                             |
| OpenAI Responses API                              | Runtime image input and strict structured observations; successful live inference remains unverified |
| gpt-4.1-mini-2025-04-14                           | Selected pretrained vision-capable model; no training/fine-tuning                                    |
| Sharp 0.35.5                                      | Image decoding, resizing, metadata removal and synthetic SVG-to-PNG generation                       |
| Ajv 8.20.0                                        | JSON-schema validation                                                                               |
| Prettier 3.6.2                                    | Source/document formatting                                                                           |
| npm and package-lock.json                         | Pinned dependency installation and audit                                                             |
| Git                                               | Preserved base and separate upgrade commit                                                           |
| Codex                                             | AI-assisted source, tests, debugging, documentation and code-generated artwork                       |
| Codex browser tools                               | Actual local UI interaction and screenshots                                                          |
| Python / PowerShell                               | Development file operations and HTTP smoke checks; not application runtime                           |
| Dockerfile / node:24-bookworm-slim                | Prepared container recipe; not built/run here                                                        |
| Render blueprint                                  | Prepared single-process Node deployment; not provisioned                                             |

Original CircuitLens source is MIT licensed. Ajv/Prettier use MIT; Sharp uses Apache-2.0 and bundled native dependencies retain their licenses. Full transitive versions and metadata are in the lockfile and installed dependency packages. OpenAI is a paid external service with separate terms; judges can run manual mode without an API key.

**Data and assets:** no external circuit-photo dataset, stock imagery or training data. Seven original generated SVG fixtures and three labeled synthetic PNG visual inputs were created by code. Simulated observations come from known netlists only in test support/development harnesses, which are excluded from the production artifact.

**Hardware:** development/test computer only. No physical breadboard, camera capture, sensors, measurements, GPU training or tested circuit hardware. No React, Next.js, Python backend, SPICE or sponsor API is part of the runtime.
