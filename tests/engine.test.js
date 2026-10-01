import test from "node:test";
import assert from "node:assert/strict";
import {
  nodeOf,
  createGraph,
  compareCircuits,
  analyze,
} from "../src/engine.js";
import { examples, references } from "../src/examples.js";
test("breadboard strips connect only within each half and row", () => {
  assert.equal(nodeOf("A1"), nodeOf("E1"));
  assert.notEqual(nodeOf("E1"), nodeOf("F1"));
  assert.notEqual(nodeOf("A1"), nodeOf("A2"));
  assert.throws(() => nodeOf("A31"));
  assert.throws(() => nodeOf("__proto__"));
});
test("jumper union is transitive", () => {
  const g = createGraph({
    voltage: 5,
    components: [
      { id: "W1", type: "wire", a: "VCC", b: "A1" },
      { id: "W2", type: "wire", a: "E1", b: "F2" },
    ],
  });
  assert.equal(g.root(nodeOf("J2")), g.power);
  assert.notEqual(g.power, g.ground);
});
for (const example of examples)
  test(`fixture: ${example.id}`, () => {
    const result = analyze(example.circuit, references[example.reference]);
    for (const code of example.expectedCodes)
      assert.ok(
        result.issues.some((i) => i.code === code),
        `Missing ${code}`,
      );
    if (!example.expectedCodes.length) assert.equal(result.issues.length, 0);
  });
test("correct series current and divider output", () => {
  assert.equal(analyze(references.led).measurements[0].value, "9.1 mA");
  assert.equal(analyze(references.divider).measurements[0].value, "2.50 V");
});
test("comparison tolerates physical relocation", () => {
  const c = structuredClone(references.led);
  for (const p of c.components)
    for (const k of ["a", "b"])
      p[k] = p[k].replace(/\d+/, (s) => String(Number(s) + 1));
  assert.deepEqual(compareCircuits(c, references.led), []);
});
test("detect missing components, extra components and value mismatch", () => {
  const c = structuredClone(references.led);
  c.components.find((p) => p.id === "R1").value = 1000;
  assert.ok(
    compareCircuits(c, references.led).some((d) => d.code === "value-mismatch"),
  );
  c.components = c.components.filter((p) => p.id !== "D1");
  assert.ok(
    compareCircuits(c, references.led).some(
      (d) => d.code === "missing-component",
    ),
  );
  c.components.push({
    id: "R9",
    type: "resistor",
    a: "A20",
    b: "A21",
    value: 100,
  });
  assert.ok(
    compareCircuits(c, references.led).some(
      (d) => d.code === "unexpected-component",
    ),
  );
});
test("a wire bypassing a resistor creates unsafe LED path", () => {
  const c = structuredClone(references.led);
  c.components.push({ id: "W3", type: "wire", a: "B5", b: "B12" });
  const codes = analyze(c).issues.map((i) => i.code);
  assert.ok(codes.includes("missing-resistor"));
  assert.ok(codes.includes("bypassed-component"));
});
test("open button interrupts conduction", () => {
  const c = structuredClone(references.button);
  c.components.find((p) => p.id === "S1").closed = false;
  assert.ok(analyze(c).issues.some((i) => i.code === "open-circuit"));
});
test("low resistor value flags estimated LED overcurrent", () => {
  const c = structuredClone(references.led);
  c.components.find((p) => p.id === "R1").value = 50;
  assert.ok(analyze(c).issues.some((i) => i.code === "high-led-current"));
});
test("reject malformed input and duplicate IDs", () => {
  assert.throws(() => analyze({ voltage: 5, components: [null] }));
  const c = structuredClone(references.led);
  c.components.push(c.components[0]);
  assert.throws(() => analyze(c));
  assert.throws(() => analyze({ voltage: Infinity, components: [] }));
  assert.throws(() =>
    analyze({
      voltage: 5,
      components: [{ id: "R1", type: "resistor", a: "A1", b: "A2", value: 0 }],
    }),
  );
});
