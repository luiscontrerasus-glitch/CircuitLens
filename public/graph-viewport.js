// Presentation geometry only. Never changes terminals or electrical topology.
export function fitScale(
  width,
  height,
  contentWidth,
  contentHeight,
  padding = 24,
) {
  if (
    ![width, height, contentWidth, contentHeight].every(
      (n) => Number.isFinite(n) && n > 0,
    )
  )
    return 1;
  return Math.max(
    0.05,
    Math.min(
      (width - padding * 2) / contentWidth,
      (height - padding * 2) / contentHeight,
    ),
  );
}
export function clampZoom(value) {
  return Math.max(1, Math.min(4, Number.isFinite(value) ? value : 1));
}

export function initGraphViewport() {
  const graph = document.getElementById("live-graph");
  let zoom = 1,
    pan = { x: 0, y: 0 },
    pointers = new Map(),
    gesture = null,
    moved = false;
  const status = document.getElementById("zoom-status");
  const apply = () => {
    const schematic = graph.querySelector(".schematic-view");
    const svg = schematic?.querySelector("svg");
    if (svg && !schematic.hidden && schematic.clientWidth > 0) {
      const [, , w, h] = svg.getAttribute("viewBox").split(" ").map(Number);
      const fit = Math.min(
        2.4,
        fitScale(schematic.clientWidth, schematic.clientHeight, w, h, 20),
      );
      svg.style.width = `${w * fit}px`;
      svg.style.height = `${h * fit}px`;
      svg.style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    }
    const stage = graph.querySelector(".model-stage");
    if (stage) {
      stage.style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    }
    status.textContent = zoom === 1 ? "Fit" : `${Math.round(zoom * 100)}%`;
    document.getElementById("zoom-out").disabled = zoom === 1;
    document.getElementById("zoom-in").disabled = zoom === 4;
  };
  const fit = () => {
    zoom = 1;
    pan = { x: 0, y: 0 };
    apply();
  };
  document.getElementById("zoom-in").onclick = () => {
    zoom = clampZoom(zoom * 1.25);
    apply();
  };
  document.getElementById("zoom-out").onclick = () => {
    zoom = clampZoom(zoom / 1.25);
    if (zoom === 1) pan = { x: 0, y: 0 };
    apply();
  };
  document.getElementById("zoom-fit").onclick = fit;
  const point = (event) => ({ x: event.clientX, y: event.clientY });
  const distance = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  graph.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || document.body.dataset.circuitView === "source")
      return;
    pointers.set(event.pointerId, point(event));
    moved = false;
    if (pointers.size === 2) gesture = { distance: distance(), zoom };
    else gesture = { start: point(event), pan: { ...pan } };
  });
  graph.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, point(event));
    if (pointers.size === 2 && gesture?.distance) {
      zoom = clampZoom(
        (gesture.zoom * distance()) / Math.max(1, gesture.distance),
      );
      moved = true;
      apply();
    } else if (zoom > 1 && gesture?.start) {
      const dx = event.clientX - gesture.start.x,
        dy = event.clientY - gesture.start.y;
      if (Math.hypot(dx, dy) > 6) {
        moved = true;
        pan = {
          x: Math.max(
            (-graph.clientWidth * zoom) / 2,
            Math.min((graph.clientWidth * zoom) / 2, gesture.pan.x + dx),
          ),
          y: Math.max(
            (-graph.clientHeight * zoom) / 2,
            Math.min((graph.clientHeight * zoom) / 2, gesture.pan.y + dy),
          ),
        };
        apply();
      }
    }
  });
  const release = (event) => {
    pointers.delete(event.pointerId);
    if (!pointers.size) gesture = null;
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  graph.addEventListener(
    "click",
    (event) => {
      if (moved) {
        event.stopImmediatePropagation();
        moved = false;
      }
    },
    true,
  );
  graph.addEventListener("keydown", (event) => {
    if (event.key === "0") {
      fit();
      event.preventDefault();
    } else if (event.key === "+" || event.key === "=") {
      zoom = clampZoom(zoom * 1.25);
      apply();
      event.preventDefault();
    } else if (event.key === "-") {
      zoom = clampZoom(zoom / 1.25);
      apply();
      event.preventDefault();
    }
  });
  new ResizeObserver(apply).observe(graph);
  new MutationObserver(fit).observe(graph, { childList: true });
  return { refresh: apply, fit };
}
