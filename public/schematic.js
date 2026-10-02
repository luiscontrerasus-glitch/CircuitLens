// Presentation only: terminals follow the same breadboard grouping as the engine.
// The returned view never decides whether a circuit is electrically healthy.
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function terminalNet(hole) {
  const h = String(hole).trim().toUpperCase();
  if (/^(VCC|GND)$/.test(h)) return h;
  const m = /^([A-J])([1-9]|[12]\d|30)$/.exec(h);
  return m ? `${m[1] <= "E" ? "L" : "R"}${m[2]}` : null;
}
export function schematicMarkup(circuit, issues = [], status = "unverified") {
  const parts = circuit.components.filter(
    (p) => terminalNet(p.a) && terminalNet(p.b),
  );
  if (!parts.length)
    return '<div class="graph-empty"><span>＋</span><p>Your connections become a schematic here.</p><small>Load a fixture or enter component terminals.</small></div>';
  const nets = [
    ...new Set(parts.flatMap((p) => [terminalNet(p.a), terminalNet(p.b)])),
  ];
  nets.sort((a, b) =>
    a === "VCC"
      ? -1
      : b === "VCC"
        ? 1
        : a === "GND"
          ? 1
          : b === "GND"
            ? -1
            : a.localeCompare(b, undefined, { numeric: true }),
  );
  const width = Math.max(640, nets.length * 120),
    height = Math.max(240, 90 + parts.length * 62);
  const x = (n) =>
    52 + (nets.indexOf(n) * (width - 104)) / Math.max(1, nets.length - 1);
  const symbols = {
    resistor: '<path d="M-28 0h8l4-9 8 18 8-18 8 18 8-18 4 9h8"/>',
    led: '<path d="M-28 0h16m0-12v24L10 0zM12-12v24m0-12h16M0-19l9-9m-3 0h3v3M10-19l9-9m-3 0h3v3"/>',
    wire: '<path d="M-28 0h56"/><circle r="3"/>',
    button:
      '<path d="M-28 0h13m0 0 25-12M15 0h13"/><circle cx="-15" r="3"/><circle cx="15" r="3"/>',
  };
  return `<svg class="schematic ${status === "pass" ? "verified" : ""}" viewBox="0 0 ${width} ${height}" width="${width}" aria-label="Editable terminal topology; wires are shown before net merging" role="group"><defs><pattern id="schematic-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#243d47"/></pattern></defs><rect width="100%" height="100%" fill="url(#schematic-grid)"/>${nets.map((n) => `<g class="net ${n === "VCC" ? "power" : n === "GND" ? "ground" : ""}"><path d="M${x(n)} 48V${height - 22}"/><circle cx="${x(n)}" cy="32" r="5"/><text x="${x(n)}" y="18" text-anchor="middle">${esc(n)}</text></g>`).join("")}${parts
    .map((p) => {
      const i = circuit.components.indexOf(p),
        y = 70 + parts.indexOf(p) * 62,
        a = x(terminalNet(p.a)),
        b = x(terminalNet(p.b)),
        mid = a === b ? a + (a > width / 2 ? -85 : 85) : (a + b) / 2;
      const trace =
        a === b
          ? mid > a
            ? `M${a} ${y}H${mid - 28}M${mid + 28} ${y}V${y + 18}H${a}V${y}`
            : `M${a} ${y}V${y - 18}H${mid - 28}V${y}M${mid + 28} ${y}H${a}`
          : `M${a} ${y}H${mid + (a > b ? 28 : -28)}M${mid + (a > b ? -28 : 28)} ${y}H${b}`;
      const bad = issues.some((f) => f.components.includes(p.id));
      return `<g class="schematic-part ${esc(p.type)} ${bad ? "faulty" : ""}" data-component="${i}" tabindex="0" role="button" aria-label="Edit ${esc(p.id)} ${esc(p.type)} ${esc(p.a)} to ${esc(p.b)}${bad ? ", finding" : ""}"><title>${esc(p.id)}: ${esc(p.a)} → ${esc(p.b)}. Select to edit.</title><rect class="hit-area" x="${Math.min(a, b, mid - 28) - 22}" y="${y - 30}" width="${Math.max(70, Math.abs(b - a) + 44, Math.abs(mid - a) + 90)}" height="58" rx="4"/><path class="trace" d="${trace}"/><circle class="terminal" cx="${a}" cy="${y}" r="4"/><circle class="terminal" cx="${b}" cy="${y}" r="4"/><g class="symbol" transform="translate(${mid} ${y})${a > b ? " scale(-1 1)" : ""}">${p.type === "button" && p.closed ? '<path d="M-28 0h56"/><circle cx="-15" r="3"/><circle cx="15" r="3"/>' : symbols[p.type] || symbols.wire}</g><text class="part-label" x="${mid}" y="${y + 23}" text-anchor="middle">${esc(p.id)} · ${p.type === "resistor" ? esc(p.value) + " Ω" : esc(p.type === "button" ? (p.closed ? "closed" : "open") : p.type)}${a === b ? " / SAME GROUP" : ""}${bad ? " / CHECK" : ""}</text></g>`;
    })
    .join("")}</svg>`;
}
