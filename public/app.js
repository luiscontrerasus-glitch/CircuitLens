import { initPerception } from "./perception-ui.js";
import { colorFeatureMask } from "./vision.js";
import { terminalPoint } from "./layout.js";
import { schematicMarkup } from "./schematic.js";
import { initCinematic } from "./cinematic.js";
import { analysisPhase } from "./instrument.js";
import { openPanel, setInspectorOpen } from "./workbench-shell.js";
import { initGraphViewport } from "./graph-viewport.js";
import { mountAssembly, initSpatialStory } from "./assembly.js";
initCinematic();
const resizeAssembly = initSpatialStory();
const viewport = initGraphViewport();
let circuitView = matchMedia(
  "(max-width: 1000px), (prefers-reduced-motion: reduce)",
).matches
  ? "schematic"
  : "assembly";
let viewChosen = false;
const compactView = matchMedia(
  "(max-width: 1000px), (prefers-reduced-motion: reduce)",
);
compactView.addEventListener("change", () => {
  if (!viewChosen) {
    circuitView = compactView.matches ? "schematic" : "assembly";
  }
  renderGraph();
  resizeAssembly();
});
const $ = (id) => document.getElementById(id),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let perception = null;
let fixtures = [],
  references = {},
  circuit = { voltage: 5, components: [] },
  image = null,
  isDemo = false,
  annotations = {},
  result = null,
  mark = null,
  version = 0,
  photoVersion = 0,
  focusedId = null;
const canvas = $("photo"),
  ctx = canvas.getContext("2d", { willReadFrequently: true });
function error(message) {
  $("error").textContent = message;
  $("error").hidden = !message;
}
function invalidate() {
  analysisPhase("model", "Circuit model editable / confirmation required");
  document
    .querySelectorAll(".steps li")
    .forEach((li, i) => li.classList.toggle("active", i < 2));
  focusedId = null;
  $("focus-readout").textContent =
    "SELECT A COMPONENT / link observation, topology and evidence";
  $("bench-evidence").textContent =
    "ENGINEERING / confirm connections to trace evidence";
  version++;
  result = null;
  $("results").hidden = true;
  $("findings-jump").hidden = true;
  $("export-preview").hidden = true;
  $("confirmed").checked = false;
  $("analyze").disabled = true;
  error("");
  renderImage();
  renderGraph();
  renderInspector();
}
function renderGraph() {
  $("live-graph").innerHTML =
    '<div class="assembly-view"></div><div class="schematic-view"></div>';
  $("live-graph").querySelector(".schematic-view").innerHTML = schematicMarkup(
    circuit,
    result?.issues,
    result?.status,
    matchMedia("(max-width: 1000px)").matches,
  );
  const compact = document.createElement("div");
  compact.className = "compact-connections";
  compact.setAttribute("aria-label", "Readable component connections");
  compact.innerHTML = circuit.components
    .map(
      (part, index) =>
        `<button data-component="${index}" class="${result?.issues.some((issue) => issue.components.includes(part.id)) ? "faulty" : ""}"><strong>${esc(part.id)} / ${esc(part.type)}</strong><span>${esc(part.a)} → ${esc(part.b)}</span></button>`,
    )
    .join("");
  $("live-graph").append(compact);
  if (focusedId) {
    const index = circuit.components.findIndex((part) => part.id === focusedId);
    $("live-graph")
      .querySelectorAll(`[data-component="${index}"]`)
      .forEach((part) => part.classList.add("selected"));
  }
  applyView();
  resizeAssembly();
  $("graph-status").textContent = result
    ? result.status === "pass"
      ? "RULE CHECKS PASSED"
      : "FINDINGS HIGHLIGHTED"
    : circuit.components.length
      ? "UNVERIFIED / EDITABLE"
      : "AWAITING INPUT";
}
function applyView() {
  document.body.dataset.circuitView = circuitView;
  document.querySelector(".visual-panel").hidden = circuitView !== "source";
  const empty = !circuit.components.length;
  const assembly = $("live-graph").querySelector(".assembly-view");
  if (circuitView === "assembly" && !empty && !assembly.firstChild) {
    mountAssembly(assembly, circuit, result?.issues);
    const index = circuit.components.findIndex((part) => part.id === focusedId);
    assembly
      .querySelectorAll(`[data-component="${index}"]`)
      .forEach((part) => part.classList.add("selected"));
  }
  $("live-graph").querySelector(".assembly-view").hidden =
    circuitView !== "assembly" || empty;
  $("live-graph").querySelector(".schematic-view").hidden =
    circuitView !== "schematic" && !empty;
  $("view-assembly").setAttribute(
    "aria-pressed",
    String(circuitView === "assembly"),
  );
  $("view-schematic").setAttribute(
    "aria-pressed",
    String(circuitView === "schematic"),
  );
  $("view-source").setAttribute(
    "aria-pressed",
    String(circuitView === "source"),
  );
  viewport.refresh();
}
for (const view of ["assembly", "schematic", "source"])
  $(`view-${view}`).onclick = () => {
    viewChosen = true;
    circuitView = view;
    applyView();
    resizeAssembly();
  };
