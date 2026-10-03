import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { prepareImage, observationsToCircuit } from "../src/perception.js";
import { visionSettings } from "../src/vision-provider.js";
import { createVisionBudget } from "../src/vision-budget.js";
import { analyze } from "../src/engine.js";
import { references } from "../src/examples.js";
if (!process.argv.includes("--live"))
  throw Error(
    "Use --live to authorize up to three model requests for bundled synthetic images. Keep Gemini project billing disabled.",
  );
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (process.env.LIVE_VISION_ENABLED !== "true")
  throw Error(
    "Live evaluation is disabled in $0 mode. No model requests were made.",
  );
const vision = visionSettings();
if (!vision.configured) throw Error(vision.unavailableReason);
const limit = Number(process.env.VISION_DAILY_LIMIT || 20);
if (!Number.isInteger(limit) || limit < 1 || limit > 20)
  throw Error("VISION_DAILY_LIMIT must be 1–20.");
const budget = createVisionBudget({
    cooldownMs: 0,
    limit,
    file: process.env.VISION_USAGE_FILE,
  }),
  results = [];
for (const id of process.argv.includes("--one")
  ? ["correct"]
  : ["correct", "reversed", "miswired"]) {
  const image = await prepareImage(
    "data:image/png;base64," +
      (await readFile(`public/vision-demos/${id}.png`)).toString("base64"),
  );
  try {
    const record = await budget.run(() =>
      vision.perception(image, {
        apiKey: vision.apiKey,
        model: vision.model,
        fetchImpl: async (...args) => {
          const r = await fetch(...args);
          if (process.argv.includes("--diagnostic") && !r.ok) {
            let d;
            try {
              d = await r.clone().json();
            } catch {}
            // Log allowlisted operational categories only, never raw provider messages.
            const allowed = [
              "insufficient_quota",
              "credit_balance_exhausted",
              "rate_limit_exceeded",
              "invalid_api_key",
            ];
            console.log(
              JSON.stringify({
                status: r.status,
                type: allowed.includes(d?.error?.type) ? d.error.type : "other",
                code: allowed.includes(d?.error?.code) ? d.error.code : "other",
              }),
            );
          }
          return r;
        },
      }),
    );
    // Evaluation only: acceptance is simulated to measure model output, not a UI or hardware confirmation.
    const reviewed = structuredClone(record.observations);
    reviewed.components.forEach((p) => (p.review = "accepted"));
    let evaluated;
    try {
      const circuit = observationsToCircuit(reviewed, 5),
        analysis = analyze(circuit, references.led);
      const codes = analysis.issues.map((i) => i.code);
      evaluated = {
        status: analysis.status,
        codes,
        netlist: circuit,
        expected_detected:
          id === "correct"
            ? analysis.status === "pass"
            : codes.includes(
                id === "reversed" ? "reversed-led" : "open-circuit",
              ),
      };
    } catch (e) {
      evaluated = {
        error: e.code || "review_required",
        expected_detected: false,
      };
    }
    if (process.argv.includes("--record"))
      await writeFile(
        `public/vision-demos/${id}.observations.json`,
        JSON.stringify(record, null, 2),
      );
    results.push({ id, provenance: record.provenance, evaluation: evaluated });
    console.log(
      `${id}: ${evaluated.expected_detected ? "expected result" : "needs correction"} (${reviewed.components.length} visible candidates)`,
    );
  } catch (e) {
    results.push({
      id,
      error: e.code || "evaluation_failed",
      message: e.code ? e.message : "Evaluation could not complete.",
    });
    console.log(`${id}: ${e.code || "evaluation_failed"}`);
  }
}
await mkdir("submission/evaluation", { recursive: true });
await writeFile(
  `submission/evaluation/live-vision-${new Date().toISOString().replaceAll(":", "-")}.json`,
  JSON.stringify(
    {
      evaluated_at: new Date().toISOString(),
      synthetic: true,
      acceptance:
        "Simulated for evaluation; every UI proposal still needs human review.",
      results,
    },
    null,
    2,
  ),
);
if (results.some((r) => !r.evaluation?.expected_detected)) process.exitCode = 1;
