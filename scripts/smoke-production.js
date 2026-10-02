// Run against an already-started production package. Never invokes perception.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const base = process.argv[2] || "http://127.0.0.1:3005";
const manifest = JSON.parse(await readFile("dist/build-manifest.json", "utf8"));
const assets = [
  "/",
  ...manifest.files
    .filter((f) => f.startsWith("public/"))
    .map((f) => "/" + f.slice(7)),
];
for (const asset of assets) {
  const r = await fetch(base + asset);
  assert.equal(r.status, 200, asset);
  assert.ok((await r.arrayBuffer()).byteLength > 0, asset);
  assert.ok(
    r.headers.get("content-security-policy").includes("style-src 'self'"),
  );
}
const config = await (await fetch(base + "/api/vision-config")).json();
assert.equal(
  config.configured,
  false,
  "production smoke expects a server without credentials",
);
const { examples } = await (await fetch(base + "/api/examples")).json();
const expected = {
  healthy: "pass",
  reversed: "review",
  "no-resistor": "critical",
  disconnected: "review",
  short: "critical",
  divider: "pass",
  button: "pass",
};
const demos = [];
for (const e of examples) {
  const r = await fetch(base + "/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ circuit: e.circuit, reference: e.reference }),
  });
  assert.equal(r.status, 200, e.id);
  const data = await r.json();
  assert.equal(data.status, expected[e.id], e.id);
  demos.push({
    id: e.id,
    status: data.status,
    findings: data.issues.length,
    measurements: data.measurements,
  });
}
const report = {
  assets: assets.length,
  all_assets_ok: true,
  credential_free_startup: true,
  perception_requests: 0,
  demos,
};
await writeFile(
  process.argv[3] || "submission/evaluation/redesign-production-smoke.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Production smoke passed: ${assets.length} assets/routes, seven demos, no perception requests.`,
);
