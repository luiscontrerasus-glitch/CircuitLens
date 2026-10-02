import { cp, mkdir, rm, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.resolve(root, "dist");
if (path.dirname(out) !== path.resolve(root) || path.basename(out) !== "dist")
  throw Error("Unsafe build destination");
await rm(out, { recursive: true, force: true });
await mkdir(out);
// Explicit allowlist: secrets, runtime ledger, tests and evaluation tools are never shipped.
for (const file of [
  "server.js",
  "src",
  "public",
  "package-lock.json",
  "LICENSE",
])
  await cp(path.join(root, file), path.join(out, file), { recursive: true });
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
pkg.scripts = { start: "node server.js" };
delete pkg.devDependencies;
await writeFile(path.join(out, "package.json"), JSON.stringify(pkg, null, 2));
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else files.push(path.relative(out, file).replaceAll("\\", "/"));
  }
}
await walk(out);
await writeFile(
  path.join(out, "build-manifest.json"),
  JSON.stringify({ version: pkg.version, files }, null, 2),
);
console.log(
  `Production build: ${files.length} allowlisted files in dist; secrets and development fixtures excluded.`,
);
