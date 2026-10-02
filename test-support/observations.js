import { examples } from "../src/examples.js";
export function fixtureObservations(id = "healthy") {
  const c = examples.find((x) => x.id === id).circuit;
  const point = (h) => {
    if (h === "VCC") return { x: 150 / 1280, y: 160 / 840 };
    if (h === "GND") return { x: 1060 / 1280, y: 660 / 840 };
    const m = /([A-J])(\d+)/.exec(h),
      n = m[1].charCodeAt(0) - 65;
    return {
      x: (170 + (+m[2] - 1) * 43) / 1280,
      y: (260 + n * 27 + (n > 4 ? 28 : 0)) / 840,
    };
  };
  return {
    image_kind: "diagram",
    summary: "SIMULATED TEST OBSERVATIONS. Not a live model response.",
    supply_voltage: 5,
    warnings: [
      "Test fixture derived from a known netlist, exclusively for automated and UI tests.",
    ],
    components: c.components.map((p) => {
      const a = point(p.a),
        b = point(p.b);
      return {
        id: p.id,
        type: p.type,
        confidence: 0.85,
        evidence: "Simulated test input; no inference was performed.",
        a: { hole: p.a, confidence: 0.84, point: a },
        b: { hole: p.b, confidence: 0.82, point: b },
        bbox: {
          x: Math.min(a.x, b.x),
          y: Math.min(a.y, b.y),
          width: Math.max(0.02, Math.abs(a.x - b.x)),
          height: Math.max(0.02, Math.abs(a.y - b.y)),
        },
        value: p.value ?? null,
        closed: p.closed ?? null,
      };
    }),
  };
}