function renderInspector() {
  const p = circuit.components.find((part) => part.id === focusedId);
  if (!p) {
    $("component-inspector").innerHTML =
      '<span class="eyebrow">NOTHING SELECTED</span><h3 class="empty-inspector">Inspect a component</h3><p>Select a part to inspect its terminals and related evidence.</p>';
    return;
  }
  const issues =
    result?.issues.filter((issue) => issue.components.includes(p.id)) || [];
  $("component-inspector").innerHTML =
    `<span class="eyebrow">${esc(p.type.toUpperCase())} / ${issues.length ? "FINDING" : "CONNECTION"}</span><h3>${esc(p.id)}</h3><div class="inspector-terminals"><label>A / ${p.type === "led" ? "anode" : "terminal"}<input aria-label="Inspect ${esc(p.id)} terminal A" data-inspect="a" value="${esc(p.a)}" maxlength="5"></label><span>→</span><label>B / ${p.type === "led" ? "cathode" : "terminal"}<input aria-label="Inspect ${esc(p.id)} terminal B" data-inspect="b" value="${esc(p.b)}" maxlength="5"></label></div>${p.type === "resistor" ? `<p>${esc(p.value)} Ω / current limiting</p>` : p.type === "button" ? `<p>${p.closed ? "Closed" : "Open"} / switch state</p>` : ""}<div class="inspector-evidence">${
      issues.length
        ? `<strong>${esc(issues[0].title)}</strong><p>${esc(issues[0].evidence)}</p><p>${esc(issues[0].fix)}</p>${
            issues.length > 1
              ? `<details><summary>${issues.length - 1} related findings</summary>${issues
                  .slice(1)
                  .map(
                    (issue) =>
                      `<p><strong>${esc(issue.title)}</strong><br>${esc(issue.evidence)}</p>`,
                  )
                  .join("")}</details>`
              : ""
          }`
        : `<p>${result ? "No supported-rule finding for this part." : "Review both terminals, then confirm and analyze."}</p>`
    }</div>${p.type === "led" ? '<button id="swap-polarity" class="secondary small">Swap A / K →</button>' : ""}`;
}
$("component-inspector").addEventListener("change", (e) => {
  if (!e.target.dataset.inspect) return;
  const p = circuit.components.find((part) => part.id === focusedId);
  if (!p) return;
  const id = p.id;
  p[e.target.dataset.inspect] = e.target.value.trim().toUpperCase();
  invalidate();
  renderEditor();
  focusComponent(
    circuit.components.findIndex((part) => part.id === id),
    false,
  );
});
$("component-inspector").addEventListener("click", (e) => {
  if (e.target.id !== "swap-polarity") return;
  const p = circuit.components.find((part) => part.id === focusedId);
  const id = p.id;
  [p.a, p.b] = [p.b, p.a];
  invalidate();
  renderEditor();
  focusComponent(
    circuit.components.findIndex((part) => part.id === id),
    false,
  );
  $("live-graph")
    .querySelector(
      `.model-part[data-component="${circuit.components.indexOf(p)}"]`,
    )
    ?.classList.add("repair-turn");
});
function focusComponent(index, navigate = true) {
  const row = $("components").querySelector(`[data-index="${index}"]`);
  if (!row) return;
  document
    .querySelectorAll("tr.selected, [data-component].selected")
    .forEach((el) => el.classList.remove("selected"));
  focusedId = circuit.components[index].id;
  row.classList.add("selected");
  document
    .querySelectorAll(".issue")
    .forEach((el) =>
      el.classList.toggle(
        "focused",
        el.dataset.evidenceComponents?.split("|").includes(focusedId),
      ),
    );
  $("focus-readout").textContent =
    `${focusedId} / linked observation · topology · evidence`;
  renderImage();
  renderInspector();
  $("live-graph")
    .querySelectorAll(`[data-component="${index}"]`)
    .forEach((part) => part.classList.add("selected"));
  if (navigate) {
    if (matchMedia("(max-width: 700px)").matches) setInspectorOpen(true);
    else
      $("component-inspector")
        .querySelector("input")
        ?.focus({ preventScroll: true });
  }
}
$("components").addEventListener("focusin", (e) => {
  const row = e.target.closest("tr[data-index]");
  if (row && circuit.components[+row.dataset.index]?.id !== focusedId)
    focusComponent(+row.dataset.index, false);
});
function motion() {
  return document.body.classList.contains("reduced-motion") ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}
