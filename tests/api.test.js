import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../server.js";
import { references } from "../src/examples.js";
test("HTTP API, validation, security and static assets", async (t) => {
  const server = createServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const health = await fetch(base + "/api/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);
  const home = await fetch(base);
  assert.match(await home.text(), /CircuitLens/);
  assert.match(
    home.headers.get("Content-Security-Policy"),
    /frame-ancestors 'none'/,
  );
  const fixtures = await (await fetch(base + "/api/examples")).json();
  assert.equal(fixtures.examples.length, 7);
  const post = (data) =>
    fetch(base + "/api/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    });
  const good = await post({ circuit: references.led, reference: "led" });
  assert.equal(good.status, 200);
  assert.equal((await good.json()).status, "pass");
  assert.equal(
    (await post({ circuit: references.led, reference: "unknown" })).status,
    400,
  );
  assert.equal((await post(null)).status, 400);
  assert.equal(
    (await post({ circuit: { voltage: 5, components: [{ id: "bad" }] } }))
      .status,
    400,
  );
  assert.equal(
    (await fetch(base + "/api/analyze", { method: "POST", body: "{" })).status,
    400,
  );
  assert.equal(
    (
      await fetch(base + "/api/analyze", {
        method: "POST",
        body: "x".repeat(131073),
      })
    ).status,
    413,
  );
  assert.equal((await fetch(base + "/missing")).status, 404);
  assert.equal((await fetch(base + "/.env")).status, 404);
  for (const example of fixtures.examples) {
    const image = await fetch(base + example.image);
    assert.equal(image.status, 200);
    assert.match(image.headers.get("Content-Type"), /image\/svg/);
  }
});
