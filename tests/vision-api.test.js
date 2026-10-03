import test from "node:test";
import http from "node:http";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "../server.js";
import { normalizeObservations, PerceptionError } from "../src/perception.js";
import { fixtureObservations } from "../test-support/observations.js";
test("vision HTTP integration validates consent, conversion, origins and fallback", async (t) => {
  let calls = 0,
    fail = false;
  const server = createServer({
    provider: "openai",
    apiKey: "test-only-key",
    liveVisionEnabled: true,
    budget: { run: (fn) => fn() },
    perception: async (image) => {
      calls++;
      if (fail)
        throw new PerceptionError(
          "insufficient_quota",
          "API quota unavailable.",
          429,
        );
      return {
        observations: normalizeObservations(fixtureObservations()),
        provenance: {
          mode: "simulated",
          model: "TEST FIXTURE",
          image_sha256: image.hash,
          generated_at: new Date().toISOString(),
        },
      };
    },
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (route, data, headers = {}) =>
    fetch(base + route, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
  const image =
    "data:image/png;base64," +
    (await readFile("public/vision-demos/correct.png")).toString("base64");
  assert.equal((await post("/api/perceive", { image })).status, 400);
  assert.equal(calls, 0);
  assert.equal(
    (
      await post(
        "/api/perceive",
        { image, consent: true },
        { Origin: "https://unrelated.test" },
      )
    ).status,
    403,
  );
  const r = await post("/api/perceive", { image, consent: true });
  assert.equal(r.status, 200);
  const perceived = await r.json();
  assert.equal(calls, 1);
  assert.equal(
    (
      await post("/api/observations/convert", {
        observations: perceived.observations,
        voltage: 5,
      })
    ).status,
    409,
  );
  perceived.observations.components.forEach((p) => (p.review = "accepted"));
  const converted = await post("/api/observations/convert", {
    observations: perceived.observations,
    voltage: 5,
  });
  assert.equal(converted.status, 200);
  assert.equal((await converted.json()).circuit.components.length, 4);
  fail = true;
  const unavailable = await post("/api/perceive", { image, consent: true });
  assert.equal(unavailable.status, 429);
  assert.ok(!(await unavailable.text()).includes("test-only-key"));
  assert.equal(
    (
      await post("/api/analyze", {
        circuit: {
          voltage: 5,
          components: [{ id: "W1", type: "wire", a: "VCC", b: "GND" }],
        },
      })
    ).status,
    200,
  );
  assert.equal((await fetch(base + "/.env.local")).status, 404);
  assert.equal((await fetch(base + "/api/vision-replay/unknown")).status, 404);
  assert.equal(
    (await post("/api/perceive", { image, consent: true }, { Origin: "null" }))
      .status,
    403,
  );
  assert.equal(
    (
      await post("/api/observations/convert", {
        observations: { components: [null] },
        voltage: 5,
      })
    ).status,
    400,
  );
});

test("public live requests require deployment access code; manual engine stays open", async (t) => {
  const prior = process.env.VISION_ACCESS_CODE;
  process.env.VISION_ACCESS_CODE = "test-access-only";
  t.after(() => {
    if (prior === undefined) delete process.env.VISION_ACCESS_CODE;
    else process.env.VISION_ACCESS_CODE = prior;
  });
  let calls = 0;
  const server = createServer({
    provider: "openai",
    apiKey: "test-only-key",
    liveVisionEnabled: true,
    budget: { run: (fn) => fn() },
    perception: async () => {
      calls++;
      return { observations: normalizeObservations(fixtureObservations()) };
    },
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const image =
    "data:image/png;base64," +
    (await readFile("public/vision-demos/correct.png")).toString("base64");
  // Node fetch normalizes Host; use HTTP directly to exercise a public hostname.
  const publicRequest = (route, code, body) =>
    new Promise((resolve, reject) => {
      const req = http.request(
        base + route,
        {
          method: body ? "POST" : "GET",
          headers: {
            Host: "circuitlens.example",
            "Content-Type": "application/json",
            ...(code ? { "x-vision-access-code": code } : {}),
          },
        },
        (res) => {
          let text = "";
          res.on("data", (chunk) => (text += chunk));
          res.on("end", () =>
            resolve({ status: res.statusCode, data: JSON.parse(text) }),
          );
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  const request = (code) =>
    publicRequest(
      "/api/perceive",
      code,
      JSON.stringify({ image, consent: true }),
    );
  assert.equal((await request()).status, 403);
  assert.equal((await request("wrong")).status, 403);
  assert.equal(calls, 0);
  assert.equal((await request("test-access-only")).status, 200);
  assert.equal(calls, 1);
  const config = (await publicRequest("/api/vision-config")).data;
  assert.equal(config.requires_access_code, true);
  assert.ok(!JSON.stringify(config).includes("test-only-key"));
  assert.ok(!JSON.stringify(config).includes("test-access-only"));
});
