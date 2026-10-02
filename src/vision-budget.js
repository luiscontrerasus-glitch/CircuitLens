import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { PerceptionError } from "./perception.js";
// One-process guard; use one replica. Persistent attempts include failures, and never auto-retry.
export function createVisionBudget({
  file = path.resolve(".runtime/vision-usage.json"),
  limit = 20,
  cooldownMs = 10000,
} = {}) {
  let busy = false,
    lastAttempt = 0;
  return {
    async run(fn) {
      if (busy)
        throw new PerceptionError(
          "busy",
          "Another image is being analyzed. Try again when it finishes.",
          429,
        );
      if (Date.now() - lastAttempt < cooldownMs)
        throw new PerceptionError(
          "cooldown",
          "Wait ten seconds between live image requests.",
          429,
        );
      busy = true;
      try {
        const day = new Date().toISOString().slice(0, 10);
        let ledger = { day, attempts: 0 };
        try {
          const saved = JSON.parse(await readFile(file, "utf8"));
          if (
            !saved ||
            !/^\d{4}-\d{2}-\d{2}$/.test(saved.day) ||
            saved.day > day ||
            !Number.isInteger(saved.attempts) ||
            saved.attempts < 0
          )
            throw Error("Invalid ledger");
          if (saved.day === day) ledger = saved;
        } catch (e) {
          if (e.code !== "ENOENT")
            throw new PerceptionError(
              "budget_unavailable",
              "Usage ledger is unavailable; live AI is disabled until it is restored.",
              503,
            );
        }
        if (!Number.isInteger(ledger.attempts) || ledger.attempts < 0)
          throw new PerceptionError(
            "budget_unavailable",
            "Usage ledger is invalid.",
            503,
          );
        if (ledger.attempts >= limit)
          throw new PerceptionError(
            "daily_limit",
            `The ${limit}-request daily vision limit has been reached. Manual analysis remains available.`,
            429,
          );
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(
          file + ".tmp",
          JSON.stringify({ day, attempts: ledger.attempts + 1 }),
        );
        await rename(file + ".tmp", file);
        lastAttempt = Date.now();
        return await fn();
      } finally {
        busy = false;
      }
    },
  };
}
