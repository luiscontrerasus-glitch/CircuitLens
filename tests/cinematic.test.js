import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { sceneAt, storyScenes } from "../public/cinematic.js";

test("cinematic scroll selects stable scenes at boundaries and clamps invalid input", () => {
  assert.equal(sceneAt(-0.1), 0);
  assert.equal(sceneAt(1.1), 6);
  for (const p of [NaN, Infinity, -Infinity, undefined])
    assert.equal(sceneAt(p), 0);
  for (let i = 0; i < 7; i++) {
    assert.equal(sceneAt((i + 0.001) / 7), i);
    assert.equal(sceneAt((i + 0.999) / 7), i);
  }
  assert.equal(sceneAt(1), 6);
});

test("every story scene has an accessible direct control and preserves product entry points", async () => {
  const html = await readFile(
    new URL("../public/index.html", import.meta.url),
    "utf8",
  );
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(
    ids.length,
    new Set(ids).size,
    "duplicate IDs break workbench bindings",
  );
  for (const id of [
    "try-demo",
    "start",
    "live-graph",
    "components",
    "vision-run",
    "vision-apply",
    "analysis-pipeline",
    "pipeline-state",
    "reduce-motion",
    "download-report",
  ])
    assert.ok(ids.includes(id), id);
  assert.equal(
    (html.match(/data-scene-target=/g) || []).length,
    storyScenes.length,
  );
  assert.equal(new Set(storyScenes.map((s) => s.id)).size, 7);
  assert.ok(html.includes("Synthetic explainer"));
  assert.ok(html.replace(/\s+/g, " ").includes("not live inference"));
  assert.ok(
    !html.includes("style="),
    "production CSP forbids inline style attributes",
  );
});
