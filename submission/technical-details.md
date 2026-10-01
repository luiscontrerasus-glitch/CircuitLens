# Technical details

The frontend uses semantic HTML, responsive CSS, browser ES modules, and Canvas 2D. A Node HTTP server serves both static assets and a JSON analysis endpoint. There is no database or external inference service.

Photos are decoded and resized in browser memory. A pure pixel function creates an optional saturation mask; manual anchors connect findings to photo locations. Entered component terminals, not mask pixels or anchor positions, define electrical connectivity.

The engine maps breadboard holes to conductive strips and uses union-find to merge wires and closed switches. Labeled component edges retain their terminals and properties. Graph traversal tests passive reachability around each LED, while direct rail union detects a supply short. Per-pin net signatures compare an observed build to an intended reference independently of row numbering.

Two calculations are intentionally narrow: a simple series LED current estimate with an assumed 2 V drop, and an unloaded two-resistor divider voltage. Neither is a general circuit simulation. Reports include these assumptions.

HTTP requests have a 128 KB cap, components are schema-validated, browser rendering escapes entered strings, and static paths are confined to the public directory. Tests run through Node's built-in test runner. Prettier is a pinned development dependency; production has none.
