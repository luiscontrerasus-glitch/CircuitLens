import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { perceiveGeminiImage, GEMINI_MODEL } from "../src/gemini-perception.js";
import { visionSettings } from "../src/vision-provider.js";
import { observationSchema, observationsToCircuit } from "../src/perception.js";
import { fixtureObservations } from "../test-support/observations.js";
import { analyze } from "../src/engine.js";
import { references } from "../src/examples.js";
import { createServer } from "../server.js";
import {
  canBuildObservations,
  perceptionLabel,
} from "../public/perception-ui.js";

const image = {
  dataUrl: "data:image/jpeg;base64,aGVsbG8=",
  hash: "image-hash",
  width: 100,
  height: 100,
};
const envelope = (raw) => ({
  candidates: [
    {
      finishReason: "STOP",
      content: { parts: [{ text: JSON.stringify(raw) }] },
    },
  ],
  usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200 },
});
const response = (raw) => new Response(JSON.stringify(envelope(raw)));

test("Gemini sends pixels and schema to the fixed free image model without tools or key URLs", async () => {
  let calls = 0;
  const result = await perceiveGeminiImage(image, {
    apiKey: "test-only-gemini",
    fetchImpl: async (url, request) => {
      calls++;
      assert.equal(
        url,
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      );
      assert.ok(!url.includes("test-only-gemini"));
      assert.equal(request.headers["x-goog-api-key"], "test-only-gemini");
      const body = JSON.parse(request.body);
      assert.deepEqual(
        body.generationConfig.responseJsonSchema,
        observationSchema,
      );
      assert.equal(body.generationConfig.responseMimeType, "application/json");
      assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, "LOW");
      assert.equal(
        body.generationConfig.thinkingConfig.thinkingBudget,
        undefined,
      );
      assert.equal(body.generationConfig.temperature, 1);
      assert.equal(body.generationConfig.maxOutputTokens, 12000);
      assert.equal(GEMINI_MODEL, "gemini-3.8-flash");
      assert.deepEqual(body.contents[0].parts[1].inlineData, {
        mimeType: "image/jpeg",
        data: "aGVsbG8=",
      });
      assert.equal(body.tools, undefined);
      assert.equal(body.reference, undefined);
      assert.equal(body.circuit, undefined);
      return response(fixtureObservations());
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.provenance.provider, "Google Gemini");
  assert.equal(result.provenance.mode, "live");
  assert.equal(result.provenance.image_sha256, image.hash);
  assert.equal(result.provenance.usage.output_tokens, 200);
  assert.ok(
    result.observations.components.every((p) => p.review === "pending"),
  );
  assert.equal(canBuildObservations(result.observations), false);
});

test("Gemini defaults never use an existing OpenAI key and require free-tier confirmation", () => {
  const env = { OPENAI_API_KEY: "test-old-key", LIVE_VISION_ENABLED: "true" };
  assert.equal(visionSettings({}, env).provider, "gemini");
  assert.equal(visionSettings({}, env).configured, false);
  env.GEMINI_API_KEY = "test-only-gemini";
  assert.equal(visionSettings({}, env).configured, false);
  env.GEMINI_FREE_TIER_CONFIRMED = "true";
  assert.equal(visionSettings({}, env).configured, true);
  assert.equal(visionSettings({}, env).model, GEMINI_MODEL);
  assert.equal(
    visionSettings({ provider: "openai" }, env).perception.name,
    "perceiveImage",
  );
  assert.throws(() => visionSettings({ provider: "invalid" }, {}));
});

test("Gemini refuses missing credentials, disallowed models and malformed images before any request", async () => {
  let calls = 0;
  const fetchImpl = () => {
    calls++;
    throw Error();
  };
  for (const [img, opts, code] of [
    [image, {}, "not_configured"],
    [
      image,
      { apiKey: "test-only-gemini", model: "paid-image-model" },
      "model_not_allowed",
    ],
    [
      { ...image, dataUrl: "https://example.invalid/image.jpg" },
      { apiKey: "test-only-gemini" },
      "image_format",
    ],
  ])
    await assert.rejects(perceiveGeminiImage(img, { ...opts, fetchImpl }), {
      code,
    });
  assert.equal(calls, 0);
});

test("explicit Flash-Lite selection stays on the verified free allowlist with no fallback", async () => {
  const env = {
    GEMINI_API_KEY: "test-only-gemini",
    GEMINI_FREE_TIER_CONFIRMED: "true",
    LIVE_VISION_ENABLED: "true",
    GEMINI_VISION_MODEL: "gemini-3.5-flash-lite",
    OPENAI_API_KEY: "test-unused-openai",
  };
  const vision = visionSettings({}, env);
  assert.equal(vision.configured, true);
  assert.equal(vision.provider, "gemini");
  let calls = 0;
  const record = await vision.perception(image, {
    apiKey: vision.apiKey,
    model: vision.model,
    fetchImpl: async (url) => {
      calls++;
      assert.ok(url.endsWith("/gemini-3.5-flash-lite:generateContent"));
      return response(fixtureObservations());
    },
  });
  assert.equal(calls, 1);
  assert.equal(record.provenance.model, "gemini-3.5-flash-lite");
  for (const model of [
    "gemini-2.5-flash",
    "gemini-3.8-pro",
    "gemini-3.1-flash-image",
  ])
    assert.equal(visionSettings({ model }, env).configured, false);
});

test("Gemini quota, denied keys, provider errors and network failures are sanitized without retries", async () => {
  for (const [status, code] of [
    [429, "free_quota_exhausted"],
    [403, "key_rejected"],
    [401, "key_rejected"],
    [503, "service_unavailable"],
    [400, "model_error"],
    [404, "model_unavailable"],
  ]) {
    let calls = 0;
    await assert.rejects(
      perceiveGeminiImage(image, {
        apiKey: "test-only-gemini",
        fetchImpl: async () => {
          calls++;
          return new Response("private provider error / secret", { status });
        },
      }),
      (e) =>
        e.code === code &&
        !e.message.includes("private provider error") &&
        !e.message.includes("secret"),
    );
    assert.equal(calls, 1);
  }
  await assert.rejects(
    perceiveGeminiImage(image, {
      apiKey: "test-only-gemini",
      fetchImpl: async () => {
        throw Error("private network details");
      },
    }),
    { code: "upstream_unavailable" },
  );
});

test("Gemini blocks safety refusals, truncated output, unexpected parts and malformed JSON", async () => {
  const bad = [
    {},
    { candidates: [] },
    {
      ...envelope(fixtureObservations()),
      promptFeedback: { blockReason: "SAFETY" },
    },
    {
      candidates: [
        { finishReason: "MAX_TOKENS", content: { parts: [{ text: "{}" }] } },
      ],
    },
    {
      candidates: [
        { finishReason: "STOP", content: { parts: [{ functionCall: {} }] } },
      ],
    },
    {
      candidates: [
        {
          finishReason: "STOP",
          content: { parts: [{ text: "{}", thought: true }] },
        },
      ],
    },
    {
      candidates: [
        { finishReason: "STOP", content: { parts: [{ text: "{broken" }] } },
      ],
    },
  ];
  for (const data of bad)
    await assert.rejects(
      perceiveGeminiImage(image, {
        apiKey: "test-only-gemini",
        fetchImpl: async () => new Response(JSON.stringify(data)),
      }),
    );
  for (const text of ["not-json", "x".repeat(262145)])
    await assert.rejects(
      perceiveGeminiImage(image, {
        apiKey: "test-only-gemini",
        fetchImpl: async () => new Response(text),
      }),
      { code: "invalid_response" },
    );
});

test("Gemini validates observations independently and retains uncertain terminals for human review", async () => {
  const invalid = fixtureObservations();
  invalid.components[0].bbox.x = 2;
  await assert.rejects(
    perceiveGeminiImage(image, {
      apiKey: "test-only-gemini",
      fetchImpl: async () => response(invalid),
    }),
    { code: "invalid_observations" },
  );
  const uncertain = fixtureObservations();
  uncertain.components[2].a.hole = null;
  uncertain.components[2].a.confidence = 0.1;
  const { observations } = await perceiveGeminiImage(image, {
    apiKey: "test-only-gemini",
    fetchImpl: async () => response(uncertain),
  });
  observations.components.forEach((p) => (p.review = "accepted"));
  assert.equal(observations.components[2].a.hole, null);
  assert.equal(canBuildObservations(observations), false);
  assert.throws(() => observationsToCircuit(observations, 5), {
    code: "review_required",
  });
});

test("Reviewed Gemini observations feed the existing engine and polarity correction clears the fault", async () => {
  const { observations } = await perceiveGeminiImage(image, {
    apiKey: "test-only-gemini",
    fetchImpl: async () => response(fixtureObservations("reversed")),
  });
  assert.throws(() => observationsToCircuit(observations, 5), {
    code: "review_required",
  });
  observations.components.forEach((p) => (p.review = "accepted"));
  assert.ok(
    analyze(observationsToCircuit(observations, 5), references.led).issues.some(
      (i) => i.code === "reversed-led",
    ),
  );
  const led = observations.components.find((p) => p.type === "led");
  [led.a, led.b] = [led.b, led.a];
  assert.equal(
    analyze(observationsToCircuit(observations, 5), references.led).status,
    "pass",
  );
});

test("Gemini HTTP integration shares image validation, consent, budget, and review conversion", async (t) => {
  let calls = 0,
    budgetCalls = 0;
  const server = createServer({
    provider: "gemini",
    apiKey: "test-only-gemini",
    freeTierConfirmed: true,
    liveVisionEnabled: true,
    budget: {
      run: (fn) => {
        budgetCalls++;
        return fn();
      },
    },
    perception: (img, opts) =>
      perceiveGeminiImage(img, {
        ...opts,
        fetchImpl: async () => {
          calls++;
          return response(fixtureObservations("reversed"));
        },
      }),
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const config = await (await fetch(base + "/api/vision-config")).json();
  assert.equal(config.provider, "gemini");
  assert.equal(config.configured, true);
  assert.match(config.data_notice, /improve/);
  assert.ok(!JSON.stringify(config).includes("test-only-gemini"));
  const photo =
    "data:image/png;base64," +
    (await readFile("public/vision-demos/reversed.png")).toString("base64");
  const post = (data) =>
    fetch(base + "/api/perceive", {
      method: "POST",
      body: JSON.stringify(data),
    });
  assert.equal((await post({ image: photo })).status, 400);
  assert.equal((await post({ image: "bad", consent: true })).status, 400);
  assert.equal(calls, 0);
  assert.equal(budgetCalls, 0);
  const result = await (await post({ image: photo, consent: true })).json();
  assert.equal(result.provenance.provider, "Google Gemini");
  assert.equal(calls, 1);
  assert.equal(budgetCalls, 1);
  const convert = (obs) =>
    fetch(base + "/api/observations/convert", {
      method: "POST",
      body: JSON.stringify({ observations: obs, voltage: 5 }),
    });
  assert.equal((await convert(result.observations)).status, 409);
  result.observations.components.forEach((p) => (p.review = "accepted"));
  assert.equal((await convert(result.observations)).status, 200);
});

test("Gemini HTTP guard blocks a key without billing-disabled confirmation", async (t) => {
  let calls = 0;
  const server = createServer({
    provider: "gemini",
    apiKey: "test-only-gemini",
    liveVisionEnabled: true,
    freeTierConfirmed: false,
    perception: () => {
      calls++;
    },
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal(
    (await (await fetch(base + "/api/vision-config")).json()).configured,
    false,
  );
  assert.equal(
    (await fetch(base + "/api/perceive", { method: "POST", body: "{}" }))
      .status,
    503,
  );
  assert.equal(calls, 0);
});

test("UI provenance distinguishes Gemini, OpenAI, recorded outputs and simulations", () => {
  assert.match(
    perceptionLabel({ mode: "live", provider: "Google Gemini" }),
    /LIVE GEMINI.*HUMAN REVIEW/,
  );
  assert.match(
    perceptionLabel({ mode: "live", provider: "OpenAI" }),
    /LIVE OPENAI/,
  );
  assert.match(
    perceptionLabel({ mode: "simulated", provider: "Google Gemini" }),
    /NOT AI INFERENCE/,
  );
  assert.match(
    perceptionLabel({ mode: "recorded", provider: "Google Gemini" }),
    /NOT A LIVE REQUEST/,
  );
});
