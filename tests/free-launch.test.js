import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../server.js";
import { examples } from "../src/examples.js";
import { spawnSync } from "node:child_process";

test("live evaluation CLI fails closed in free mode before touching the provider", () => {
  const run = spawnSync(
    process.execPath,
    ["scripts/evaluate-vision.js", "--live", "--one"],
    {
      env: {
        ...process.env,
        LIVE_VISION_ENABLED: "false",
        OPENAI_API_KEY: "test-only-key",
      },
      encoding: "utf8",
    },
  );
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /Live evaluation is disabled in \$0 mode/);
  assert.ok(!run.stderr.includes("test-only-key"));
});

test("default free launch blocks perception despite a key and preserves all seven demos", async (t) => {
  const prior = process.env.LIVE_VISION_ENABLED;
  delete process.env.LIVE_VISION_ENABLED;
  t.after(() => {
    if (prior === undefined) delete process.env.LIVE_VISION_ENABLED;
    else process.env.LIVE_VISION_ENABLED = prior;
  });
  let calls = 0;
  const server = createServer({
    apiKey: "test-only-key",
    budget: {
      run() {
        calls++;
        throw Error("Budget must not run");
      },
    },
    perception() {
      calls++;
      throw Error("Perception must not run");
    },
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const config = await (await fetch(base + "/api/vision-config")).json();
  assert.equal(config.configured, false);
  assert.equal(config.live_enabled, false);
  assert.equal(config.requires_access_code, false);
  assert.match(config.unavailable_reason, /\$0 launch/);
  assert.ok(!JSON.stringify(config).includes("test-only-key"));
  const rejected = await fetch(base + "/api/perceive", {
    method: "POST",
    body: JSON.stringify({ consent: true, image: "unused" }),
  });
  assert.equal(rejected.status, 503);
  assert.equal((await rejected.json()).code, "live_disabled");
  for (const fixture of examples) {
    const r = await fetch(base + "/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        circuit: fixture.circuit,
        reference: fixture.reference,
      }),
    });
    assert.equal(r.status, 200);
    assert.equal(
      (await r.json()).status,
      {
        healthy: "pass",
        reversed: "review",
        "no-resistor": "critical",
        disconnected: "review",
        short: "critical",
        divider: "pass",
        button: "pass",
      }[fixture.id],
    );
  }
  assert.equal(calls, 0);
});

test("explicit enable without credentials stays unavailable and cannot call perception", async (t) => {
  let calls = 0;
  const server = createServer({
    liveVisionEnabled: true,
    apiKey: "",
    perception() {
      calls++;
    },
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const config = await (await fetch(base + "/api/vision-config")).json();
  assert.equal(config.configured, false);
  const r = await fetch(base + "/api/perceive", { method: "POST", body: "{}" });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).code, "not_configured");
  assert.equal(calls, 0);
});
