import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  normalizeObservations,
  observationsToCircuit,
  prepareImage,
  perceiveImage,
  MODEL,
} from "../src/perception.js";
import { createVisionBudget } from "../src/vision-budget.js";
import { fixtureObservations } from "../test-support/observations.js";
import { analyze } from "../src/engine.js";
import { references } from "../src/examples.js";
const fakeImage = {
  dataUrl: "data:image/png;base64,aGVsbG8=",
  hash: "test-hash",
  width: 100,
  height: 100,
};
const validResponse = (raw) =>
  new Response(
    JSON.stringify({
      status: "completed",
      output: [
        { content: [{ type: "output_text", text: JSON.stringify(raw) }] },
      ],
      usage: { input_tokens: 100, output_tokens: 100 },
    }),
  );
test("strict schema rejects extra keys, missing fields, malformed boxes and confidence", () => {
  for (const mutate of [
    (r) => (r.unexpected = true),
    (r) => delete r.summary,
    (r) => (r.components[0].bbox.x = 2),
    (r) => (r.components[0].confidence = -1),
    (r) => (r.components[0].a = null),
    (r) => (r.components[0].type = "battery"),
  ]) {
    const raw = fixtureObservations();
    mutate(raw);
    assert.throws(() => normalizeObservations(raw), {
      code: "invalid_observations",
    });
  }
});
test("unknown holes and resistance are retained as unresolved, never guessed", () => {
  const raw = fixtureObservations();
  raw.components[0].a.hole = "TOP_RAIL";
  raw.components[1].value = null;
  const obs = normalizeObservations(raw);
  assert.equal(obs.components[0].a.hole, null);
  assert.equal(obs.components[1].value, null);
  obs.components.forEach((p) => (p.review = "accepted"));
  assert.throws(() => observationsToCircuit(obs, 5), {
    code: "review_required",
  });
});
test("low confidence requires explicit review just like all detections", () => {
  const raw = fixtureObservations();
  raw.components[0].confidence = 0.1;
  const obs = normalizeObservations(raw);
  assert.equal(obs.components[0].confidence, 0.1);
  assert.throws(() => observationsToCircuit(obs, 5), {
    code: "review_required",
  });
  obs.components.forEach((p) => (p.review = "accepted"));
  assert.equal(
    analyze(observationsToCircuit(obs, 5), references.led).status,
    "pass",
  );
});
test("empty observations cannot create a passing empty circuit", () => {
  const raw = fixtureObservations();
  raw.components = [];
  assert.throws(() => observationsToCircuit(normalizeObservations(raw), 5), {
    code: "empty_circuit",
  });
});
for (const id of ["healthy", "reversed", "disconnected"])
  test(`confirmed perception feeds deterministic engine: ${id}`, () => {
    const obs = normalizeObservations(fixtureObservations(id));
    obs.components.forEach((p) => (p.review = "accepted"));
    const result = analyze(observationsToCircuit(obs, 5), references.led);
    if (id === "healthy") assert.equal(result.status, "pass");
    else
      assert.ok(
        result.issues.some(
          (i) =>
            i.code === (id === "reversed" ? "reversed-led" : "open-circuit"),
        ),
      );
  });
