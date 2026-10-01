import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { analyze } from "./src/engine.js";
import { examples, references } from "./src/examples.js";
const publicDir = path.resolve(
  fileURLToPath(new URL("./public/", import.meta.url)),
);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};
function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}
export function createServer() {
  return http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "GET" && url.pathname === "/api/health")
        return json(res, 200, {
          ok: true,
          version: "1.0.0",
          mode: "local deterministic analysis",
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
  const port = Number(process.env.PORT || 3000),
    host = process.env.HOST || "127.0.0.1";
  createServer().listen(port, host, () =>
    console.log(`CircuitLens running at http://${host}:${port}`),
  );
}
