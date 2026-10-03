import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { analyze } from "./src/engine.js";
import { examples, references } from "./src/examples.js";
import {
  prepareImage,
  normalizeObservations,
  observationsToCircuit,
  PerceptionError,
} from "./src/perception.js";
import { visionSettings } from "./src/vision-provider.js";
import { createVisionBudget } from "./src/vision-budget.js";
import { timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
const publicDir = path.resolve(
  fileURLToPath(new URL("./public/", import.meta.url)),
);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};
export const visionDemos = [
  {
    id: "correct",
    name: "A complete path",
    image: "/vision-demos/correct.png",
  },
  {
    id: "reversed",
    name: "Polarity under the lens",
    image: "/vision-demos/reversed.png",
  },
  {
    id: "miswired",
    name: "One hole makes a difference",
    image: "/vision-demos/miswired.png",
  },
];
async function readJson(req, limit) {
  let body = "",
    size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit)
      throw new PerceptionError("request_size", "Request is too large.", 413);
    body += chunk;
  }
  try {
    const data = JSON.parse(body);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw Error();
    return data;
  } catch {
    throw new PerceptionError("invalid_json", "Provide a JSON object.");
  }
}
function equalSecret(a, b) {
  const x = Buffer.from(a || ""),
    y = Buffer.from(b || "");
  return x.length === y.length && timingSafeEqual(x, y);
}
function isLocal(req) {
  return (
    ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
      req.socket.remoteAddress,
    ) &&
    /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(req.headers.host ?? "")
  );
}
function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}
export function createServer(options = {}) {
  const {
    apiKey,
    model,
    provider,
    providerLabel,
    configured,
    liveEnabled: liveVisionEnabled,
    freeTierConfirmed,
    unavailableReason,
    perception,
  } = visionSettings(options);
  const limit = Number(process.env.VISION_DAILY_LIMIT || 20);
  if (!Number.isInteger(limit) || limit < 1 || limit > 20)
    throw Error("VISION_DAILY_LIMIT must be 1–20.");
  const budget =
    options.budget ??
    createVisionBudget({ limit, file: process.env.VISION_USAGE_FILE });
  return http.createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "POST" && req.headers.origin) {
        let origin;
        try {
          origin = new URL(req.headers.origin);
        } catch {}
        if (
          !origin ||
          !["http:", "https:"].includes(origin.protocol) ||
          origin.host !== req.headers.host
        )
          throw new PerceptionError(
            "origin",
            "Cross-origin requests are not allowed.",
            403,
          );
      }
      if (req.method === "GET" && url.pathname === "/api/vision-config")
        return json(res, 200, {
          configured,
          provider,
          provider_label: providerLabel,
          free_tier_confirmed: provider === "gemini" && freeTierConfirmed,
          data_notice:
            provider === "gemini"
              ? "Google's unpaid Gemini service may use submitted images and responses to improve its products. Do not upload confidential or personal information."
              : "This image will be sent to OpenAI. Its API may incur charges; this alternative is outside the $0 launch.",
          live_enabled: liveVisionEnabled,
          unavailable_reason: configured ? null : unavailableReason,
          model,
          daily_limit: limit,
          requires_access_code: configured && !isLocal(req),
          demos: visionDemos.map((d) => ({
            ...d,
            recorded: existsSync(
              path.join(publicDir, "vision-demos", d.id + ".observations.json"),
            ),
          })),
        });
      if (req.method === "POST" && url.pathname === "/api/perceive") {
        if (!configured)
          throw new PerceptionError(
            liveVisionEnabled ? "not_configured" : "live_disabled",
            unavailableReason,
            503,
          );
        if (
          !isLocal(req) &&
          (!process.env.VISION_ACCESS_CODE ||
            !equalSecret(
              req.headers["x-vision-access-code"],
              process.env.VISION_ACCESS_CODE,
            ))
        )
          throw new PerceptionError(
            "access_required",
            "Enter the deployment demo access code to use live AI. Manual analysis remains open.",
            403,
          );
        const data = await readJson(req, 4600000);
        if (data.consent !== true)
          throw new PerceptionError(
            "consent_required",
            `Confirm that this image may be sent to ${providerLabel}.`,
          );
        const image = await prepareImage(data.image);
        const output = await budget.run(() =>
          perception(image, { apiKey, model }),
        );
        return json(res, 200, output);
      }
      if (
        req.method === "GET" &&
        url.pathname.startsWith("/api/vision-replay/")
      ) {
        const id = url.pathname.split("/").pop();
        if (!visionDemos.some((d) => d.id === id))
          return json(res, 404, { error: "Unknown demo." });
        try {
          const record = JSON.parse(
            await readFile(
              path.join(publicDir, "vision-demos", id + ".observations.json"),
              "utf8",
            ),
          );
          return json(res, 200, {
            ...record,
            provenance: {
              ...record.provenance,
              mode: "recorded",
              note: "Saved output from an actual prior model request for this synthetic image. No live model call on this run.",
            },
          });
        } catch {
          return json(res, 404, {
            error: "No recorded observation is available for this demo.",
          });
        }
      }
      if (
        req.method === "POST" &&
        url.pathname === "/api/observations/convert"
      ) {
        const data = await readJson(req, 131072);
        const raw = data.observations;
        if (!raw || !Array.isArray(raw.components))
          throw new PerceptionError(
            "invalid_observations",
            "Provide reviewed observations.",
          );
        const observations = normalizeObservations({
          image_kind: raw.image_kind,
          summary: raw.summary,
          supply_voltage: raw.supply_voltage,
          warnings: raw.warnings,
          components: raw.components.map((p) => {
            if (!p || typeof p !== "object" || Array.isArray(p))
              throw new PerceptionError(
                "invalid_observations",
                "Each detection must be an object.",
              );
            const { review, edited, manual, ...rest } = p;
            return rest;
          }),
        });
        observations.components.forEach((p, i) => {
          p.review = data.observations.components[i].review;
        });
        return json(res, 200, {
          circuit: observationsToCircuit(observations, data.voltage),
          observations,
        });
      }
      if (req.method === "GET" && url.pathname === "/api/health")
        return json(res, 200, {
          ok: true,
          version: "2.0.0",
          mode: configured
            ? "reviewed visual perception + deterministic analysis"
            : "free deterministic demos + manual circuit review",
        });
      if (req.method === "GET" && url.pathname === "/api/examples")
        return json(res, 200, { examples, references });
      if (req.method === "POST" && url.pathname === "/api/analyze") {
        let body = "",
          size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 131072) {
            json(res, 413, { error: "Circuit data exceeds 128 KB." });
            return;
          }
          body += chunk;
        }
        let data;
        try {
          data = JSON.parse(body);
        } catch {
          return json(res, 400, { error: "Request must contain valid JSON." });
        }
        if (!data || typeof data !== "object" || Array.isArray(data))
          return json(res, 400, {
            error: "Request must be a JSON object containing circuit.",
          });
        if (data.reference && !references[data.reference])
          return json(res, 400, { error: "Unknown reference circuit." });
        try {
          return json(
            res,
            200,
            analyze(
              data.circuit,
              data.expected ?? references[data.reference] ?? null,
            ),
          );
        } catch (e) {
          return json(res, 400, { error: e.message });
        }
      }
      if (req.method !== "GET" && req.method !== "HEAD")
        return json(res, 405, { error: "Method not allowed." });
      const target = path.resolve(
        publicDir,
        "." +
          decodeURIComponent(
            url.pathname === "/" ? "/index.html" : url.pathname,
          ),
      );
      if (!target.startsWith(publicDir + path.sep))
        return json(res, 403, { error: "Forbidden path." });
      const content = await readFile(target);
      res.writeHead(200, {
        "Content-Type":
          mime[path.extname(target)] || "application/octet-stream",
      });
      res.end(req.method === "HEAD" ? undefined : content);
    } catch (e) {
      if (e instanceof PerceptionError)
        return json(res, e.status, { error: e.message, code: e.code });
      json(res, e.code === "ENOENT" ? 404 : 500, {
        error:
          e.code === "ENOENT"
            ? "File not found."
            : "Unable to process this request.",
      });
    }
  });
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (existsSync(new URL("./.env.local", import.meta.url)))
    process.loadEnvFile(
      fileURLToPath(new URL("./.env.local", import.meta.url)),
    );
  const port = Number(process.env.PORT || 3000),
    host = process.env.HOST || "127.0.0.1";
  createServer().listen(port, host, () =>
    console.log(`CircuitLens running at http://${host}:${port}`),
  );
}
