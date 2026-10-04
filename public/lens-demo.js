import { mountAssembly } from "./assembly.js";
import { schematicMarkup } from "./schematic.js";
const root = document.getElementById("linked-demo");
if (root) {
  const physical = document.getElementById("demo-physical"),
    schematic = document.getElementById("demo-schematic"),
    readout = document.getElementById("demo-readout"),
    button = document.getElementById("demo-correct");
  let fixture,
    circuit,
    result,
    selected = 2,
    corrected = false;
  const compact = matchMedia("(max-width:1000px)");
  button.disabled = true;
  function select(index) {
    if (!circuit || !result) return;
    selected = index;
    root
      .querySelectorAll("[data-component]")
      .forEach((part) =>
        part.classList.toggle(
          "selected",
          Number(part.dataset.component) === index,
        ),
      );
    const part = circuit.components[index];
    const issue = result.issues.find((i) => i.components.includes(part.id));
    readout.textContent = issue
      ? issue.title
      : `${part.id} · No supported-rule finding for this part`;
    document.getElementById("demo-inspect").href =
      `/workbench.html?demo=${corrected ? "healthy" : "reversed"}`;
  }
  function render() {
    if (!circuit || !result) return;
    root.dataset.status = result.status;
    root.querySelector(".evidence-icon").textContent =
      result.status === "pass" ? "✓" : "!";
    mountAssembly(physical, circuit, result.issues);
    schematic.innerHTML = schematicMarkup(
      circuit,
      result.issues,
      result.status,
      compact.matches,
    );
    const scale = Math.min(
      1.5,
      physical.clientWidth / 820,
      physical.clientHeight / 510,
    );
    physical.style.setProperty("--model-scale", String(scale));
    select(selected);
  }
  async function analyze() {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circuit, reference: fixture.reference }),
    });
    if (!response.ok) throw Error();
    result = await response.json();
  }
  for (const eventName of ["click", "pointerover", "focusin"])
    root.addEventListener(eventName, (event) => {
      const part = event.target.closest("[data-component]");
      if (part && circuit) select(Number(part.dataset.component));
    });
  root.addEventListener("keydown", (event) => {
    if (
      event.target.matches("[data-component]") &&
      ["Enter", " "].includes(event.key)
    ) {
      event.preventDefault();
      select(Number(event.target.dataset.component));
    }
  });
  new ResizeObserver(() => {
    if (circuit) render();
  }).observe(physical);
  compact.addEventListener("change", () => {
    if (circuit) render();
  });
  button.onclick = async () => {
    button.disabled = true;
    const previousCircuit = structuredClone(circuit);
    try {
      const led = circuit.components.find((part) => part.id === "D1");
      [led.a, led.b] = [led.b, led.a];
      await analyze();
      corrected = !corrected;
      selected = 2;
      render();
      button.textContent = corrected
        ? "Restore fault ↺"
        : "Preview polarity correction →";
      document.getElementById("demo-state").textContent =
        corrected && result.status === "pass"
          ? "Corrected model · supported checks passed"
          : "Reversed LED · generated fixture";
    } catch {
      circuit = previousCircuit;
      readout.textContent =
        "Preview unavailable. Open the workbench to inspect the circuit.";
    } finally {
      button.disabled = false;
    }
  };
  try {
    const { examples: fixtures } = await (await fetch("/api/examples")).json();
    fixture = fixtures.find((example) => example.id === "reversed");
    circuit = structuredClone(fixture.circuit);
    await analyze();
    render();
    button.disabled = false;
  } catch {
    physical.innerHTML =
      '<p class="demo-loading">Circuit preview unavailable.</p>';
    schematic.innerHTML =
      '<p class="demo-loading">Open the workbench to retry.</p>';
    readout.textContent =
      "The example could not load. Open the workbench to try again.";
    button.hidden = true;
  }
}
