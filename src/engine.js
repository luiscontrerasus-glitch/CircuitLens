export function nodeOf(hole) {
  const h = String(hole).trim().toUpperCase();
  if (/^(VCC|GND)$/.test(h)) return h;
  const m = /^([A-J])([1-9]|[12]\d|30)$/.exec(h);
  if (!m)
    throw new Error(`Invalid terminal “${hole}”. Use A1–J30, VCC or GND.`);
  return `${m[1] <= "E" ? "L" : "R"}${m[2]}`;
}
export function validateCircuit(c) {
  if (!c || !Array.isArray(c.components) || c.components.length > 100)
    throw new Error("Provide a components array with at most 100 entries.");
  if (!Number.isFinite(c.voltage) || c.voltage < 0.1 || c.voltage > 12)
    throw new Error("Supply voltage must be between 0.1 and 12 V.");
  const ids = new Set();
  for (const p of c.components) {
    if (
      !p ||
      typeof p.id !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_-]{0,19}$/.test(p.id) ||
      ids.has(p.id)
    )
      throw new Error(
        "Component IDs must be unique, short identifiers such as R1.",
      );
    ids.add(p.id);
    if (!["wire", "resistor", "led", "button"].includes(p.type))
      throw new Error(`Unsupported component type for ${p.id}.`);
    nodeOf(p.a);
    nodeOf(p.b);
    if (
      p.type === "resistor" &&
      (!Number.isFinite(p.value) || p.value < 1 || p.value > 1e7)
    )
      throw new Error(`${p.id}: resistance must be 1–10,000,000 Ω.`);
    if (p.type === "button" && typeof p.closed !== "boolean")
      throw new Error(`${p.id}: button needs a closed boolean.`);
  }
  return c;
}
export function createGraph(c) {
  validateCircuit(c);
  const parents = new Map();
  function root(n) {
    if (!parents.has(n)) parents.set(n, n);
    if (parents.get(n) !== n) parents.set(n, root(parents.get(n)));
    return parents.get(n);
  }
  const join = (a, b) => parents.set(root(a), root(b));
  root("VCC");
  root("GND");
  for (const p of c.components) {
    root(nodeOf(p.a));
    root(nodeOf(p.b));
    if (p.type === "wire" || (p.type === "button" && p.closed))
      join(nodeOf(p.a), nodeOf(p.b));
  }
  const edges = c.components.map((p) => ({
    ...p,
    from: root(nodeOf(p.a)),
    to: root(nodeOf(p.b)),
  }));
  return {
    edges,
    power: root("VCC"),
    ground: root("GND"),
    nodes: [...new Set([...parents.keys()].map(root))],
    root,
  };
}
function path(g, start, end, exclude, allowResistors = true) {
  const queue = [{ n: start, resistance: 0, ids: [] }],
    seen = new Set();
  while (queue.length) {
    queue.sort((a, b) => a.resistance - b.resistance);
    const x = queue.shift();
    if (seen.has(x.n)) continue;
    seen.add(x.n);
    if (x.n === end) return x;
    for (const p of g.edges) {
      if (
        p.id === exclude ||
        p.type === "led" ||
        (p.type === "button" && !p.closed) ||
        (!allowResistors && p.type === "resistor")
      )
        continue;
      const next = p.from === x.n ? p.to : p.to === x.n ? p.from : null;
      if (next !== null && !seen.has(next))
        queue.push({
          n: next,
          resistance: x.resistance + (p.type === "resistor" ? p.value : 0),
          ids: [...x.ids, p.id],
        });
    }
  }
  return null;
}
// Compare connectivity by labeled component pins, independent of breadboard row placement.
function signatures(c) {
  const g = createGraph(c),
    nets = new Map();
  const add = (n, pin) => {
    if (!nets.has(n)) nets.set(n, []);
    nets.get(n).push(pin);
  };
  add(g.power, "SUPPLY");
  add(g.ground, "GROUND");
  for (const p of g.edges.filter((p) => p.type !== "wire")) {
    add(p.from, `${p.id}.a`);
    add(p.to, `${p.id}.b`);
  }
  const out = {};
  for (const pins of nets.values())
    for (const pin of pins)
      out[pin] = pins
        .filter((p) => p !== pin)
        .sort()
        .join(",");
  return out;
}
export function compareCircuits(observed, expected) {
  validateCircuit(expected);
  const a = signatures(observed),
    b = signatures(expected);
  const differences = [];
  for (const p of expected.components.filter((p) => p.type !== "wire")) {
    const q = observed.components.find((q) => q.id === p.id);
    if (!q) {
      differences.push({
        code: "missing-component",
        id: p.id,
        detail: `Reference requires ${p.id} (${p.type}).`,
      });
      continue;
    }
    if (q.type !== p.type)
      differences.push({
        code: "component-type",
        id: p.id,
        detail: `Expected ${p.type}; observed ${q.type}.`,
      });
    if (p.type === "resistor" && q.value !== p.value)
      differences.push({
        code: "value-mismatch",
        id: p.id,
        detail: `Expected ${p.value} Ω; observed ${q.value} Ω.`,
      });
    for (const pin of ["a", "b"])
      if (a[`${p.id}.${pin}`] !== b[`${p.id}.${pin}`])
        differences.push({
          code: "connection-mismatch",
          id: p.id,
          detail: `${p.id}.${pin}: expected net peers [${b[`${p.id}.${pin}`] || "none"}]; observed [${a[`${p.id}.${pin}`] || "none"}].`,
        });
  }
  for (const p of observed.components.filter((p) => p.type !== "wire"))
    if (!expected.components.some((q) => q.id === p.id))
      differences.push({
        code: "unexpected-component",
        id: p.id,
        detail: `${p.id} is absent from the reference.`,
      });
  if (observed.voltage !== expected.voltage)
    differences.push({
      code: "supply-mismatch",
      id: "SUPPLY",
      detail: `Expected ${expected.voltage} V; observed ${observed.voltage} V.`,
    });
  return differences;
}
export function analyze(c, expected = null) {
  const g = createGraph(c),
    issues = [],
    measurements = [];
  const issue = (code, title, severity, ids, evidence, why, fix) =>
    issues.push({
      code,
      title,
      severity,
      components: ids,
      evidence,
      why,
      fix,
      confidence: "Based on confirmed terminals",
    });
  if (g.power === g.ground)
    issue(
      "supply-short",
      "Power is connected directly to ground",
      "critical",
      g.edges
        .filter((p) => p.type === "wire" || p.type === "button")
        .map((p) => p.id),
      "VCC and GND collapse into one conductive net.",
      "A low-resistance path can draw excessive current from the supply.",
      "Disconnect power. Remove the bridging wire or closed switch and verify continuity before reconnecting.",
    );
  for (const p of g.edges) {
    if (["resistor", "led"].includes(p.type) && p.from === p.to)
      issue(
        "bypassed-component",
        `${p.id} is bypassed`,
        "warning",
        [p.id],
        `${p.a} and ${p.b} share the same conductive net.`,
        "Both terminals have the same voltage, so the component cannot perform its intended function.",
        "Move one terminal to an isolated row and reconnect according to the reference.",
      );
    if (p.type !== "led" || g.power === g.ground) continue;
    const hi = path(g, g.power, p.from, p.id),
      lo = path(g, p.to, g.ground, p.id);
    const reverseHi = path(g, g.power, p.to, p.id),
      reverseLo = path(g, p.from, g.ground, p.id);
    if ((!hi || !lo) && reverseHi && reverseLo)
      issue(
        "reversed-led",
        `${p.id} polarity is reversed`,
        "warning",
        [p.id],
        "The cathode reaches VCC and the anode reaches GND through the passive network.",
        "An LED conducts mainly from anode to cathode. Reverse bias prevents normal illumination.",
        "Disconnect power. Swap the LED leads; connect its anode toward the resistor and VCC.",
      );
    else if (!hi || !lo)
      issue(
        "open-circuit",
        `${p.id} has no complete forward path`,
        "warning",
        [p.id],
        `${!hi ? "No passive path from VCC to anode. " : ""}${!lo ? "No passive path from cathode to GND." : ""}`,
        "Current needs a complete path. An open button also intentionally interrupts it.",
        "Check jumper endpoints and rail continuity. If using a button, confirm its state.",
      );
    else {
      const resistance = hi.resistance + lo.resistance;
      if (resistance === 0)
        issue(
          "missing-resistor",
          `${p.id} has no current-limiting resistor`,
          "critical",
          [p.id, ...hi.ids, ...lo.ids],
          "A complete supply-to-LED path contains no resistance.",
          "LED current rises sharply with voltage; a series resistor limits current.",
          "Disconnect power. Add a series resistor, then verify its resistance and the LED datasheet.",
        );
      else {
        const current = Math.max(0, (c.voltage - 2) / resistance) * 1000;
        measurements.push({
          label: `${p.id} path estimate`,
          value: `${current.toFixed(1)} mA`,
          note: `Assumes 2.0 V LED drop and ${resistance} Ω in a simple series path; not a simulation of parallel networks.`,
        });
        if (current > 20)
          issue(
            "high-led-current",
            `${p.id} estimated current exceeds 20 mA`,
            "warning",
            [p.id, ...hi.ids, ...lo.ids],
            `Simple series estimate is ${current.toFixed(1)} mA.`,
            "Many indicator LEDs need less current; the actual rating depends on the part.",
            "Increase series resistance and check the LED current rating.",
          );
      }
    }
  }
  if (!g.edges.some((p) => p.type === "led")) {
    const rs = g.edges.filter((p) => p.type === "resistor");
    if (rs.length === 2) {
      const top = rs.find((p) => p.from === g.power || p.to === g.power),
        bottom = rs.find((p) => p.from === g.ground || p.to === g.ground);
      if (top && bottom && top.id !== bottom.id) {
        const mid = top.from === g.power ? top.to : top.from;
        if (
          mid !== g.power &&
          mid !== g.ground &&
          (bottom.from === mid || bottom.to === mid)
        )
          measurements.push({
            label: "Unloaded divider output",
            value: `${((c.voltage * bottom.value) / (top.value + bottom.value)).toFixed(2)} V`,
            note: "Ideal two-resistor divider; assumes no output load.",
          });
      }
    }
  }
  const differences = expected ? compareCircuits(c, expected) : [];
  for (const d of differences)
    issue(
      d.code,
      `${d.id}: ${d.code.replaceAll("-", " ")}`,
      "warning",
      [d.id],
      d.detail,
      "The confirmed circuit differs from the selected intended design.",
      "Compare the highlighted component terminals and value with the reference. Match component IDs when importing.",
    );
  return {
    status: issues.some((i) => i.severity === "critical")
      ? "critical"
      : issues.length
        ? "review"
        : "pass",
    issues,
    measurements,
    graph: { nodes: g.nodes, edges: g.edges, power: g.power, ground: g.ground },
    summary: {
      components: c.components.length,
      nets: g.nodes.length,
      checks:
        "Connectivity, reference agreement, LED polarity and series-path checks",
    },
    limitations:
      "Checks apply to the entered circuit, not verified physical continuity. No hardware measurements or arbitrary-photo recognition. Same-side A–E / F–J rows are connected; VCC/GND are logical continuous rails.",
  };
}
