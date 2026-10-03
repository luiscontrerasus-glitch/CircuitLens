# Demonstration recording guide

The finished `CircuitLens_Zero_Cost_Demo.mp4` is **150.000 seconds**, 1920 × 1080, H.264, encoded at 30 fps. It has burned-in captions and a persistent generated-circuit/no-live-AI disclosure. There is **no audio narration**. `DEMO_SCRIPT.md` provides the complete voiceover; recording your voice is optional.

The source is actual built-in-browser viewport sampling at approximately five samples per second, edited with reading holds and 0.2-second chapter fades. It is not an uninterrupted 30 fps screen recording. Browser chrome, terminals, private paths, and debug UI are excluded. `demo-timeline.json` records chapter timing and sample counts. The renderer is `scripts/render-free-launch-demo.py`; its capture intermediates stay ignored under `.runtime`.

## Exact sequence for a fresh recording

Rehearse against the production build or published URL. Keep `LIVE_VISION_ENABLED=false`. Close dialogs and use a desktop window large enough to show the complete circuit and inspector. Disable desktop notifications. A browser-only/window recording can use an existing local recording tool; no subscription is needed. Do not record keys, account setup, or terminals.

| Time      | Action                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:15 | Open `/`; hold on the homepage's linked physical/schematic demonstration. State that the examples are generated and deterministic.   |
| 0:15–0:30 | Select D1 in the physical view. Show its linked schematic selection. Use Preview polarity correction.                                |
| 0:30–0:45 | Choose Inspect in workbench from the corrected preview; this opens the healthy example. Let entry/analysis finish.                   |
| 0:45–1:00 | Select Reversed polarity in the library. Let analysis finish. Select D1 in Physical.                                                 |
| 1:00–1:20 | Select Schematic. Hold on D1's reversed terminals and evidence. Read the electrical explanation.                                     |
| 1:20–1:35 | Zoom in, Fit, select R1, then return to D1. Keep the inspector visible.                                                              |
| 1:35–1:55 | Select Swap A / K; inspect D12/D18; check the confirmation checkbox; select Analyze connections. Wait for Checks passed.             |
| 1:55–2:15 | Hold the corrected schematic, then switch to Physical. Show the complete fitted board and corrected terminals.                       |
| 2:15–2:30 | Hold on the corrected circuit. State that seven editable examples and manual review are free and live photo recognition is disabled. |

Do not say that a real LED was repaired, that the photograph was automatically recognized, or that a passing model proves physical safety. The selected example name remains Reversed polarity after editing; its Checks passed status and corrected terminals identify the new result.

## Finished-video review

The entire 4,500-frame export decoded without error. Visual inspection sampled 55 decoded frames from beginning to end, including before/within/after every chapter transition, with full-resolution inspection of the evidence, corrected schematic, and final physical views. The complete graph remains visible; evidence and captions are readable at 1080p; chapter fades are clean; no clipping/overlap, secret, private path, terminal, debug UI, or unsupported live-AI claim was found. This is a frame-based timeline review, not a claim of real-device playback testing. The first render preparation rejected scrollbar-sized captures safely; their actual dimensions were accommodated without cropping and the final export was rendered successfully.

If adding narration, record the script locally, align the nine intervals, and export another 150-second copy. Check headphone/speaker intelligibility and replay the beginning and end. Keep the original captioned export until the narrated version has been reviewed. Do not purchase music, voices, or recording services.
