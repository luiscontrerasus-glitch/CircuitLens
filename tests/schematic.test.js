import test from "node:test";
import assert from "node:assert/strict";
import { terminalNet, schematicMarkup } from "../public/schematic.js";
import { nodeOf, analyze } from "../src/engine.js";
import { examples } from "../src/examples.js";

test("schematic terminal labels agree with engine across all 300 breadboard holes", () => {
  for (const column of "ABCDEFGHIJ")
    for (let row = 1; row <= 30; row++) {
      const hole = `${column}${row}`;
      assert.equal(terminalNet(hole), nodeOf(hole));
    }
  for (const h of ["VCC", "GND"]) assert.equal(terminalNet(h), nodeOf(h));
  for (const h of ["", "A31", "K1", "A01", "<script>"])
    assert.equal(terminalNet(h), null);
});
test("schematic retains editable components and only highlights engine findings", () => {
  for (const example of examples) {
    const result = analyze(example.circuit);
    const view = schematicMarkup(example.circuit, result.issues, result.status);
    assert.ok(
      !view.includes("style="),
      "graph must respect the production CSP without inline styles",
    );
    assert.equal(
      (view.match(/data-component=/g) || []).length,
      example.circuit.components.length,
    );
    for (const [index, p] of example.circuit.components.entries()) {
      assert.ok(view.includes(`data-component="${index}"`));
      assert.ok(view.includes(`Edit ${p.id} ${p.type}`));
    }
    assert.equal(view.includes("schematic verified"), result.status === "pass");
  }
});
test("schematic safely escapes imported labels and leaves unresolved terminals unrendered", () => {
  const view = schematicMarkup({
    components: [
      { id: '<img onerror="x">', type: "wire", a: "VCC", b: "GND" },
      { id: "X2", type: "wire", a: "?", b: "GND" },
    ],
  });
  assert.ok(!view.includes("<img"));
  assert.ok(view.includes("&lt;img"));
  assert.equal((view.match(/data-component=/g) || []).length, 1);
  assert.ok(!view.includes("verified"));
  const same = schematicMarkup({
    components: [{ id: "D2", type: "led", a: "A1", b: "E1" }],
  });
  assert.ok(same.includes("SAME GROUP"));
  assert.ok(same.includes('class="trace" d="M52 70H109M165 70V88H52V70"'));
  const reverse = schematicMarkup({
    components: [{ id: "D3", type: "led", a: "GND", b: "VCC" }],
  });
  assert.ok(reverse.includes('class="trace" d="M588 70H348M292 70H52"'));
});
