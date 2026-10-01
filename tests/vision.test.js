import test from "node:test";
import assert from "node:assert/strict";
import { colorFeatureMask } from "../public/vision.js";
test("color mask highlights saturated pixels without mutating the original", () => {
  const pixels = new Uint8ClampedArray([240, 20, 20, 255, 128, 128, 128, 255]);
  const result = colorFeatureMask(pixels);
  assert.equal(result.selected, 1);
  assert.equal(result.percentage, 50);
  assert.deepEqual([...pixels.slice(0, 4)], [240, 20, 20, 255]);
  assert.deepEqual([...result.data.slice(0, 4)], [210, 242, 81, 255]);
});
test("dark and transparent pixels are not selected", () => {
  assert.equal(
    colorFeatureMask(new Uint8ClampedArray([40, 0, 0, 255, 255, 0, 0, 0]))
      .selected,
    0,
  );
  assert.equal(colorFeatureMask(new Uint8ClampedArray()).percentage, 0);
  assert.throws(() => colorFeatureMask([255, 0, 0]));
});
