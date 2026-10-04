// DOM simulation, NOT a browser/rendering test. Uses real local HTTP endpoints.
// Image decoding, canvas paint, layout, and media queries are explicitly stubbed.
// Install Happy DOM outside the repo, then set CIRCUITLENS_DOM_MODULE to its lib/index.js.
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { createServer } from "../../server.js";
const { Window } = await import(
  pathToFileURL(process.env.CIRCUITLENS_DOM_MODULE).href
);
const mode = process.argv[2] || "workbench";
const width = Number(process.argv[3] || 1440);
const server = createServer({ liveVisionEnabled: false, apiKey: "" });
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const win = new Window({
  url: base + (mode === "home" ? "/" : "/workbench.html"),
  settings: {
    disableJavaScriptFileLoading: true,
    disableJavaScriptEvaluation: true,
    disableCSSFileLoading: true,
  },
});
win.document.write(
  await readFile(
    new URL(
      mode === "home"
        ? "../../public/index.html"
        : "../../public/workbench.html",
      import.meta.url,
    ),
    "utf8",
  ),
);
for (const name of [
  "window",
  "document",
  "location",
  "MutationObserver",
  "HTMLElement",
  "HTMLInputElement",
  "Element",
])
  globalThis[name] = name === "window" ? win : win[name];
globalThis.matchMedia = win.matchMedia = (query) => ({
  matches:
    /max-width: ?(\d+)/.test(query) &&
    width <= Number(query.match(/max-width: ?(\d+)/)[1]),
  addEventListener() {},
  removeEventListener() {},
});
globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = clearTimeout;
win.Element.prototype.scrollIntoView = function () {};
const context = new Proxy(
  {},
  {
    get: (_, key) =>
      key === "getImageData"
        ? () => ({ data: new Uint8ClampedArray(4) })
        : () => {},
  },
);
win.HTMLCanvasElement.prototype.getContext = () => context;
globalThis.Image = class {
  naturalWidth = 700;
  naturalHeight = 440;
  set src(value) {
    this.source = value;
    queueMicrotask(() => this.onload?.());
  }
};
for (const dialog of win.document.querySelectorAll("dialog")) {
  dialog.showModal = () => {
    dialog.open = true;
  };
  dialog.close = () => {
    dialog.open = false;
  };
}
const fetchOriginal = globalThis.fetch;
globalThis.fetch = (input, options) =>
  fetchOriginal(new URL(input, base), options);
