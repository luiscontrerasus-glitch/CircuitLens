import { terminalPoint } from "./layout.js";

const terminal = /^(VCC|GND|[A-J](?:[1-9]|[12]\d|30))$/;
// The model uses logical breadboard coordinates, never inferred photo geometry.
export function assemblyGeometry(circuit, issues = []) {
  return (circuit.components || []).flatMap((part, index) => {
    const a = String(part.a).trim().toUpperCase(),
      b = String(part.b).trim().toUpperCase();
    if (!terminal.test(a) || !terminal.test(b)) return [];
    const start = terminalPoint(a),
      end = terminalPoint(b);
    return [
      {
        ...part,
        index,
        start,
        end,
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
        length: Math.hypot(end.x - start.x, end.y - start.y),
        angle: (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI,
        faulty: issues.some((issue) => issue.components.includes(part.id)),
      },
    ];
  });
}

export function componentObject(type) {
  const object = document.createElement("span");
  object.className = `solid-component solid-${type}`;
  if (type === "resistor") {
    for (let i = 0; i < 8; i++) {
      const face = document.createElement("i");
      face.className = "resistor-face";
      face.style.transform = `rotateX(${i * 45}deg) translateZ(10px)`;
      object.append(face);
    }
  } else if (type === "led") {
    for (let i = 0; i < 7; i++) {
      const disc = document.createElement("i");
      disc.className = "led-disc";
      disc.style.transform = `translate(-50%, -50%) translateZ(${i * 4}px)`;
      disc.style.width = `${32 - Math.max(0, i - 2) * 4}px`;
      disc.style.height = disc.style.width;
      object.append(disc);
    }
  } else if (type === "button") {
    object.innerHTML = '<i class="button-base"></i><i class="button-cap"></i>';
  }
  return object;
}

export function mountAssembly(container, circuit, issues = []) {
  container.replaceChildren();
  if (!circuit.components.length) return;
  const stage = document.createElement("div");
  stage.className = "model-stage";
  const board = document.createElement("div");
  board.className = "model-board";
  board.innerHTML =
    '<div class="board-layer bottom"></div><div class="board-layer middle"></div><div class="board-layer top"><span class="board-engraving">CIRCUITLENS / LOGICAL ASSEMBLY</span><span class="board-rail positive">+ VCC</span><span class="board-rail negative">− GND</span></div>';
  const parts = assemblyGeometry(circuit, issues);
  const selections = document.createElement("div");
  selections.className = "component-strip";
  selections.setAttribute("aria-label", "Select model component");
  for (const part of parts) {
    const node = document.createElement("button");
    node.className = `model-part ${part.faulty ? "faulty" : ""}`;
    node.dataset.component = part.index;
    node.setAttribute(
      "aria-label",
      `Inspect ${part.id}, ${part.type}, ${part.a} to ${part.b}${part.faulty ? ", finding" : ""}`,
    );
    node.style.left = `${part.x}px`;
    node.style.top = `${part.y}px`;
    node.style.setProperty("--part-angle", `${part.angle}deg`);
    node.style.setProperty("--lead-length", `${Math.max(1, part.length)}px`);
    node.innerHTML = '<span class="model-lead"></span>';
    node.append(componentObject(part.type));
    const label = document.createElement("span");
    label.className = "model-label";
    label.textContent = part.id;
    node.append(label);
    board.append(node);
    const chip = document.createElement("button");
    chip.dataset.component = part.index;
    chip.className = `component-chip ${part.faulty ? "faulty" : ""}`;
    chip.textContent = `${part.faulty ? "! " : ""}${part.id} / ${part.type}`;
    selections.append(chip);
  }
  stage.append(board);
  container.append(stage, selections);
  if (parts.length !== circuit.components.length) {
    const warning = document.createElement("p");
    warning.className = "helper";
    warning.textContent =
      "Unresolved terminals are omitted from the assembly. Resolve them in connections.";
    container.append(warning);
  }
}

export function initSpatialStory() {
  const assembly = document.querySelector(".circuit-assembly");
  const layers = document.createElement("div");
  layers.className = "story-solids";
  layers.innerHTML =
    '<div class="story-board-edge"></div><button class="story-part story-resistor" aria-label="Inspect illustrative resistor R1"><span class="story-part-label">R1 / 330 Ω</span></button><button class="story-part story-led" aria-label="Inspect illustrative LED D1"><span class="story-part-label">D1 / CHECK POLARITY</span></button>';
  layers.querySelector(".story-resistor").append(componentObject("resistor"));
  layers.querySelector(".story-led").append(componentObject("led"));
  assembly?.append(layers);
  layers.querySelectorAll("button").forEach((button) =>
    button.addEventListener("click", () => {
      const selected = button.classList.toggle("selected");
      layers.querySelectorAll("button").forEach((other) => {
        if (other !== button) other.classList.remove("selected");
      });
      const corrected = ["fix", "product"].includes(
        document.querySelector(".cinema").dataset.scene,
      );
      document.querySelector("#story-readout").textContent = selected
        ? button.classList.contains("story-led")
          ? corrected
            ? "D1 / corrected illustrative orientation. Anode toward the resistor."
            : "D1 / cathode toward supply. Disconnect power, then reverse A / K."
          : "R1 / 330 Ω limits current in the reviewed model."
        : "Select R1 or D1 to inspect the connection.";
    }),
  );
  let resizeFrame = 0;
  const resize = () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      document.querySelectorAll(".model-stage").forEach((stage) => {
        stage.style.setProperty(
          "--model-scale",
          Math.min(1.35, stage.clientWidth / 800, stage.clientHeight / 520),
        );
      });
      if (assembly)
        layers.style.setProperty("--solid-scale", assembly.clientWidth / 900);
    });
  };
  new ResizeObserver(resize).observe(document.querySelector(".graph-panel"));
  if (assembly) new ResizeObserver(resize).observe(assembly);
  const graph = document.querySelector("#live-graph");
  let pointerFrame = 0;
  graph.addEventListener("pointermove", (event) => {
    if (
      pointerFrame ||
      event.pointerType === "touch" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.body.classList.contains("reduced-motion")
    )
      return;
    const x = event.clientX,
      y = event.clientY;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const rect = graph.getBoundingClientRect();
      graph.style.setProperty(
        "--bench-yaw",
        `${((x - rect.left - rect.width / 2) / rect.width) * 8}deg`,
      );
      graph.style.setProperty(
        "--bench-pitch",
        `${((y - rect.top - rect.height / 2) / rect.height) * 5}deg`,
      );
    });
  });
  graph.addEventListener("pointerleave", () => {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    graph.style.setProperty("--bench-yaw", "0deg");
    graph.style.setProperty("--bench-pitch", "0deg");
  });
  return resize;
}