test("human polarity correction clears the same deterministic fault", () => {
  const obs = normalizeObservations(fixtureObservations("reversed"));
  const led = obs.components.find((p) => p.id === "D1");
  led.a.hole = "D12";
  led.b.hole = "D18";
  obs.components.forEach((p) => (p.review = "accepted"));
  assert.equal(
    analyze(observationsToCircuit(obs, 5), references.led).status,
    "pass",
  );
});
test("rejected detection excluded; unknown accepted detection blocks", () => {
  const obs = normalizeObservations(fixtureObservations());
  const extra = structuredClone(obs.components[0]);
  extra.id = "X1";
  extra.type = "unknown";
  extra.review = "rejected";
  obs.components.push(extra);
  obs.components.slice(0, 4).forEach((p) => (p.review = "accepted"));
  assert.equal(observationsToCircuit(obs, 5).components.length, 4);
  extra.review = "accepted";
  assert.throws(() => observationsToCircuit(obs, 5), {
    code: "review_required",
  });
});
test("image decoder rejects non-image, SVG, corrupt and oversized input", async () => {
  for (const data of [
    "https://example.com/photo.jpg",
    "data:image/svg+xml;base64,PHN2Zy8+",
    "data:image/png;base64,aGVsbG8=",
    "x".repeat(4500001),
  ])
    await assert.rejects(() => prepareImage(data));
});
test("valid PNG is normalized without fixture metadata", async () => {
  const bytes = await readFile("public/vision-demos/correct.png");
  const image = await prepareImage(
    "data:image/png;base64," + bytes.toString("base64"),
  );
  assert.equal(image.width, 1280);
  assert.equal(image.hash.length, 64);
  assert.ok(image.dataUrl.startsWith("data:image/jpeg;base64,"));
});
test("API request uses image input and strict schema; no intended design or fault output", async () => {
  let request;
  const result = await perceiveImage(fakeImage, {
    apiKey: "test-only-key",
    fetchImpl: async (url, opts) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      request = JSON.parse(opts.body);
      return validResponse(fixtureObservations());
    },
  });
  assert.equal(request.model, MODEL);
  assert.equal(request.store, false);
  assert.equal(request.text.format.strict, true);
  assert.equal(request.input[0].content[1].type, "input_image");
  assert.equal(request.reference, undefined);
  assert.equal(result.observations.components.length, 4);
  assert.equal(result.observations.components[0].review, "pending");
  assert.ok(!JSON.stringify(result).includes("test-only-key"));
});
test("API quota, network and malformed responses fall back without retries or raw errors", async () => {
  for (const [fetchImpl, code] of [
    [
      async () =>
        new Response(
          JSON.stringify({
            error: {
              type: "insufficient_quota",
              code: "credit_balance_exhausted",
              message: "raw test-only-secret",
            },
          }),
          { status: 429 },
        ),
      "insufficient_quota",
    ],
    [
      async () => {
        throw Error("test-only-secret");
      },
      "upstream_unavailable",
    ],
    [async () => new Response("not json"), "invalid_response"],
    [async () => new Response("null"), "invalid_response"],
    [
      async () =>
        new Response(JSON.stringify({ status: "completed", output: {} })),
      "invalid_response",
    ],
    [
      async () =>
        new Response(JSON.stringify({ status: "completed", output: [] })),
      "invalid_response",
    ],
    [
      async () =>
        new Response(JSON.stringify({ status: "incomplete", output: [] })),
      "incomplete_response",
    ],
  ]) {
    let calls = 0;
    await assert.rejects(
      () =>
        perceiveImage(fakeImage, {
          apiKey: "test-only-key",
          fetchImpl: async (...a) => {
            calls++;
            return fetchImpl(...a);
          },
        }),
      (e) => e.code === code && !e.message.includes("test-only-secret"),
    );
    assert.equal(calls, 1);
  }
});
test("model JSON that violates schema never reaches netlist conversion", async () => {
  await assert.rejects(
    () =>
      perceiveImage(fakeImage, {
        apiKey: "test-only-key",
        fetchImpl: async () => validResponse({ components: [] }),
      }),
    { code: "invalid_observations" },
  );
});

test("model refusals preserve review fallback", async () => {
  await assert.rejects(
    () =>
      perceiveImage(fakeImage, {
        apiKey: "test-only-key",
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              status: "completed",
              output: [{ content: [{ type: "refusal", refusal: "test" }] }],
            }),
          ),
      }),
    { code: "incomplete_response" },
  );
});

test("old UTC ledger resets while same-day cooldown blocks rapid reuse", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "circuitlens-budget-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, "ledger.json");
  await writeFile(file, JSON.stringify({ day: "2000-01-01", attempts: 20 }));
  const budget = createVisionBudget({ file });
  await budget.run(async () => 1);
  assert.equal(JSON.parse(await readFile(file, "utf8")).attempts, 1);
  await assert.rejects(() => budget.run(async () => 1), { code: "cooldown" });
});
test("daily usage limit persists and counts failures", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "circuitlens-budget-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const options = {
    file: path.join(dir, "ledger.json"),
    limit: 2,
    cooldownMs: 0,
  };
  const b = createVisionBudget(options);
  await b.run(async () => 1);
  await assert.rejects(() =>
    b.run(async () => {
      throw Error("upstream failed");
    }),
  );
  await assert.rejects(() => createVisionBudget(options).run(async () => 1), {
    code: "daily_limit",
  });
});
test("serialized requests reject concurrent work; unreadable ledger fails closed", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "circuitlens-budget-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, "ledger.json"),
    b = createVisionBudget({ file, cooldownMs: 0 });
  let release;
  const running = b.run(
    () =>
      new Promise((r) => {
        release = r;
      }),
  );
  await assert.rejects(() => b.run(async () => 1), { code: "busy" });
  while (!release) await new Promise((r) => setTimeout(r, 1));
  release(1);
  await running;
  await writeFile(file, "invalid");
  await assert.rejects(() => b.run(async () => 1), {
    code: "budget_unavailable",
  });
});
