# $0 launch checklist

Implementation checkpoint October 3, 2026, preserving the design and all history through `60c827c`. Real Gemini recognition and public deployment await the key handoff below.

- [x] Seven deterministic examples work without API credits; manual photo review, editing, and import/export remain available.
- [x] Gemini Free Tier adapter and optional OpenAI alternative implemented and disabled by default, including when an old local key exists. Live evaluation CLI also refuses requests in free mode.
- [x] Clear unavailable explanation; generated examples and mock perception remain distinguished from live recognition.
- [x] Paid Render service/disk recipe replaced by a Free Node service without provider credentials, database, or disk.
- [x] 64 automated tests pass; 40 JavaScript syntax checks pass; production build/start and 49 asset/route smoke checks plus seven analyses pass.
- [x] Dependency audit reports zero vulnerabilities; source/history/build secret scan passes.
- [x] Browser checks cover all seven physical/schematic representations, linked selection/evidence, correction, zoom, import/export/reset, photo upload, navigation, and invalid-import handling.
- [x] Desktop/tablet/mobile viewport and reduced-motion checks pass. No browser console warnings/errors or observed failed requests.
- [x] Updated screenshots, captioned 2:30 demo, narration script, recording guide, and launch documentation saved here. Earlier official presentation assets and the earlier review ZIP are preserved.

## Actions requiring you

First complete `GEMINI_SETUP.md`: create a Gemini API key in an unbilled Free Tier project, save it locally in ignored `.env.local`, and confirm setup. Actual Gemini recognition and deployment are pending this handoff.

1. Push the final commit and sign into your own hosting account; follow `DEPLOYMENT.md` using the Free plan and a workspace with no payment method. Deployment account access was unavailable, so there is no public URL yet. Verify the published URL before submitting it.
2. Run the short physical-phone checklist in `MOBILE_TEST_RESULTS.md`. Browser emulation does not establish camera, touch, downloads, Safari, or real-device behavior.
3. If your submission requires spoken narration, record `DEMO_SCRIPT.md` and add it to the supplied captioned video. Otherwise the existing MP4 is ready to use.

No API purchase, payment information, subscription, or paid plan is required. Gemini photo recognition requires a free API key; examples and manual review require none. Leave live AI disabled until Gemini Free Tier setup and live validation; never enable billing or select OpenAI for this launch. Free hosting is a limited hobby/demo service with cold starts, not an always-on production SLA. No successful live vision, real hardware verification, full WCAG audit, or multi-browser/device certification is claimed.
