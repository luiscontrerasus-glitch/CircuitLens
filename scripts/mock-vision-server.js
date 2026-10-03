// Explicit development harness. Never included in the production build.
import { createServer } from "../server.js";
import { normalizeObservations, PerceptionError } from "../src/perception.js";
import { fixtureObservations } from "../test-support/observations.js";
import { perceiveGeminiImage, GEMINI_MODEL } from "../src/gemini-perception.js";
const quota = process.argv.includes("--quota");
const gemini = process.argv.includes("--gemini");
const port = gemini ? 3007 : quota ? 3004 : 3003;
createServer({
  provider: gemini ? "gemini" : "openai",
  freeTierConfirmed: gemini,
  apiKey: "test-only-key",
  liveVisionEnabled: true,
  model: gemini ? GEMINI_MODEL : "TEST FIXTURE - NOT LIVE AI",
  budget: { run: (fn) => fn() },
  perception: async (image) => {
    if (quota)
      throw new PerceptionError(
        "insufficient_quota",
        "Simulated quota failure. Manual review remains available.",
        429,
      );
    if (gemini) {
      const result = await perceiveGeminiImage(image, {
        apiKey: "test-only-key",
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              candidates: [
                {
                  finishReason: "STOP",
                  content: {
                    parts: [
                      { text: JSON.stringify(fixtureObservations("reversed")) },
                    ],
                  },
                },
              ],
            }),
          ),
      });
      result.provenance.mode = "simulated";
      return result;
    }
    return {
      observations: normalizeObservations(fixtureObservations("reversed")),
      provenance: {
        mode: "simulated",
        model: "TEST FIXTURE - NOT LIVE AI",
        generated_at: new Date().toISOString(),
        image_sha256: image.hash,
      },
    };
  },
}).listen(port, "127.0.0.1", () =>
  console.log(
    `Simulated UI test server: http://127.0.0.1:${port} (not real AI inference)`,
  ),
);
