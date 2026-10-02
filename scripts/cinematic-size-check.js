import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const files = [
  "index.html",
  "style.css",
  "cinematic.css",
  "app.js",
  "cinematic.js",
  "instrument.js",
  "circuit-object.svg",
  "favicon.svg",
  "perception-ui.js",
  "vision.js",
  "layout.js",
  "schematic.js",
];
const assets = [];
for (const file of files) {
  const bytes = await readFile(`public/${file}`);
  assets.push({
    file,
    bytes: bytes.length,
    gzip_bytes: gzipSync(bytes).length,
  });
}
const report = {
  boundary:
    "Local static asset sizes, not a browser rendering or Web Vitals measurement. gzip is a size estimate; this server does not claim HTTP compression.",
  added_runtime_dependencies: 0,
  external_fonts: 0,
  webgl_required: false,
  assets,
  total_bytes: assets.reduce((n, a) => n + a.bytes, 0),
  total_gzip_bytes: assets.reduce((n, a) => n + a.gzip_bytes, 0),
};
await writeFile(
  "submission/evaluation/cinematic-asset-sizes.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Opening shell: ${report.total_bytes} bytes raw; ${report.total_gzip_bytes} bytes gzip estimate. No added runtime dependencies.`,
);
