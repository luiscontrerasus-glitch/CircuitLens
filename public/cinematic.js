export const storyScenes = [
  {
    id: "physical",
    label: "The circuit",
    heading: "See<br>what’s wrong.",
    copy: "A dark LED. One wrong connection.<br>Make the invisible understandable.",
    note: "01 / PHYSICAL CIRCUIT",
    readout: "A circuit waiting to be understood.",
    action: "Explore the signal ↓",
  },
  {
    id: "perception",
    label: "Observe",
    heading: "First,<br>look closer.",
    copy: "Parts. Terminals. Uncertainty.<br>Observations you can inspect and correct.",
    note: "02 / VISUAL PERCEPTION",
    readout: "Illustrative candidates / human review required.",
    action: "Continue to the model ↓",
  },
  {
    id: "model",
    label: "Structure",
    heading: "From wires<br>to reasoning.",
    copy: "An explicit circuit model.<br>Every terminal. Every connection.",
    note: "03 / STRUCTURED MODEL",
    readout: "Reviewed terminals → inspectable netlist.",
    action: "Trace the failure ↓",
  },
  {
    id: "diagnosis",
    label: "Diagnose",
    heading: "Don’t guess.<br>Trace it.",
    copy: "The cathode reaches power.<br>The anode reaches ground. Reverse bias.",
    note: "04 / DETERMINISTIC DIAGNOSIS",
    readout: "D1 / reversed polarity / disconnect power before correcting.",
    action: "See the correction ↓",
  },
  {
    id: "fix",
    label: "Correct",
    heading: "Understand<br>the circuit.",
    copy: "Swap the reviewed LED terminals.<br>Check again. Learn why it works.",
    note: "05 / CORRECTED MODEL",
    readout: "Illustrative corrected netlist / supported checks pass.",
    action: "Enter the workbench ↓",
  },
  {
    id: "product",
    label: "Try it",
    heading: "Your circuit.<br>Your next step.",
    copy: "Now use the real workbench.<br>Seven fixtures. Editable graphs. Engineering evidence.",
    note: "06 / REAL PRODUCT",
    readout: "Try a generated fixture or review your own image.",
    action: "Try CircuitLens →",
  },
];
export function sceneAt(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(
    0,
    Math.min(
      storyScenes.length - 1,
      Math.floor(Math.max(0, Math.min(1, progress)) * storyScenes.length),
    ),
  );
}
export function initCinematic() {
  const root = document.querySelector(".cinema");
  if (!root) return;
  let index = -1,
    frame = 0,
    manual = false;
  const mql = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () =>
    mql.matches || document.body.classList.contains("reduced-motion");
  const show = (next) => {
    if (next === index) return;
    index = next;
    const scene = storyScenes[index];
    root.dataset.scene = scene.id;
    document.body.dataset.storyScene = scene.id;
    root.querySelector("#story-heading").innerHTML = scene.heading;
    root.querySelector("#story-copy").innerHTML = scene.copy;
    root.querySelector("#story-note").textContent = scene.note;
    root.querySelector("#story-readout").textContent = scene.readout;
    root.querySelector("#story-next").textContent = scene.action;
    root.querySelectorAll("[data-scene-target]").forEach((button, i) => {
      button.setAttribute("aria-pressed", String(i === index));
      button.classList.toggle("current", i === index);
    });
    root.querySelector("#story-position").textContent = `0${index + 1} / 06`;
  };
  const update = () => {
    frame = 0;
    const rect = root.getBoundingClientRect(),
      span = root.offsetHeight - innerHeight;
    document.body.dataset.storyScene =
      rect.bottom <= 0 || rect.top >= innerHeight
        ? "product"
        : storyScenes[index].id;
    if (reduced() || manual) return;
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, span)));
    show(sceneAt(progress));
    root.style.setProperty("--story-progress", String(progress));
    root.style.setProperty("--scroll-rotation", `${progress * 12}deg`);
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const navigate = (next) => {
    if (next >= storyScenes.length) {
      document
        .querySelector("#workbench")
        .scrollIntoView({ behavior: reduced() ? "instant" : "smooth" });
      return;
    }
    show(next);
    if (!reduced()) {
      manual = false;
      // Exact segment start keeps the chosen scene stable at the threshold.
      const top = scrollY + root.getBoundingClientRect().top;
      window.scrollTo({
        top:
          top +
          ((root.offsetHeight - innerHeight) * (next + 0.18)) /
            storyScenes.length,
        behavior: "instant",
      });
    }
  };
  root
    .querySelectorAll("[data-scene-target]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        navigate(+button.dataset.sceneTarget),
      ),
    );
  root
    .querySelector("#story-next")
    .addEventListener("click", () => navigate(index + 1));
  const object = root.querySelector(".circuit-assembly");
  root.querySelector(".object-stage").addEventListener("pointermove", (e) => {
    if (reduced() || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    object.style.setProperty(
      "--pointer-x",
      `${((e.clientX - rect.left) / rect.width - 0.5) * 8}deg`,
    );
    object.style.setProperty(
      "--pointer-y",
      `${((e.clientY - rect.top) / rect.height - 0.5) * 6}deg`,
    );
  });
  root.querySelector(".object-stage").addEventListener("pointerleave", () => {
    object.style.setProperty("--pointer-x", "0deg");
    object.style.setProperty("--pointer-y", "0deg");
  });
  const refreshMotion = () => {
    root.classList.toggle("static-story", reduced());
    manual = reduced();
    queue();
  };
  new MutationObserver(refreshMotion).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  mql.addEventListener("change", refreshMotion);
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue, { passive: true });
  show(0);
  refreshMotion();
  queue();
  // Architecture reveals by visibility; no autoplay timer or artificial delay.
  const stages = document.querySelectorAll(".architecture-flow > div");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          e.target.classList.toggle("in-view", e.isIntersecting),
        ),
      { threshold: 0.2 },
    );
    stages.forEach((stage) => observer.observe(stage));
  } else stages.forEach((stage) => stage.classList.add("in-view"));
}
