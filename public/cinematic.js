export const storyScenes = [
  {
    id: "physical",
    label: "The circuit",
    heading: "See what’s<br><em>wrong.</em>",
    copy: "Turn a circuit photo into connections you can review. Find the fault. Understand the repair.",
    note: "01 / PHYSICAL CIRCUIT",
    readout: "A circuit waiting to be understood.",
    action: "Explore the signal ↓",
  },
  {
    id: "perception",
    label: "Observe",
    heading: "First,<br>look closer.",
    copy: "Look closer. Keep uncertainty visible.",
    note: "02 / VISUAL PERCEPTION",
    readout: "Illustrative candidates / human review required.",
    action: "Continue to the model ↓",
  },
  {
    id: "model",
    label: "Structure",
    heading: "From wires<br>to <em>reasoning.</em>",
    copy: "The same circuit. An explicit model.",
    note: "03 / STRUCTURED MODEL",
    readout: "Reviewed terminals → inspectable netlist.",
    action: "Trace the failure ↓",
  },
  {
    id: "signal",
    label: "Signal",
    heading: "Follow<br>the <em>signal.</em>",
    copy: "One path. Every connection counts.",
    note: "04 / TRACE THE PATH",
    readout: "Illustrative directional flow / not an analog simulation.",
    action: "Find the interruption ↓",
  },
  {
    id: "diagnosis",
    label: "Diagnose",
    heading: "The signal<br><em>stops here.</em>",
    copy: "D1 / reverse bias. The path is interrupted.",
    note: "05 / DETERMINISTIC DIAGNOSIS",
    readout: "D1 / reversed polarity / disconnect power before correcting.",
    action: "See the correction ↓",
  },
  {
    id: "fix",
    label: "Correct",
    heading: "One correction.<br><em>A clear path.</em>",
    copy: "Power off. Swap A / K. Check again.",
    note: "06 / CORRECTED MODEL",
    readout: "Illustrative corrected netlist / supported checks pass.",
    action: "Enter the workbench ↓",
  },
  {
    id: "product",
    label: "Try it",
    heading: "Now, it’s<br><em>your circuit.</em>",
    copy: "Observe. Edit. Trace. Understand.",
    note: "07 / REAL PRODUCT",
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
export function cameraAt(progress) {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const keys = [
    [48, -8, -18, 0],
    [32, 5, -12, 0],
    [22, -6, 0, 90],
    [30, 4, 8, 22],
    [22, -4, -6, 45],
    [38, 6, -12, 14],
    [42, 0, -10, 0],
  ];
  const step = p * 6,
    i = Math.min(5, Math.floor(step));
  const t = step - i,
    smooth = t * t * (3 - 2 * t);
  return keys[i].map((value, j) => value + (keys[i + 1][j] - value) * smooth);
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
    root.querySelector(".fault-evidence").hidden = scene.id !== "diagnosis";
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
    root.querySelector("#story-position").textContent = `0${index + 1} / 07`;
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
    const [x, y, z, lift] = cameraAt(progress);
    root.style.setProperty("--camera-x", `${x}deg`);
    root.style.setProperty("--camera-y", `${y}deg`);
    root.style.setProperty("--camera-z", `${z}deg`);
    root.style.setProperty("--component-lift", `${lift}px`);
    root.style.setProperty("--story-progress", String(progress));
    root.style.setProperty("--scroll-rotation", `${progress * 12}deg`);
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const navigate = (next) => {
    if (next >= storyScenes.length) {
      document.dispatchEvent(new Event("cinematic-enter"));
      document
        .querySelector("#workbench")
        .scrollIntoView({ behavior: reduced() ? "instant" : "smooth" });
      return;
    }
    show(next);
    if (reduced()) {
      window.scrollTo({
        top: scrollY + root.getBoundingClientRect().top,
        behavior: "instant",
      });
    }
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
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) =>
      root.classList.toggle("offscreen", !entries[0].isIntersecting),
    ).observe(root);
  }
  // Architecture reveals by visibility; no autoplay timer or artificial delay.
  const stages = document.querySelectorAll(".architecture-flow > div");
  const process = document.querySelector(".process-instrument");
  stages.forEach((stage, i) => {
    stage.tabIndex = 0;
    const activate = () => {
      process.style.setProperty("--process-step", i);
      document.querySelector("#architecture-state").textContent =
        `${stage.querySelector("span").textContent} / ${stage.querySelector("h3").textContent} → ${stage.querySelector("p").textContent}`;
      stages.forEach((s, j) => s.classList.toggle("process-active", i === j));
    };
    stage.addEventListener("pointerenter", activate);
    stage.addEventListener("focus", activate);
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          e.target.classList.toggle("in-view", e.isIntersecting),
        ),
      { threshold: 0.2 },
    );
    stages.forEach((stage, i) => {
      stage.style.setProperty("--stage-index", i);
      observer.observe(stage);
    });
  } else stages.forEach((stage) => stage.classList.add("in-view"));
}
