// Explicit development harness. Never included in the production build.
import { createServer } from "../server.js";
import { normalizeObservations, PerceptionError } from "../src/perception.js";
import { fixtureObservations } from "../test-support/observations.js";
const quota = process.argv.includes("--quota");
const port = quota ? 3004 : 3003;
createServer({
  apiKey: "test-only-key",
  model: "TEST FIXTURE - NOT LIVE AI",
  budget: { run: (fn) => fn() },
  perception: async (image) => {
    if (quota)
      throw new PerceptionError(
        "insufficient_quota",
        "Simulated quota failure. Manual review remains available.",
        429,
      );
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
