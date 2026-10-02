import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { examples } from "../src/examples.js";
const dir = new URL("../public/vision-demos/", import.meta.url);
await mkdir(dir, { recursive: true });
const escape = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
function point(h) {
  if (h === "VCC") return { x: 150, y: 160 };
  if (h === "GND") return { x: 1060, y: 660 };
  const m = /([A-J])(\d+)/.exec(h),
    c = m[1].charCodeAt(0) - 65;
  return { x: 170 + (+m[2] - 1) * 43, y: 260 + c * 27 + (c > 4 ? 28 : 0) };
}
const labels = {
  correct: "Synthetic image · LED build",
  reversed: "Synthetic image · LED build",
  miswired: "Synthetic image · LED build",
};
for (const [id, fixture] of [
  ["correct", "healthy"],
  ["reversed", "reversed"],
  ["miswired", "disconnected"],
]) {
  const circuit = examples.find((x) => x.id === fixture).circuit;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="840" viewBox="0 0 1280 840"><defs><filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity=".12"/></filter></defs><rect width="1280" height="840" fill="#e5e9de"/><text x="70" y="65" font-size="26" font-family="Arial" fill="#20493c">${labels[id]}</text><text x="70" y="98" font-size="17" font-family="Arial" fill="#526959">ORIGINAL GENERATED DIAGRAM · NOT A HARDWARE PHOTOGRAPH</text><rect x="75" y="130" width="1125" height="600" rx="24" fill="#fafbf4" stroke="#c5ccbc" filter="url(#shadow)"/><path d="M140 160H1120" stroke="#c54f40" stroke-width="5"/><path d="M140 660H1120" stroke="#447bc0" stroke-width="5"/><text x="140" y="145" font-size="20" fill="#973c31">VCC +5 V</text><text x="1020" y="696" font-size="20" fill="#326299">GND 0 V</text><path d="M140 397H1120" stroke="#d9dfd1" stroke-width="16"/>`;
  for (let n = 1; n <= 22; n++) {
    svg += `<text x="${point("A" + n).x - 8}" y="235" font-family="Arial" font-size="16" fill="#6d7b63">${n}</text>`;
    for (const l of "ABCDEFGHIJ") {
      const p = point(l + n);
      svg += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#bec9b4"/>`;
    }
  }
  for (const l of "ABCDEFGHIJ")
    svg += `<text x="110" y="${point(l + "1").y + 5}" font-family="Arial" font-size="16" fill="#65705e">${l}</text>`;
  for (const p of circuit.components) {
    const a = point(p.a),
      b = point(p.b),
      x = (a.x + b.x) / 2,
      y = (a.y + b.y) / 2,
      color =
        p.type === "wire"
          ? "#327969"
          : p.type === "led"
            ? "#cc514b"
            : "#b3873c";
    svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#8b9384" stroke-width="6"/>`;
    if (p.type === "wire")
      svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="9" stroke-linecap="round"/>`;
    if (p.type === "resistor")
      svg += `<rect x="${x - 55}" y="${y - 16}" width="110" height="32" rx="9" fill="#d9bf81" stroke="#aa8947" stroke-width="2"/><path d="M${x - 28} ${y - 15}v30 M${x - 8} ${y - 15}v30" stroke="#e4822c" stroke-width="10"/><path d="M${x + 15} ${y - 15}v30" stroke="#7c4b2b" stroke-width="10"/>`;
    if (p.type === "led")
      svg += `<circle cx="${x}" cy="${y}" r="25" fill="#dc6b5c" stroke="#ae493d" stroke-width="3"/><circle cx="${x - 8}" cy="${y - 8}" r="8" fill="#ffd0b2"/><text x="${a.x - 15}" y="${a.y + 28}" font-size="18" font-family="Arial" fill="#a03e32">A</text><text x="${b.x - 15}" y="${b.y + 28}" font-size="18" font-family="Arial" fill="#a03e32">K</text>`;
    svg += `<text x="${x - 22}" y="${y - 32}" font-family="Arial" font-size="22" font-weight="bold" fill="#24483d">${p.id}${p.value ? " · " + p.value + " Ω" : ""}</text>`;
    for (const [k, q] of [
      ["a", a],
      ["b", b],
    ])
      svg += `<circle cx="${q.x}" cy="${q.y}" r="7" fill="#eef4df" stroke="${color}" stroke-width="3"/><rect x="${q.x - 24}" y="${q.y - 34}" width="66" height="23" rx="4" fill="#fafff0" stroke="#b5c2a8"/><text x="${q.x - 18}" y="${q.y - 17}" font-size="16" font-family="Arial" fill="#244839">${escape(p[k])}</text>`;
  }
  svg += `<text x="80" y="780" font-family="Arial" font-size="19" fill="#4b6554">Terminal callouts are visible teaching labels. Trace the image; no diagnoses are printed.</text></svg>`;
  await sharp(Buffer.from(svg))
    .png()
    .toFile(
      new URL(`${id}.png`, dir).pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"),
    );
  await writeFile(new URL(`${id}.svg`, dir), svg);
}
