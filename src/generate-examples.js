import { writeFile, mkdir } from "node:fs/promises";
import { examples } from "./examples.js";
import { terminalPoint } from "../public/layout.js";
const dest = new URL("../public/examples/", import.meta.url);
await mkdir(dest, { recursive: true });
for (const example of examples) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 440" role="img"><title>${example.name} — generated circuit diagram</title><rect x="12" y="15" width="676" height="410" rx="18" fill="#f8faf2" stroke="#d6ddcd"/><path d="M55 52H645" stroke="#d8907b" stroke-width="3"/><path d="M55 383H645" stroke="#809ca2" stroke-width="3"/><text x="26" y="57" font-size="15" fill="#b66a59">+</text><text x="26" y="388" font-size="15" fill="#5e7c84">−</text><path d="M50 218H650" stroke="#dde3d5" stroke-width="10"/>`;
  for (let row = 1; row <= 30; row++) {
    for (const letter of "ABCDEFGHIJ") {
      const { x, y } = terminalPoint(`${letter}${row}`);
      svg += `<circle cx="${x}" cy="${y}" r="3" fill="#c4ceba"/>`;
    }
    if (row === 1 || row % 5 === 0)
      svg += `<text x="${terminalPoint(`A${row}`).x - 3}" y="80" font-size="10" fill="#8a9780">${row}</text>`;
  }
  for (const letter of "ABCDEFGHIJ")
    svg += `<text x="40" y="${terminalPoint(letter + "1").y + 3}" font-size="9" fill="#8a9780">${letter}</text>`;
  for (const p of example.circuit.components) {
    const a = terminalPoint(p.a),
      b = terminalPoint(p.b),
      x = (a.x + b.x) / 2,
      y = (a.y + b.y) / 2;
    const color =
      p.type === "wire"
        ? p.b === "GND"
          ? "#668b83"
          : "#899c50"
        : p.type === "led"
          ? "#c56d53"
          : "#ac874e";
    svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${p.type === "wire" ? 5 : 3}" stroke-linecap="round"/>`;
    if (p.type === "resistor")
      svg += `<rect x="${x - 23}" y="${y - 9}" width="46" height="18" rx="5" fill="#dbc28c" stroke="#a58952"/><path d="M${x - 12} ${y - 8}v16 M${x - 4} ${y - 8}v16 M${x + 5} ${y - 8}v16" stroke="#815e40" stroke-width="4"/>`;
    if (p.type === "led")
      svg += `<circle cx="${x}" cy="${y}" r="14" fill="#d78164" stroke="#b45f48" stroke-width="2"/><circle cx="${x - 4}" cy="${y - 5}" r="4" fill="#f4baa0"/><text x="${a.x + 8}" y="${a.y - 8}" font-size="10" fill="#8c5340">A</text><text x="${b.x + 8}" y="${b.y - 8}" font-size="10" fill="#8c5340">K</text>`;
    if (p.type === "button")
      svg += `<rect x="${x - 13}" y="${y - 13}" width="26" height="26" rx="4" fill="#4e6358"/><circle cx="${x}" cy="${y}" r="8" fill="#99a58d"/>`;
    svg += `<text x="${x + 10}" y="${y - 19}" font-family="Arial" font-size="11" fill="#51634d">${p.id}${p.value ? " · " + p.value + " Ω" : ""}</text>`;
  }
  svg +=
    '<text x="475" y="414" font-family="Arial" font-size="9" fill="#8a9780">CIRCUITLENS · GENERATED EXAMPLE</text></svg>';
  await writeFile(new URL(`${example.id}.svg`, dest), svg);
  await writeFile(
    new URL(`${example.id}.json`, dest),
    JSON.stringify(example.circuit, null, 2),
  );
}
