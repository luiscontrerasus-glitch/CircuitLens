import { analysisPhase } from "./instrument.js";
import { openPanel } from "./workbench-shell.js";
import { terminalNet } from "./schematic.js";
export function canBuildObservations(observations) {
  const parts = observations?.components || [];
  if (parts.some((part) => part.review === "pending")) return false;
  const accepted = parts.filter((part) => part.review === "accepted");
  return (
    accepted.length > 0 &&
    new Set(accepted.map((part) => part.id)).size === accepted.length &&
    accepted.every(
      (part) =>
        ["wire", "resistor", "led", "button"].includes(part.type) &&
        terminalNet(part.a.hole) &&
        terminalNet(part.b.hole) &&
        (part.type !== "resistor" ||
          (Number.isFinite(part.value) &&
            part.value >= 1 &&
            part.value <= 10000000)) &&
        (part.type !== "button" || typeof part.closed === "boolean"),
    )
  );
}
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
export function perceptionLabel(provenance) {
  if (provenance.mode === "recorded")
    return "RECORDED MODEL OUTPUT · NOT A LIVE REQUEST";
  if (provenance.mode === "simulated")
    return "SIMULATED TEST RESPONSE · NOT AI INFERENCE";
  return provenance.provider === "Google Gemini"
    ? "LIVE GEMINI OBSERVATIONS · HUMAN REVIEW REQUIRED"
    : "LIVE OPENAI OBSERVATIONS · HUMAN REVIEW REQUIRED";
}
export function initPerception({
  getImage,
  getVoltage,
  onApply,
  onImage,
  redraw,
  onInvalidate,
}) {
  let response = null,
    config = null,
    currentDemo = null,
    generation = 0,
    reviewRevision = 0,
    busy = false,
    selected = null;
  function status(message, isError = false) {
    $("vision-status").textContent = message;
    $("vision-status").classList.toggle("vision-error", isError);
  }
  function updateReviewSummary() {
    const obs = response?.observations;
    if (!obs) return;
    $("review-count").textContent =
      `${obs.components.filter((p) => p.review === "accepted").length} accepted · ${obs.components.filter((p) => p.review === "pending").length} pending · ${obs.components.filter((p) => p.review === "rejected").length} rejected`;
    $("observation-json").textContent = JSON.stringify(response, null, 2);
  }
  function render() {
    document
      .querySelector(".visual-panel")
      .classList.toggle("processing", busy);
    $("vision-run").setAttribute("aria-busy", String(busy));
    const obs = response?.observations;
    $("detection-review").hidden = !obs;
    $("vision-run").disabled = busy || !getImage() || !config?.configured;
    $("vision-replay").hidden =
      !currentDemo ||
      !config?.demos.find((d) => d.id === currentDemo)?.recorded;
    if (!obs) return;
    $("vision-provenance").textContent =
      `${perceptionLabel(response.provenance)} · ${response.provenance.model} · ${new Date(response.provenance.generated_at).toLocaleString()}`;
    $("vision-summary").textContent = obs.summary;
    $("vision-warnings").textContent = [
      ...obs.warnings,
      obs.confidence_note,
    ].join(" ");
    $("detection-list").innerHTML = obs.components
      .map((p, i) => {
        const low =
          p.type === "unknown" ||
          (p.type === "resistor" && p.value === null) ||
          (p.type === "button" && p.closed === null) ||
          Math.min(p.confidence, p.a.confidence, p.b.confidence) < 0.8 ||
          !p.a.hole ||
          !p.b.hole;
        return `<article class="detection ${p.review} ${low ? "uncertain" : ""}" data-detection="${i}"><div class="detection-title"><button class="text-button" data-focus="${i}">${esc(p.id)} · highlight</button><span>${low ? "REVIEW CAREFULLY" : "REVIEW REQUIRED"} · ${Math.round(p.confidence * 100)}%*</span><strong>${esc(p.review)}${p.edited ? " · edited" : ""}</strong></div><p>${esc(p.evidence)}</p><div class="detection-fields"><label>ID<input data-key="id" value="${esc(p.id)}" aria-label="Detection ${i + 1} ID"></label><label>Type<select data-key="type" aria-label="${esc(p.id)} detected type">${["wire", "resistor", "led", "button", "unknown"].map((t) => `<option ${p.type === t ? "selected" : ""}>${t}</option>`).join("")}</select></label><label>A / anode (${Math.round(p.a.confidence * 100)}%*)<input data-key="a" placeholder="Unknown" value="${esc(p.a.hole ?? "")}" aria-label="${esc(p.id)} detected terminal A"></label><label>B / cathode (${Math.round(p.b.confidence * 100)}%*)<input data-key="b" placeholder="Unknown" value="${esc(p.b.hole ?? "")}" aria-label="${esc(p.id)} detected terminal B"></label>${p.type === "resistor" ? `<label>Resistance (Ω)<input type="number" data-key="value" placeholder="Unknown" value="${p.value ?? ""}" aria-label="${esc(p.id)} detected resistance"></label>` : ""}${p.type === "button" ? `<label>Switch state<select data-key="closed" aria-label="${esc(p.id)} detected state"><option value="" ${p.closed === null ? "selected" : ""}>Unknown</option><option value="true" ${p.closed === true ? "selected" : ""}>Closed</option><option value="false" ${p.closed === false ? "selected" : ""}>Open</option></select></label>` : ""}</div><div class="detection-actions"><button class="secondary small" data-review="accepted" data-i="${i}">Accept ${esc(p.id)}</button><button class="text-button" data-review="rejected" data-i="${i}">Reject ${esc(p.id)}</button></div></article>`;
      })
      .join("");
    $("vision-apply").disabled = busy || !canBuildObservations(obs);
    $("review-readiness").textContent = canBuildObservations(obs)
      ? "Accepted connections are ready to build. Engineering checks follow your confirmation."
      : "Review every detection. Resolve unknown terminals, values and switch states in accepted parts; keep IDs unique.";
    updateReviewSummary();
  }
  async function run(recorded = false) {
    if (busy) return;
    if (!getImage()) {
      status("Choose an image first.", true);
      return;
    }
    if (!recorded && !$("vision-consent").checked) {
      status(
        "Check the image-sharing consent box before starting live AI.",
        true,
      );
      return;
    }
    const token = ++generation;
    busy = true;
    analysisPhase(
      "perception",
      recorded
        ? "Loading recorded observations / not live inference"
        : "Scanning components / mapping connection candidates",
    );
    document.querySelector(".visual-panel").classList.add("processing");
    $("vision-run").setAttribute("aria-busy", "true");
    status(
      recorded
        ? "Loading recorded observations…"
        : "Looking for visible parts and terminal candidates…",
    );
    render();
    try {
      let r;
      if (recorded) r = await fetch(`/api/vision-replay/${currentDemo}`);
      else {
        const image = getImage(),
          c = document.createElement("canvas"),
          scale = Math.min(
            1,
            1600 / image.naturalWidth,
            1600 / image.naturalHeight,
          );
        c.width = Math.round(image.naturalWidth * scale);
        c.height = Math.round(image.naturalHeight * scale);
        c.getContext("2d").drawImage(image, 0, 0, c.width, c.height);
        r = await fetch("/api/perceive", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-vision-access-code": $("vision-access").value,
          },
          body: JSON.stringify({
            image: c.toDataURL("image/jpeg", 0.9),
            consent: true,
          }),
        });
      }
      const data = await r.json();
      if (token !== generation) return;
      if (!r.ok)
        throw Error(data.error || "Visual analysis could not complete.");
      response = data;
      selected = null;
      onInvalidate();
      analysisPhase("review", "Observations ready / human review required");
      status(
        data.observations.components.length
          ? "Observations ready. Review every part and both terminal candidates."
          : "No supported parts found. Use the manual component editor below.",
      );
      render();
      redraw();
      openPanel("review-dialog");
    } catch (e) {
      if (token === generation) {
        analysisPhase(
          "model",
          "Perception unavailable / manual entry remains available",
        );
        status(
          `${e.message} You can still add components manually below.`,
          true,
        );
      }
    } finally {
      if (token === generation) {
        busy = false;
        render();
      }
    }
  }
  $("vision-run").onclick = () => run(false);
  $("vision-replay").onclick = () => run(true);
  $("detection-list").addEventListener("input", (e) => {
    const card = e.target.closest("[data-detection]"),
      key = e.target.dataset.key;
    if (!card || !key) return;
    const p = response.observations.components[+card.dataset.detection];
    if (["a", "b"].includes(key))
      p[key].hole = e.target.value.trim().toUpperCase() || null;
    else if (key === "value")
      p.value = e.target.value === "" ? null : Number(e.target.value);
    else if (key === "closed")
      p.closed = e.target.value === "" ? null : e.target.value === "true";
    else p[key] = e.target.value.trim();
    p.review = "pending";
    p.edited = true;
    reviewRevision++;
    onInvalidate();
    $("vision-apply").disabled = true;
    if (key === "type") render();
    else {
      card.querySelector(".detection-title strong").textContent =
        "pending · edited";
      card.classList.remove("accepted", "rejected");
      const low =
        Math.min(p.confidence, p.a.confidence, p.b.confidence) < 0.8 ||
        !p.a.hole ||
        !p.b.hole;
      card.classList.toggle("uncertain", low);
      card.querySelector(".detection-title > span").textContent =
        `${low ? "REVIEW CAREFULLY" : "REVIEW REQUIRED"} · ${Math.round(p.confidence * 100)}%*`;
    }
    updateReviewSummary();
    redraw();
  });
  $("detection-list").addEventListener("click", (e) => {
    const focus = e.target.closest("[data-focus]");
    if (focus) {
      selected = +focus.dataset.focus;
      redraw();
      $("review-photo").scrollIntoView({
        block: "nearest",
        behavior:
          document.body.classList.contains("reduced-motion") ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
      });
      return;
    }
    const b = e.target.closest("[data-review]");
    if (!b) return;
    reviewRevision++;
    response.observations.components[+b.dataset.i].review = b.dataset.review;
    onInvalidate();
    render();
    redraw();
  });
  $("detection-add").onclick = () => {
    if (!response) return;
    reviewRevision++;
    let n = 1;
    while (response.observations.components.some((p) => p.id === `X${n}`)) n++;
    response.observations.components.push({
      id: `X${n}`,
      type: "unknown",
      confidence: 0,
      evidence:
        "Manually added. Set type, terminals and value from the image or measurements.",
      bbox: { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
      a: { hole: null, confidence: 0, point: { x: 0.1, y: 0.1 } },
      b: { hole: null, confidence: 0, point: { x: 0.3, y: 0.3 } },
      value: null,
      closed: null,
      review: "pending",
      manual: true,
    });
    onInvalidate();
    render();
    redraw();
  };
  $("vision-apply").onclick = async () => {
    const token = generation;
    const revision = reviewRevision;
    try {
      analysisPhase(
        "building",
        "Building circuit model from accepted observations",
      );
      const r = await fetch("/api/observations/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observations: response.observations,
          voltage: getVoltage(),
        }),
      });
      const data = await r.json();
      if (token !== generation || revision !== reviewRevision) return;
      if (!r.ok) throw Error(data.error);
      onApply(data.circuit, response);
      analysisPhase(
        "model",
        "Reviewed model built / confirm and run engineering checks",
      );
      status(
        "Accepted observations transferred to the circuit editor. Check the supply and reference, confirm the netlist, then analyze.",
      );
    } catch (e) {
      analysisPhase(
        "review",
        "Resolve accepted observations before constructing the model",
      );
      status(e.message, true);
    }
  };
  $("vision-demos").onclick = async (e) => {
    const b = e.target.closest("[data-vision-demo]");
    if (!b) return;
    const d = config.demos.find((x) => x.id === b.dataset.visionDemo);
    await onImage(d);
    currentDemo = d.id;
    status(
      "Synthetic teaching image loaded. Live analysis reads its pixels and visible labels; no fixture netlist is passed to the model.",
    );
    render();
  };
  fetch("/api/vision-config")
    .then((r) => r.json())
    .then((c) => {
      config = c;
      $("vision-model").textContent = c.configured
        ? `Configured · ${c.provider_label} · ${c.model} · ${c.daily_limit} attempts/day`
        : c.unavailable_reason;
      $("vision-consent").disabled = !c.configured;
      $("vision-availability").textContent = c.configured
        ? c.provider === "gemini"
          ? `Gemini Free Tier recognition is configured. Every observation needs your review. ${c.data_notice}`
          : "Optional OpenAI recognition is configured and may incur API charges. Image sharing requires consent. Manual editing and examples remain free."
        : c.unavailable_reason;
      $("vision-consent-copy").textContent =
        `resized image to ${c.provider_label} for visual analysis. ${c.data_notice}`;
      $("vision-access-label").hidden = !c.requires_access_code;
      $("vision-demos").innerHTML = c.demos
        .map(
          (d) =>
            `<button class="secondary small" data-vision-demo="${d.id}">${esc(d.name)} ↗</button>`,
        )
        .join("");
      render();
    })
    .catch(() =>
      status(
        "Cannot load vision settings. The manual editor is still available.",
        true,
      ),
    );
  return {
    imageChanged() {
      generation++;
      busy = false;
      response = null;
      currentDemo = null;
      selected = null;
      status(
        config?.configured
          ? "Choose optional live analysis, or enter connections manually."
          : config?.unavailable_reason ||
              "Enter connections manually. Examples need no API credits.",
      );
      render();
    },
    reset() {
      generation++;
      busy = false;
      response = null;
      currentDemo = null;
      selected = null;
      render();
    },
    provenance() {
      return response?.provenance ?? null;
    },
    draw(ctx, w, h) {
      if (!response) return;
      response.observations.components.forEach((p, i) => {
        if (p.review === "rejected") return;
        const b = p.bbox;
        ctx.save();
        ctx.strokeStyle = p.review === "accepted" ? "#28734c" : "#bb7623";
        ctx.lineWidth = selected === i ? 5 : 2;
        ctx.setLineDash(p.review === "pending" ? [6, 4] : []);
        ctx.strokeRect(b.x * w, b.y * h, b.width * w, b.height * h);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = "bold 12px Segoe UI";
        ctx.fillText(
          `${p.id} ${Math.round(p.confidence * 100)}%*${p.edited ? " / EDITED" : ""}`,
          b.x * w,
          Math.max(14, b.y * h - 6),
        );
        for (const t of ["a", "b"]) {
          const q = p[t].point;
          ctx.beginPath();
          ctx.arc(q.x * w, q.y * h, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillText(
            `${t.toUpperCase()}:${p[t].hole ?? "?"}`,
            q.x * w + 9,
            q.y * h + 5,
          );
        }
        ctx.restore();
      });
    },
  };
}
