import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { prepareImage, observationsToCircuit } from "../src/perception.js";
import { canBuildObservations } from "../public/perception-ui.js";

// Archived REAL provider outputs. These tests never make provider requests.
const manifest = JSON.parse(
  await readFile("test-images/real-breadboards/manifest.json", "utf8"),
);

test("six real-photo archives preserve licensed source pixels and actual request provenance", async () => {
  assert.equal(manifest.length, 6);
  for (const item of manifest) {
    assert.ok(
      /^https:\/\/learn\.adafruit\.com\/assets\/\d+$/.test(item.source),
    );
    assert.ok(
      /^https?:\/\/creativecommons.org\/licenses\/by(?:-sa)?\/3\.0\/$/.test(
        item.license,
      ),
    );
    const bytes = await readFile(
      `test-images/real-breadboards/${item.filename}`,
    );
    assert.equal(createHash("sha256").update(bytes).digest("hex"), item.sha256);
    const image = await prepareImage(
      `data:image/jpeg;base64,${bytes.toString("base64")}`,
    );
    const record = JSON.parse(
      await readFile(
        `production-launch/real-photo-results/${item.id}.json`,
        "utf8",
      ),
    );
    assert.equal(record.status, "received");
    assert.equal(record.synthetic, false);
    assert.equal(record.reference_context_sent, false);
    assert.equal(record.provider_http_status, 200);
    assert.equal(record.original_sha256, item.sha256);
    assert.equal(record.provenance.mode, "live");
    assert.equal(record.provenance.provider, "Google Gemini");
    assert.equal(record.provenance.image_sha256, image.hash);
  }
});

test("incomplete actual-photo outputs cannot become diagnoses through pending or blind acceptance", async () => {
  for (const item of manifest) {
    const record = JSON.parse(
      await readFile(
        `production-launch/real-photo-results/${item.id}.json`,
        "utf8",
      ),
    );
    const observations = record.observations;
    assert.ok(
      observations.components.every((part) => part.review === "pending"),
    );
    assert.equal(canBuildObservations(observations), false);
    assert.throws(() => observationsToCircuit(observations, 5), {
      code: "review_required",
    });
    const blindlyAccepted = structuredClone(observations);
    blindlyAccepted.components.forEach((part) => (part.review = "accepted"));
    assert.equal(canBuildObservations(blindlyAccepted), false);
    assert.throws(() => observationsToCircuit(blindlyAccepted, 5), {
      code: "review_required",
    });
  }
});
