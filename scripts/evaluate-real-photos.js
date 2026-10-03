import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { prepareImage, PERCEPTION_PROMPT } from "../src/perception.js";
import { visionSettings } from "../src/vision-provider.js";
import { createVisionBudget } from "../src/vision-budget.js";

// Explicit live invocation only. Never auto-retry failures or select OpenAI.
if (!process.argv.includes("--live"))
  throw Error("Use --live only with a confirmed unbilled Gemini project.");
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const chosenModel = process.argv
  .find((arg) => arg.startsWith("--model="))
  ?.slice(8);
const vision = visionSettings(chosenModel ? { model: chosenModel } : {});
if (vision.provider !== "gemini" || !vision.configured)
  throw Error("Configured, enabled, confirmed Gemini Free Tier is required.");
const output = process.argv.includes("--comparison")
  ? "production-launch/real-photo-results/flash-lite"
  : "production-launch/real-photo-results";
await mkdir(output, { recursive: true });
const manifest = JSON.parse(
  await readFile("test-images/real-breadboards/manifest.json", "utf8"),
);
const selectedId = process.argv
  .find((arg) => arg.startsWith("--id="))
  ?.slice(5);
if (selectedId && !manifest.some((item) => item.id === selectedId))
  throw Error("Unknown manifest image.");
const limit = Number(process.env.VISION_DAILY_LIMIT || 20);
if (!Number.isInteger(limit) || limit < 1 || limit > 20)
  throw Error("VISION_DAILY_LIMIT must be an integer from 1 to 20.");
const budget = createVisionBudget({
  limit,
  file: process.env.VISION_USAGE_FILE,
});
let attempted = false;
for (const item of manifest.filter(
  (item) => !selectedId || item.id === selectedId,
)) {
  const destination = `${output}/${item.id}.json`;
  if (existsSync(destination)) {
    console.log(`${item.id}: recorded already; no repeat request`);
    continue;
  }
  if (attempted) await delay(11000);
  const bytes = await readFile(`test-images/real-breadboards/${item.filename}`);
  const originalHash = createHash("sha256").update(bytes).digest("hex");
  if (originalHash !== item.sha256) throw Error("Source image hash mismatch.");
  const image = await prepareImage(
    `data:image/jpeg;base64,${bytes.toString("base64")}`,
  );
  const started = Date.now();
  let result;
  let providerStatus;
  try {
    attempted = true;
    const recognition = await budget.run(() =>
      vision.perception(image, {
        apiKey: vision.apiKey,
        model: vision.model,
        fetchImpl: async (...args) => {
          const response = await fetch(...args);
          providerStatus = response.status;
          if (!response.ok) {
            // Private diagnostic is redacted before persistence; never print it.
            const diagnostic = (await response.clone().text())
              .replaceAll(vision.apiKey, "[REDACTED]")
              .replace(/AIza[0-9A-Za-z_-]{35}/g, "[REDACTED]");
            await mkdir(".runtime/live-photos", { recursive: true });
            await writeFile(
              `.runtime/live-photos/${item.id}-provider-error.json`,
              diagnostic,
            );
          }
          return response;
        },
      }),
    );
    result = { status: "received", ...recognition };
  } catch (error) {
    result = {
      status: "failed",
      error: error.code || "evaluation_failed",
      message: error.code ? error.message : "Evaluation could not complete.",
    };
    process.exitCode = 1;
  }
  const record = {
    image: item.id,
    source: item.source,
    original_sha256: originalHash,
    prepared_sha256: image.hash,
    evaluated_at: new Date().toISOString(),
    elapsed_ms: Date.now() - started,
    provider_http_status: providerStatus ?? null,
    synthetic: false,
    reference_context_sent: false,
    model: vision.model,
    prompt_sha256: createHash("sha256").update(PERCEPTION_PROMPT).digest("hex"),
    human_acceptance:
      "None. All proposals remain pending; no hardware validation.",
    ...result,
  };
  await writeFile(destination, JSON.stringify(record, null, 2) + "\n");
  console.log(
    JSON.stringify({
      image: item.id,
      status: result.status,
      error: result.error,
      components: result.observations?.components.length,
      elapsed_ms: record.elapsed_ms,
    }),
  );
  if (
    ["free_quota_exhausted", "key_rejected", "daily_limit"].includes(
      result.error,
    )
  ) {
    console.log(
      "Stopped: provider or daily budget gate. No retries or paid fallback.",
    );
    break;
  }
}
