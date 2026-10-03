import test from "node:test";
import assert from "node:assert/strict";
import { assemblyGeometry } from "../public/assembly.js";
import { cameraAt } from "../public/cinematic.js";
import { examples } from "../src/examples.js";
import { analyze } from "../src/engine.js";
import { canBuildObservations } from "../public/perception-ui.js";

test("assembly preserves component identity, terminal orientation and engine findings in all seven demos", () => {
  for (const fixture of examples) {
    const result = analyze(fixture.circuit);
    const model = assemblyGeometry(fixture.circuit, result.issues);
    assert.equal(model.length, fixture.circuit.components.length);
    for (const part of model) {
      assert.equal(part.id, fixture.circuit.components[part.index].id);
      assert.equal(
        part.faulty,
        result.issues.some((issue) => issue.components.includes(part.id)),
      );
      const radians = (part.angle * Math.PI) / 180;
      assert.ok(
        Math.abs(part.start.x + Math.cos(radians) * part.length - part.end.x) <
          1e-8,
      );
      assert.ok(
        Math.abs(part.start.y + Math.sin(radians) * part.length - part.end.y) <
          1e-8,
      );
    }
  }
});
test("review build stays unavailable for pending, unresolved and duplicate accepted parts", () => {
  const part = {
    id: "D1",
    type: "led",
    a: { hole: "D12" },
    b: { hole: "D18" },
    review: "accepted",
  };
  assert.equal(canBuildObservations({ components: [part] }), true);
  for (const changed of [
    { review: "pending" },
    { type: "unknown" },
    { a: { hole: null } },
    { b: { hole: "A31" } },
    { type: "resistor", value: null },
    { type: "button", closed: null },
  ])
    assert.equal(
      canBuildObservations({ components: [{ ...part, ...changed }] }),
      false,
    );
  assert.equal(
    canBuildObservations({ components: [part, { ...part }] }),
    false,
  );
  assert.equal(canBuildObservations({ components: [] }), false);
  assert.equal(
    canBuildObservations({
      components: [
        part,
        { ...part, id: "ignored", review: "rejected", a: { hole: null } },
      ],
    }),
    true,
  );
});
test("unresolved terminals never create fabricated physical connections or shift editable indices", () => {
  const model = assemblyGeometry({
    components: [
      { id: "unknown", type: "wire", a: "?", b: "A1" },
      { id: "valid", type: "led", a: "D12", b: "D18" },
      { id: "invalid", type: "wire", a: "A31", b: "GND" },
    ],
  });
  assert.deepEqual(
    model.map((part) => [part.id, part.index]),
    [["valid", 1]],
  );
  const reverse = assemblyGeometry({
    components: [{ id: "valid", type: "led", a: "D18", b: "D12" }],
  })[0];
  assert.equal(Math.abs(reverse.angle - model[0].angle), 180);
});
test("continuous camera interpolation stays finite and continuous across story transitions", () => {
  for (const invalid of [NaN, Infinity, undefined])
    assert.deepEqual(cameraAt(invalid), cameraAt(0));
  assert.deepEqual(cameraAt(-1), cameraAt(0));
  assert.deepEqual(cameraAt(2), cameraAt(1));
  for (let i = 1; i < 6; i++) {
    const before = cameraAt(i / 6 - 1e-6),
      after = cameraAt(i / 6 + 1e-6);
    before.forEach((value, j) => assert.ok(Math.abs(value - after[j]) < 0.001));
  }
});