$("reduce-motion").onclick = () => {
  const reduced = document.body.classList.toggle("reduced-motion");
  $("reduce-motion").setAttribute("aria-pressed", String(reduced));
  $("reduce-motion").textContent = reduced ? "Motion reduced" : "Reduce motion";
  if (reduced) {
    circuitView = "schematic";
    applyView();
  }
};
$("live-graph").addEventListener("click", (e) => {
  const part = e.target.closest("[data-component]");
  if (part) focusComponent(+part.dataset.component);
});
$("live-graph").addEventListener("keydown", (e) => {
  if (!["Enter", " "].includes(e.key)) return;
  const part = e.target.closest("[data-component]");
  if (part) {
    e.preventDefault();
    focusComponent(+part.dataset.component);
  }
});
function referencePreview() {
  const ref = references[$("reference").value];
  $("reference-preview").textContent = ref
    ? `${ref.name} · ${ref.voltage} V\n` +
      ref.components
        .map(
          (p) =>
            `${p.id} (${p.type}): ${p.a} → ${p.b}${p.value ? ` · ${p.value} Ω` : ""}${p.type === "button" ? ` · ${p.closed ? "closed" : "open"}` : ""}`,
        )
        .join("\n")
    : "Safety checks only. No expected-vs-observed comparison.";
}
function renderEditor() {
  renderGraph();
  $("empty-components").hidden = circuit.components.length > 0;
  $("components").innerHTML = circuit.components
    .map(
      (p, i) =>
        `<tr data-index="${i}" class="${result?.issues.some((x) => x.components.includes(p.id)) ? "flagged" : ""}"><td><input aria-label="Component ${i + 1} ID" data-field="id" value="${esc(p.id)}"><select aria-label="${esc(p.id)} type" data-field="type">${["wire", "resistor", "led", "button"].map((t) => `<option ${t === p.type ? "selected" : ""}>${t}</option>`).join("")}</select><button class="text-button" data-mark="${i}" aria-label="Mark ${esc(p.id)} terminals">Mark ↗</button></td><td><input aria-label="${esc(p.id)} terminal A" data-field="a" value="${esc(p.a)}" maxlength="5"></td><td><input aria-label="${esc(p.id)} terminal B" data-field="b" value="${esc(p.b)}" maxlength="5"></td><td>${p.type === "resistor" ? `<input type="number" aria-label="${esc(p.id)} resistance" data-field="value" min="1" max="10000000" value="${p.value}">` : p.type === "button" ? `<select aria-label="${esc(p.id)} state" data-field="closed"><option value="true" ${p.closed ? "selected" : ""}>Closed</option><option value="false" ${!p.closed ? "selected" : ""}>Open</option></select>` : `<span class="helper">—</span>`}</td><td><button class="remove" data-remove="${i}" aria-label="Remove ${esc(p.id)}">×</button></td></tr>`,
    )
    .join("");
  renderInspector();
  if (focusedId) {
    const index = circuit.components.findIndex((part) => part.id === focusedId);
    $("live-graph")
      .querySelectorAll(`[data-component="${index}"]`)
      .forEach((part) => part.classList.add("selected"));
    $("components")
      .querySelector(`[data-index="${index}"]`)
      ?.classList.add("selected");
  }
}
function renderImage() {
  if (!image) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  if ($("features").checked && !isDemo) {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const mask = colorFeatureMask(pixels.data);
    pixels.data.set(mask.data);
    ctx.putImageData(pixels, 0, 0);
    $("image-help").textContent =
      `Color feature mask: ${mask.percentage.toFixed(1)}% of pixels have strong saturation. This can highlight insulation, LEDs, or unrelated objects; confirm everything manually.`;
  }

  perception?.draw(ctx, canvas.width, canvas.height);
  for (const p of circuit.components) {
    const points = isDemo
      ? [terminalPoint(p.a), terminalPoint(p.b)].map((q) => ({
          x: (q.x / 700) * canvas.width,
          y: (q.y / 440) * canvas.height,
        }))
      : annotations[p.id];
    if (!points || points.length < 2) continue;
    const faulty = result?.issues.some((x) => x.components.includes(p.id));
    const focused = p.id === focusedId;
    ctx.strokeStyle = focused ? "#ffe0a0" : faulty ? "#e67d26" : "#317f69";
    ctx.lineWidth = focused ? 8 : faulty ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    for (const q of points) {
      ctx.beginPath();
      ctx.arc(q.x, q.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#f9fff3";
      ctx.fill();
      ctx.stroke();
    }
    const x = (points[0].x + points[1].x) / 2,
      y = (points[0].y + points[1].y) / 2;
    ctx.fillStyle = faulty ? "#994e10" : "#173d35";
    ctx.fillRect(x - 3, y - 19, Math.max(30, p.id.length * 9 + 8), 20);
    ctx.fillStyle = "white";
    ctx.font = "12px Segoe UI";
    ctx.fillText(p.id, x + 2, y - 5);
  }
  const reviewCanvas = $("review-photo");
  reviewCanvas.width = canvas.width;
  reviewCanvas.height = canvas.height;
  reviewCanvas.getContext("2d").drawImage(canvas, 0, 0);
}
async function setImage(url, demo) {
  const token = ++photoVersion;
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () =>
      reject(
        new Error(
          "Unable to decode this image. Choose a different PNG, JPG or WebP.",
        ),
      );
    img.src = url;
  });
  if (token !== photoVersion) return;
  image = img;
  isDemo = demo;
  const scale = demo
    ? 1000 / img.naturalWidth
    : Math.min(1, 1000 / img.naturalWidth, 1000 / img.naturalHeight);
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.hidden = false;
  $("empty-image").hidden = true;
  $("source-badge").textContent = demo ? "GENERATED EXAMPLE" : "YOUR PHOTO";
  $("features").checked = false;
  $("features").disabled = demo;
  $("image-help").textContent = demo
    ? "Generated diagram with known fixture terminals. Edit the table to change the analyzed circuit; the original illustration stays fixed."
    : "Review the photo and enter terminals. Use Mark ↗ on a component to place two visual anchors; anchors do not infer electrical connections.";
  perception?.imageChanged();
  renderImage();
}
function scrollBench() {
  viewport.fit();
  setInspectorOpen(false);
}
async function loadExample(id) {
  const example = fixtures.find((x) => x.id === id);
  if (!example) return;
  invalidate();
  annotations = {};
  mark = null;
  circuit = structuredClone(example.circuit);
  $("voltage").value = circuit.voltage;
  $("reference").value = example.reference;
  $("image-title").textContent = example.name;
  $("circuit-name").textContent = example.name;
  referencePreview();
  renderEditor();
  document.querySelectorAll(".example-card").forEach((b) => {
    b.classList.toggle("selected", b.dataset.id === id);
    b.setAttribute("aria-pressed", String(b.dataset.id === id));
  });
  try {
    await setImage(example.image, true);
  } catch (e) {
    error(e.message);
  }
  scrollBench();
  await analyzeCircuit(false);
  const selected = result?.issues[0]?.components[0];
  const index = selected
    ? circuit.components.findIndex((part) => part.id === selected)
    : circuit.components.findIndex(
        (part) => part.type === "led" || part.type === "resistor",
      );
  if (index >= 0) focusComponent(index, false);
}
function reset() {
  setInspectorOpen(false);
  perception?.reset();
  invalidate();
  photoVersion++;
  circuit = { voltage: 5, components: [] };
  image = null;
  isDemo = false;
  annotations = {};
  mark = null;
  canvas.hidden = true;
  $("empty-image").hidden = false;
  $("source-badge").textContent = "NO IMAGE";
  $("image-title").textContent = "Your circuit, in focus";
  $("circuit-name").textContent = "New circuit";
  $("voltage").value = 5;
  $("reference").value = "";
  $("features").checked = false;
  $("features").disabled = false;
  $("image-help").textContent =
    "Review the photo and enter components manually. Optional AI observations require configured API access.";
  document.querySelectorAll(".example-card").forEach((b) => {
    b.classList.remove("selected");
    b.setAttribute("aria-pressed", "false");
  });
  circuitView = "source";
  renderEditor();
  referencePreview();
}
function download(name, data) {
  const serialized = JSON.stringify(data, null, 2);
  $("export-title").textContent = name;
  $("export-data").value = serialized;
  $("export-preview").hidden = false;
  openPanel("export-dialog");
  const url = URL.createObjectURL(
    new Blob([serialized], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  $("export-preview").scrollIntoView({
    behavior:
      document.body.classList.contains("reduced-motion") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
  });
}
$("select-export").onclick = () => {
  $("export-data").focus();
  $("export-data").select();
};
function renderResults() {
  if (!result) return;
  const n = result.issues.length;
  $("results").hidden = false;
  $("findings-jump").hidden = false;
  $("findings-jump").textContent = n ? `${n} findings` : "Checks passed";
  $("result-heading").textContent = n
    ? `${n} finding${n === 1 ? "" : "s"}. A clearer next step.`
    : "The connections check out.";
  $("result-summary").innerHTML =
    `<div class="summary-banner ${result.status}"><span class="summary-icon">${n ? "◎" : "✓"}</span><div><strong>${result.status === "critical" ? "Disconnect power before making changes" : n ? "Review the highlighted connections" : "No supported-rule faults found"}</strong><p>${isDemo ? "Generated fixture / editable netlist" : "Reviewed / entered netlist"} · ${result.summary.components} components · ${result.summary.nets} electrical nets · ${$("reference").value ? "Compared with intended circuit" : "Safety checks only — no reference selected"}</p></div></div>`;
  $("measurements").innerHTML = result.measurements
    .map(
      (m) =>
        `<div class="measurement"><span>${esc(m.label)}</span><strong>${esc(m.value)}</strong><p>${esc(m.note)}</p></div>`,
    )
    .join("");
  $("bench-evidence").innerHTML = result.issues.length
    ? result.issues
        .filter(
          (issue, index, all) =>
            all.findIndex(
              (other) => other.components[0] === issue.components[0],
            ) === index,
        )
        .map(
          (i) =>
            `<button class="docked-finding" data-focus-component="${esc(i.components[0] || "")}"><span>${esc(i.title)}</span><small>${esc(i.components.join(" / "))} ↗</small></button>`,
        )
        .join("")
    : `<strong class="healthy-readout">✓ SUPPORTED RULE CHECKS PASSED</strong><p>Reviewed model / ${result.summary.components} components / ${result.summary.nets} nets</p>`;
  $("issue-list").innerHTML = result.issues
    .map(
      (i, index) =>
        `<article class="issue" data-evidence-components="${esc(i.components.join("|"))}"><span class="fault-index">FINDING ${String(index + 1).padStart(2, "0")} / ENGINEERING EVIDENCE</span><header><h3>${esc(i.title)}</h3><span class="severity ${i.severity}">${esc(i.severity.toUpperCase())}</span></header><dl><dt>WHERE / EVIDENCE</dt><dd>${esc(i.evidence)}</dd>${$("education").checked ? `<dt>WHY IT MATTERS</dt><dd>${esc(i.why)}</dd>` : ""}<dt>HOW TO FIX IT</dt><dd>${esc(i.fix)}</dd></dl><p>${i.components.map((id) => `<button class="issue-focus" data-focus-component="${esc(id)}">↗ Inspect ${esc(id)} </button>`).join(" · ")}</p><small>Rule confidence: ${esc(i.confidence)} · input interpretation unverified</small></article>`,
    )
    .join("");
  $("graph-view").innerHTML =
    result.graph.nodes
      .map(
        (n) =>
          `<span class="graph-net">${esc(n)}: ${esc(
            result.graph.edges
              .filter((e) => e.from === n || e.to === n)
              .map((e) => `${e.id}.${e.from === n ? "a" : "b"}`)
              .join(" · ") || "unconnected",
          )}</span>`,
      )
      .join("") + `<pre>${esc(JSON.stringify(result.graph, null, 2))}</pre>`;
  $("limits").textContent = result.limitations;
  renderEditor();
  renderImage();
}
$("components").addEventListener("input", (e) => {
  const row = e.target.closest("tr");
  if (!row || !e.target.dataset.field) return;
  const p = circuit.components[+row.dataset.index],
    key = e.target.dataset.field,
    old = p.id;
  p[key] =
    key === "value"
      ? Number(e.target.value)
      : key === "closed"
        ? e.target.value === "true"
        : e.target.value.trim();
  if (key === "a" || key === "b") p[key] = p[key].toUpperCase();
  if (key === "type") {
    if (p.type === "resistor") p.value = 330;
    if (p.type === "button") p.closed = true;
  }
  if (key === "id" && annotations[old]) {
    annotations[p.id] = annotations[old];
    delete annotations[old];
  }
  invalidate();
  if (key === "type") renderEditor();
});
$("components").addEventListener("click", (e) => {
  const remove = e.target.closest("[data-remove]");
  if (remove) {
    const [p] = circuit.components.splice(+remove.dataset.remove, 1);
    delete annotations[p.id];
    invalidate();
    renderEditor();
    return;
  }
  const b = e.target.closest("[data-mark]");
  if (b) {
    if (!image) {
      error("Choose a photo first.");
      return;
    }
    if (isDemo) {
      error(
        "Example annotations already follow the terminal table. Upload a photo to place manual anchors.",
      );
      return;
    }
    document.getElementById("connections-dialog").close();
    $("view-source").click();
    mark = { id: circuit.components[+b.dataset.mark].id, points: [] };
    $("image-help").textContent =
      `Click terminal A, then terminal B for ${mark.id} on the photo. This only places visual anchors.`;
  }
});
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  if (!mark) {
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width,
      y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    let nearest = -1,
      distance = 32;
    circuit.components.forEach((p, i) => {
      const pts = isDemo
        ? [terminalPoint(p.a), terminalPoint(p.b)].map((q) => ({
            x: (q.x / 700) * canvas.width,
            y: (q.y / 440) * canvas.height,
          }))
        : annotations[p.id];
      if (!pts || pts.length < 2) return;
      const [a, b] = pts,
        dx = b.x - a.x,
        dy = b.y - a.y;
      const t = Math.max(
        0,
        Math.min(
          1,
          ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1),
        ),
      );
      const d = Math.hypot(x - a.x - t * dx, y - a.y - t * dy);
      if (d < distance) {
        nearest = i;
        distance = d;
      }
    });
    if (nearest >= 0) focusComponent(nearest);
    return;
  }
  mark.points.push({
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  });
  if (mark.points.length === 2) {
    annotations[mark.id] = mark.points;
    mark = null;
    $("image-help").textContent =
      "Visual anchors saved. Confirm electrical hole labels in the table.";
    renderImage();
  }
});
$("add").onclick = () => {
  let n = 1;
  while (circuit.components.some((p) => p.id === `X${n}`)) n++;
  circuit.components.push({ id: `X${n}`, type: "wire", a: "A1", b: "A2" });
  invalidate();
  renderEditor();
};
$("voltage").oninput = () => {
  circuit.voltage = Number($("voltage").value);
  invalidate();
};
$("reference").onchange = () => {
  invalidate();
  referencePreview();
};
$("confirmed").onchange = () => {
  $("analyze").disabled = !$("confirmed").checked || !circuit.components.length;
};
async function analyzeCircuit(scroll = true) {
  const token = version;
  $("analyze").disabled = true;
  $("analyze").textContent = "Tracing electrical nets…";
  analysisPhase(
    "engineering",
    "Tracing signal paths / checking engineering rules",
  );
  $("workbench").classList.add("analysis-busy");
  $("analyze").setAttribute("aria-busy", "true");
  error("");
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        circuit,
        reference: $("reference").value || null,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Analysis failed.");
    if (token !== version) return;
    result = data;
    analysisPhase("ready", "Diagnosis ready / deterministic rule evidence");
    renderResults();
    document
      .querySelectorAll(".steps li")
      .forEach((li) => li.classList.add("active"));
    if (scroll && circuit.components.length) {
      const index = circuit.components.findIndex((p) => p.id === focusedId);
      focusComponent(
        index >= 0
          ? index
          : result.issues.length
            ? circuit.components.findIndex(
                (p) => p.id === result.issues[0].components[0],
              )
            : 0,
        false,
      );
    }
  } catch (e) {
    analysisPhase("model", "Analysis unavailable / editable circuit retained");
    error(e.message);
  } finally {
    $("workbench").classList.remove("analysis-busy");
    $("analyze").removeAttribute("aria-busy");
    $("analyze").innerHTML = "Analyze connections <span>→</span>";
    $("analyze").disabled =
      !$("confirmed").checked || !circuit.components.length;
  }
}
$("analyze").onclick = () => analyzeCircuit();
$("findings-jump").onclick = () => openPanel("report-dialog");
$("issue-list").onclick = (e) => {
  const button = e.target.closest("[data-focus-component]");
  if (button) {
    document.getElementById("report-dialog").close();
    focusComponent(
      circuit.components.findIndex(
        (p) => p.id === button.dataset.focusComponent,
      ),
    );
  }
};
$("education").onchange = renderResults;
$("features").onchange = () => {
  if (!$("features").checked)
    $("image-help").textContent =
      "Review the photo and confirm every component and terminal manually.";
  renderImage();
};
for (const id of ["start", "upload-button", "replace-photo"])
  $(id).onclick = () => {
    $("view-source").click();
    $("upload").click();
  };
