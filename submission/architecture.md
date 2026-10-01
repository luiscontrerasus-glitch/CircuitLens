# Architecture

```mermaid
flowchart TD
  subgraph Browser[Browser — no photo transmission]
    Photo[Local JPG / PNG / WebP] --> Resize[Decode and resize]
    Resize --> Mask[Optional saturation mask]
    Mask --> Review[Manual terminal review + anchors]
    Fixture[Generated SVG and netlist] --> Review
    Import[Validated JSON import] --> Review
    Review --> Confirm[User confirmation]
    Output[Findings + overlays + graph + export]
  end
  subgraph Server[Node.js — one process and port]
    Confirm --> API[POST /api/analyze]
    Reference[Three intended reference circuits] --> API
    API --> Validate[Validate schema and bounds]
    Validate --> Union[Breadboard mapping + union-find]
    Union --> Graph[Conductive net graph]
    Graph --> Rules[Fault rules + narrow estimates]
    Graph --> Compare[Labeled pin-net comparison]
    Rules --> Report[Structured evidence and fixes]
    Compare --> Report
  end
  Report --> Output
  Output --> Review
```

`public/app.js` owns transient UI state. `public/vision.js` is the pure pixel mask. `src/engine.js` owns graph construction, comparison, and analysis. `src/examples.js` defines references and editable fixtures. `src/generate-examples.js` creates original SVG/JSON files. `server.js` provides bounded JSON input and static serving.

There is no database, authentication, persistence, model inference, or external runtime service. The browser sends confirmed netlists to its same-origin server. On a public host those netlists reach that host; photos still remain in browser memory.
