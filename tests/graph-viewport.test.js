import test from "node:test";
import assert from "node:assert/strict";
import { fitScale, clampZoom } from "../public/graph-viewport.js";
import { schematicMarkup } from "../public/schematic.js";
import { examples } from "../src/examples.js";

test("all seven diagrams fit narrow and wide canvases without changing topology", () => {
  for (const example of examples) {
    for (const [width, height, compact] of [
      [350, 530, true],
      [410, 600, false],
      [850, 650, false],
      [1320, 850, false],
    ]) {
      const markup = schematicMarkup(example.circuit, [], "pass", compact);
      const [, w, h] = /viewBox="0 0 (\d+) (\d+)"/.exec(markup).map(Number);
      const scale = fitScale(width, height, w, h, 20);
      assert.ok(w * scale <= width - 40 + 1e-8, example.id);
      assert.ok(h * scale <= height - 40 + 1e-8, example.id);
      assert.ok(scale > 0, example.id);
    }
  }
});

test("unmeasured canvases and invalid zoom values have safe defaults", () => {
  for (const value of [0, -1, NaN, Infinity]) {
    assert.equal(fitScale(value, 500, 740, 380), 1);
    assert.equal(fitScale(800, value, 740, 380), 1);
  }
  assert.equal(clampZoom(Infinity), 1);
  assert.equal(clampZoom(NaN), 1);
  assert.equal(clampZoom(-2), 1);
  assert.equal(clampZoom(8), 4);
  assert.equal(clampZoom(2.5), 2.5);
});