$("upload").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 12 * 1024 * 1024
  ) {
    error("Choose a JPG, PNG or WebP photo smaller than 12 MB.");
    scrollBench();
    return;
  }
  reset();
  const url = URL.createObjectURL(file);
  try {
    await setImage(url, false);
    $("image-title").textContent = file.name;
    scrollBench();
  } catch (e) {
    error(e.message);
  } finally {
    URL.revokeObjectURL(url);
    e.target.value = "";
  }
};
$("capture-photo").onclick = () => $("camera-upload").click();
$("camera-upload").onchange = $("upload").onchange;
$("reset").onclick = () => {
  reset();
  scrollBench();
};
$("try-demo").onclick = () => loadExample("reversed");
$("example-list").onclick = (e) => {
  const button = e.target.closest("[data-id]");
  if (button) loadExample(button.dataset.id);
};
$("import").onclick = () => $("netlist").click();
$("netlist").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 131072)
      throw new Error("Netlist must be smaller than 128 KB.");
    const data = JSON.parse(await file.text());
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circuit: data }),
    });
    const validation = await response.json();
    if (!response.ok) throw new Error(validation.error);
    invalidate();
    circuit = data;
    annotations = {};
    $("voltage").value = data.voltage;
    renderEditor();
    renderImage();
  } catch (e) {
    error(`Import failed: ${e.message}`);
  } finally {
    e.target.value = "";
  }
};
$("export").onclick = () => download("circuitlens-netlist.json", circuit);
$("download-report").onclick = () => {
  if (result)
    download("circuitlens-report.json", {
      generatedAt: new Date().toISOString(),
      source: isDemo
        ? "generated diagram with user-reviewed netlist"
        : "manually entered or imported netlist",
      circuit,
      reference: $("reference").value || null,
      analysis: result,
      perception: perception?.provenance(),
    });
};
perception = initPerception({
  getImage: () => image,
  getVoltage: () => Number($("voltage").value),
  redraw: renderImage,
  onInvalidate: () => {
    invalidate();
    circuit = { voltage: Number($("voltage").value), components: [] };
    annotations = {};
    renderEditor();
  },
  onApply: (converted, observation) => {
    document.getElementById("review-dialog").close();
    invalidate();
    circuit = converted;
    isDemo = false;
    annotations = {};
    for (const p of observation.observations.components.filter(
      (p) => p.review === "accepted",
    ))
      annotations[p.id] = [p.a.point, p.b.point].map((q) => ({
        x: q.x * canvas.width,
        y: q.y * canvas.height,
      }));
    renderEditor();
    renderImage();
    scrollBench();
    if (circuit.components.length) focusComponent(0, false);
  },
  onImage: async (demo) => {
    reset();
    await setImage(demo.image, false);
    $("image-title").textContent = demo.name;
    $("source-badge").textContent = "SYNTHETIC VISION DEMO";
    $("reference").value = "led";
    referencePreview();
    scrollBench();
  },
});
try {
  const response = await fetch("/api/examples");
  if (!response.ok)
    throw new Error(
      "Cannot load examples. Check that the local server is running.",
    );
  ({ examples: fixtures, references } = await response.json());
  const demoNames = {
    healthy: "Healthy LED",
    reversed: "Reversed polarity",
    disconnected: "Open connection",
    "no-resistor": "Missing resistor",
    short: "Crossed rails",
    divider: "Voltage divider",
    button: "Push-button LED",
  };
  const demoOrder = [
    "healthy",
    "reversed",
    "disconnected",
    "no-resistor",
    "short",
    "divider",
    "button",
  ];
  $("example-list").innerHTML = [...fixtures]
    .sort((a, b) => demoOrder.indexOf(a.id) - demoOrder.indexOf(b.id))
    .map(
      (x, i) =>
        `<button class="example-card" data-id="${x.id}" aria-pressed="false"><strong>${esc(demoNames[x.id] || x.name)}</strong></button>`,
    )
    .join("");
  $("reference").insertAdjacentHTML(
    "beforeend",
    Object.entries(references)
      .map(([id, r]) => `<option value="${id}">${esc(r.name)}</option>`)
      .join(""),
  );
  renderEditor();
  const requested = new URLSearchParams(location.search);
  if (requested.has("new")) reset();
  else
    await loadExample(
      fixtures.some((x) => x.id === requested.get("demo"))
        ? requested.get("demo")
        : "reversed",
    );
} catch (e) {
  error(e.message);
}

$("bench-evidence").addEventListener("click", (e) => {
  const b = e.target.closest("[data-focus-component]");
  if (b)
    focusComponent(
      circuit.components.findIndex((p) => p.id === b.dataset.focusComponent),
    );
});

document.addEventListener("cinematic-enter", () => {
  if (!circuit.components.length) loadExample("healthy");
});
