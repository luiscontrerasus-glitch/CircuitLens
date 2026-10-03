const $ = (id) => document.getElementById(id);
export function openPanel(id) {
  const panel = $(id);
  if (!panel) return;
  document.querySelectorAll("dialog[open]").forEach((other) => {
    if (other !== panel) other.close();
  });
  if (!panel.open) panel.showModal();
}
if (typeof document !== "undefined" && $("workbench")) {
  const library = $("example-library");
  const compact = matchMedia("(max-width: 1000px)");
  const setLibrary = (open) => {
    library.hidden = !open;
    document.body.classList.toggle("library-collapsed", !open);
    $("toggle-library").setAttribute("aria-expanded", String(open));
  };
  setLibrary(!compact.matches);
  compact.addEventListener("change", () => setLibrary(!compact.matches));
  $("toggle-library").onclick = () => setLibrary(library.hidden);
  $("close-library").onclick = () => {
    setLibrary(false);
    $("toggle-library").focus();
  };
  library.addEventListener("click", (event) => {
    if (event.target.closest("[data-id]") && compact.matches) setLibrary(false);
  });
  $("open-connections").onclick = () => openPanel("connections-dialog");
  $("open-help").onclick = () => openPanel("help-dialog");
  $("open-review").onclick = () => openPanel("review-dialog");
  $("nav-export").onclick = () => $("export").click();
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.onclick = () => button.closest("dialog").close();
  });
  document.querySelectorAll("dialog").forEach((panel) => {
    panel.addEventListener("click", (event) => {
      if (event.target !== panel) return;
      const rect = panel.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        panel.close();
    });
  });
  new MutationObserver(() => {
    $("open-review").hidden = $("detection-review").hidden;
    if (!$("detection-review").hidden) openPanel("review-dialog");
  }).observe($("detection-review"), {
    attributes: true,
    attributeFilter: ["hidden"],
  });
  new MutationObserver(() => {
    $("circuit-name").textContent = $("image-title").textContent;
  }).observe($("image-title"), {
    childList: true,
    subtree: true,
    characterData: true,
  });
  new MutationObserver(() => {
    $("nav-provenance").textContent =
      $("source-badge").textContent === "GENERATED EXAMPLE"
        ? "Generated fixture"
        : $("source-badge").textContent === "NO IMAGE"
          ? "No source image"
          : "Photo · review required";
  }).observe($("source-badge"), {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
