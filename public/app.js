import { initPerception } from "./perception-ui.js";
import { colorFeatureMask } from "./vision.js";
import { terminalPoint } from "./layout.js";
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
  photoVersion = 0;
const canvas = $("photo"),
  ctx = canvas.getContext("2d", { willReadFrequently: true });
function error(message) {
  $("error").textContent = message;
  $("error").hidden = !message;
}
function invalidate() {
  document
    .querySelectorAll(".steps li")
    .forEach((li, i) => li.classList.toggle("active", i < 2));
  version++;
  result = null;
  $("results").hidden = true;
  $("export-preview").hidden = true;
  $("confirmed").checked = false;
  $("analyze").disabled = true;
  error("");
  renderImage();
}
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
  $("empty-components").hidden = circuit.components.length > 0;
  $("components").innerHTML = circuit.components
    .map(
      (p, i) =>
        `<tr data-index="${i}" class="${result?.issues.some((x) => x.components.includes(p.id)) ? "flagged" : ""}"><td><input aria-label="Component ${i + 1} ID" data-field="id" value="${esc(p.id)}"><select aria-label="${esc(p.id)} type" data-field="type">${["wire", "resistor", "led", "button"].map((t) => `<option ${t === p.type ? "selected" : ""}>${t}</option>`).join("")}</select><button class="text-button" data-mark="${i}" aria-label="Mark ${esc(p.id)} terminals">Mark ↗</button></td><td><input aria-label="${esc(p.id)} terminal A" data-field="a" value="${esc(p.a)}" maxlength="5"></td><td><input aria-label="${esc(p.id)} terminal B" data-field="b" value="${esc(p.b)}" maxlength="5"></td><td>${p.type === "resistor" ? `<input type="number" aria-label="${esc(p.id)} resistance" data-field="value" min="1" max="10000000" value="${p.value}">` : p.type === "button" ? `<select aria-label="${esc(p.id)} state" data-field="closed"><option value="true" ${p.closed ? "selected" : ""}>Closed</option><option value="false" ${!p.closed ? "selected" : ""}>Open</option></select>` : `<span class="helper">—</span>`}</td><td><button class="remove" data-remove="${i}" aria-label="Remove ${esc(p.id)}">×</button></td></tr>`,
    )
    .join("");
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
    ctx.strokeStyle = faulty ? "#e67d26" : "#317f69";
    ctx.lineWidth = faulty ? 5 : 2;
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
  const scale = Math.min(1, 1000 / img.naturalWidth, 1000 / img.naturalHeight);
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
  $("workbench").scrollIntoView({ behavior: "smooth" });
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
  referencePreview();
  renderEditor();
  document
    .querySelectorAll(".example-card")
    .forEach((b) => b.classList.toggle("selected", b.dataset.id === id));
  try {
    await setImage(example.image, true);
  } catch (e) {
    error(e.message);
  }
  scrollBench();
}
function reset() {
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
  $("voltage").value = 5;
  $("reference").value = "";
  $("features").checked = false;
  $("features").disabled = false;
  $("image-help").textContent =
    "Run live AI to propose components and terminals, or enter them manually.";
  document
    .querySelectorAll(".example-card")
    .forEach((b) => b.classList.remove("selected"));
  renderEditor();
  referencePreview();
}
function download(name, data) {
  const serialized = JSON.stringify(data, null, 2);
  $("export-title").textContent = name;
  $("export-data").value = serialized;
  $("export-preview").hidden = false;
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
  $("export-preview").scrollIntoView({ behavior: "smooth" });
}
$("select-export").onclick = () => {
  $("export-data").focus();
  $("export-data").select();
};
function renderResults() {
  if (!result) return;
  const n = result.issues.length;
  $("results").hidden = false;
  $("result-heading").textContent = n
    ? `${n} finding${n === 1 ? "" : "s"}. A clearer next step.`
    : "The connections check out.";
  $("result-summary").innerHTML =
    `<div class="summary-banner ${result.status}"><span class="summary-icon">${n ? "◎" : "✓"}</span><div><strong>${result.status === "critical" ? "Disconnect power before making changes" : n ? "Review the highlighted connections" : "No supported-rule faults found"}</strong><p>${result.summary.components} components · ${result.summary.nets} electrical nets · ${$("reference").value ? "Compared with intended circuit" : "Safety checks only — no reference selected"}</p></div></div>`;
  $("measurements").innerHTML = result.measurements
    .map(
      (m) =>
        `<div class="measurement"><span>${esc(m.label)}</span><strong>${esc(m.value)}</strong><p>${esc(m.note)}</p></div>`,
    )
    .join("");
  $("issue-list").innerHTML = result.issues
    .map(
      (i) =>
        `<article class="issue"><header><h3>${esc(i.title)}</h3><span class="severity ${i.severity}">${esc(i.severity.toUpperCase())}</span></header><dl><dt>EVIDENCE</dt><dd>${esc(i.evidence)}</dd>${$("education").checked ? `<dt>WHY IT MATTERS</dt><dd>${esc(i.why)}</dd>` : ""}<dt>HOW TO FIX IT</dt><dd>${esc(i.fix)}</dd></dl><small>Confidence: ${esc(i.confidence)} · photo interpretation unverified</small></article>`,
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
    mark = { id: circuit.components[+b.dataset.mark].id, points: [] };
    $("image-help").textContent =
      `Click terminal A, then terminal B for ${mark.id} on the photo. This only places visual anchors.`;
  }
});
canvas.addEventListener("click", (e) => {
  if (!mark) return;
  const rect = canvas.getBoundingClientRect();
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
$("analyze").onclick = async () => {
  const token = version;
  $("analyze").disabled = true;
  $("analyze").textContent = "Tracing electrical nets…";
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
    renderResults();
    document
      .querySelectorAll(".steps li")
      .forEach((li) => li.classList.add("active"));
    $("results").scrollIntoView({ behavior: "smooth" });
  } catch (e) {
    error(e.message);
  } finally {
    $("analyze").innerHTML = "Analyze connections <span>→</span>";
    $("analyze").disabled =
      !$("confirmed").checked || !circuit.components.length;
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
  $(id).onclick = () => $("upload").click();
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
    $("upload").value = "";
  }
};
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
    $("components").scrollIntoView({ behavior: "smooth" });
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
  $("example-list").innerHTML = fixtures
    .map(
      (x, i) =>
        `<button class="example-card" data-id="${x.id}"><span class="number">EXPERIMENT 0${i + 1}</span><span class="arrow">↗</span><strong>${esc(x.name)}</strong><p>${esc(x.description)}</p></button>`,
    )
    .join("");
  $("reference").insertAdjacentHTML(
    "beforeend",
    Object.entries(references)
      .map(([id, r]) => `<option value="${id}">${esc(r.name)}</option>`)
      .join(""),
  );
  renderEditor();
} catch (e) {
  error(e.message);
}