const $ = (id) => win.document.getElementById(id);
const wait = async (predicate) => {
  for (let n = 0; n < 200; n++) {
    if (predicate()) return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw Error("DOM condition timed out");
};
const click = (id) => $(id).click();
const change = (el) =>
  el.dispatchEvent(new win.Event("change", { bubbles: true }));
const checks = [];
try {
  if (mode === "home") {
    await import("../../public/lens-demo.js");
    assert.equal($("linked-demo").dataset.status, "review");
    assert.equal($("demo-physical").querySelectorAll(".model-part").length, 4);
    assert.equal(
      $("demo-schematic").querySelectorAll(".schematic-part").length,
      4,
    );
    $("demo-schematic")
      .querySelector('[data-component="1"]')
      .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
    assert.equal(
      $("demo-physical").querySelector(".selected").dataset.component,
      "1",
    );
    checks.push("linked selection");
    click("demo-correct");
    await wait(() => $("linked-demo").dataset.status === "pass");
    assert.match($("demo-state").textContent, /checks passed/);
    checks.push("actual polarity correction passes");
    click("demo-correct");
    await wait(() => $("linked-demo").dataset.status === "review");
    checks.push("restore fault");
  } else {
    await import("../../public/app.js");
    await wait(() => document.body.dataset.analysisStatus === "review");
    const statuses = {
      healthy: "pass",
      reversed: "review",
      disconnected: "review",
      "no-resistor": "critical",
      short: "critical",
      divider: "pass",
      button: "pass",
    };
    for (const [id, status] of Object.entries(statuses)) {
      $("example-list").querySelector(`[data-id="${id}"]`).click();
      await wait(
        () =>
          $("analysis-pipeline").dataset.phase === "ready" &&
          !$("findings-jump").hidden,
      );
      assert.equal(document.body.dataset.analysisStatus, status, id);
      assert.equal(
        Number($("stat-parts").textContent),
        $("components").children.length,
      );
      assert.equal(
        $("live-graph").querySelectorAll(".schematic-part").length,
        $("components").children.length,
      );
      assert.match(
        $("workspace-title").textContent,
        new RegExp(
          $("example-list")
            .querySelector(`[data-id="${id}"]`)
            .getAttribute("aria-label"),
        ),
      );
      checks.push(`${id}: ${status}`);
    }
    const search = $("example-search");
    search.value = "divider";
    search.dispatchEvent(new win.Event("input"));
    assert.equal(
      [...document.querySelectorAll(".example-card")].filter((e) => !e.hidden)
        .length,
      1,
    );
    search.value = "no match xyz";
    search.dispatchEvent(new win.Event("input"));
    assert.equal($("no-examples").hidden, false);
    search.value = "";
    search.dispatchEvent(new win.Event("input"));
    checks.push("library search and no-results");
    $("example-list").querySelector('[data-id="reversed"]').click();
    await wait(() => $("analysis-pipeline").dataset.phase === "ready");
    if (width > 1000) {
      click("view-split");
      assert.equal(document.body.dataset.circuitView, "split");
      assert.equal(document.querySelector(".assembly-view").hidden, false);
      assert.equal(document.querySelector(".schematic-view").hidden, false);
      $("component-picker").querySelector('[data-picker="2"]').click();
      assert.equal(
        $("live-graph").querySelectorAll('[data-component="2"].selected')
          .length,
        4,
      );
      checks.push("linked views and component identity");
    } else {
      click("view-schematic");
      $("live-graph")
        .querySelector('.schematic-part[data-component="2"]')
        .dispatchEvent(
          new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      assert.equal(
        $("component-inspector").querySelector("h3").textContent,
        "D1",
      );
      assert.equal(
        $("component-picker")
          .querySelector('[data-picker="2"]')
          .getAttribute("aria-pressed"),
        "true",
      );
      checks.push("schematic keyboard selection and component identity");
    }
    click("swap-polarity");
    assert.equal($("results").hidden, true);
    assert.equal(document.body.dataset.analysisStatus, "unverified");
    assert.equal($("analyze").disabled, true);
    $("confirmed").checked = true;
    change($("confirmed"));
    assert.equal($("analyze").disabled, false);
    click("analyze");
    await wait(() => document.body.dataset.analysisStatus === "pass");
    checks.push("edit invalidates and reconfirmed correction passes");
    click("zoom-in");
    assert.equal($("zoom-status").textContent, "125%");
    $("live-graph").dispatchEvent(
      new win.KeyboardEvent("keydown", { key: "0", bubbles: true }),
    );
    assert.equal($("zoom-status").textContent, "Fit");
    checks.push("zoom and keyboard fit");
    click("findings-jump");
    assert.equal($("report-dialog").open, true);
    click("open-connections");
    assert.equal($("connections-dialog").open, true);
    assert.equal($("report-dialog").open, false);
    checks.push("report/settings dialogs");
    $("connections-dialog").close();
    click("view-source");
    assert.equal(document.querySelector(".visual-panel").hidden, false);
    assert.equal($("vision-run").disabled, true);
    checks.push("manual source review; recognition disabled");
    await $("netlist").onchange({
      target: { files: [{ size: 2, text: async () => "{bad" }], value: "bad" },
    });
    assert.match($("error").textContent, /Import failed/);
    assert.equal($("error").hidden, false);
    checks.push("invalid import error");
    await $("netlist").onchange({
      target: {
        files: [
          {
            size: 80,
            text: async () =>
              JSON.stringify({
                voltage: 3.3,
                components: [{ id: "W9", type: "wire", a: "A1", b: "A2" }],
              }),
          },
        ],
        value: "valid",
      },
    });
    assert.equal($("components").children.length, 1);
    assert.equal($("stat-voltage").textContent, "3.3 V");
    assert.equal(document.body.dataset.analysisStatus, "unverified");
    checks.push("valid import invalidates diagnosis");
    click("nav-export");
    assert.equal($("export-dialog").open, true);
    assert.equal(JSON.parse($("export-data").value).components[0].id, "W9");
    $("export-dialog").close();
    checks.push("netlist export JSON");
    click("reset");
    assert.equal(document.body.dataset.analysisStatus, "empty");
    assert.equal($("stat-parts").textContent, "0");
    assert.equal($("analyze").disabled, true);
    assert.equal(document.querySelector(".visual-panel").hidden, false);
    checks.push("new circuit empty state");
    click("open-connections");
    click("add");
    assert.equal($("components").children.length, 1);
    assert.equal(document.body.dataset.analysisStatus, "unverified");
    checks.push("manual component creation");
    click("reduce-motion");
    assert.equal(document.body.classList.contains("reduced-motion"), true);
    assert.equal(document.body.dataset.circuitView, "schematic");
    checks.push("reduced-motion control");
    if (width <= 700) {
      click("mobile-inspect");
      assert.equal(document.body.classList.contains("inspector-open"), true);
      click("close-inspector");
      assert.equal(document.body.classList.contains("inspector-open"), false);
      checks.push("mobile inspector open/close");
    }
  }
  console.log(
    JSON.stringify(
      { mode, simulatedWidth: width, checks, renderingVerified: false },
      null,
      2,
    ),
  );
} finally {
  await win.happyDOM.abort();
  await new Promise((r) => server.close(r));
}
