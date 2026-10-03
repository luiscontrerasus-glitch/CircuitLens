# Responsive and mobile verification

Tested October 3, 2026 in the built-in Chromium browser against the production server. These are browser viewport checks, **not physical-device tests**.

| Viewport             | Result                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop, 1440 × 1000 | Homepage and workbench fit; circuit, library, inspector, and zoom controls accessible; no horizontal document overflow.              |
| Tablet, 768 × 1024   | Homepage reflows and workbench uses its adapted schematic; library and inspector remain usable; no horizontal document overflow.     |
| Mobile, 390 × 844    | Homepage stacks the linked demonstration; workbench circuit fits above a scrolling inspector sheet; no horizontal document overflow. |

Passed: homepage/workbench navigation, example-library open/close, component selection, schematic/physical switching, zoom to 125% and Fit, inspector open/scroll/close, reversed-LED terminal swap and confirmed re-analysis to Checks passed. Uploading a local generated PNG through the mobile file chooser succeeded. The disabled live-recognition explanation remained clear. Inspector content scrolls independently; its lower controls are intentionally below the initial sheet fold.

Reduced-motion emulation selected the schematic and yielded a `0s` component transition. Desktop keyboard zoom/Fit was exercised. Baseline DOM checks found the language, main landmark, skip link, one homepage h1, and no unnamed visible buttons. This was not a full screen-reader or WCAG conformance audit.

The browser rejected the touch-event emulation command as unsupported. Click and keyboard interaction checks therefore do not validate real pinch/pan gestures, touch target comfort, virtual keyboards, camera permissions, or mobile Safari rendering.

The new Gemini observation-review dialog was also checked at 390 × 844 with mocked responses. Its simulated-response disclosure remained visible and document overflow was false. This verifies UI wiring and layout, not real recognition or account quota.

## Short phone checklist

- Open the published HTTPS URL in your phone's Safari or Chrome; scroll the entire homepage and open an example.
- Tap D1, scroll the inspector to its correction controls, swap A/K, confirm, analyze, and close the sheet. Check the graph stays usable as the address bar changes height.
- Test zoom buttons/Fit, portrait/landscape rotation, and any supported drag/pan gesture. Do not assume pinch zoom is implemented.
- Upload a camera photo and a saved JPEG/PNG/WebP. Verify the photo opens for manual review and no live-recognition request occurs. Test camera permission behavior on your device.
- Export a corrected circuit, find the downloaded file, import it again, and test New/reset. Check the virtual keyboard does not hide focused terminal fields.
- Enable the phone's Reduce Motion setting and repeat navigation and component selection.

Screenshots: `screenshots/homepage-mobile-complete.jpg`, `workbench-mobile.jpg`, `workbench-mobile-inspector.jpg`, `homepage-tablet-complete.jpg`, and `workbench-tablet.jpg`.

## Actual-photo follow-up

The live Gemini browser request used the licensed `led.jpg` photograph and consent. Two deliberate attempts received HTTP 503 with a clear overloaded-provider explanation and manual entry retained; no automatic retry or paid fallback occurred. The configured desktop and mobile upload/control layouts were reviewed again. Actual CLI responses for all six photographs were separately preserved; browser error handling is not proof of successful live UI recognition. The observations dialog now states the two-terminal component scope and asks users to check missing parts. The source-panel footer was given reserved space after a live-error screenshot revealed crowding at its lower edge.
