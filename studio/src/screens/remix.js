// 4 · REMIX: make it yours. Rename things and pick from the behavior menus.
// Every "What it does" list only holds moves Spark already knows, so a remix
// can't break the Spark. (Blockly blocks come later, built on the same menus.)

import { h, toast } from "../lib/dom.js";
import { go } from "../lib/router.js";
import { session } from "../lib/session.js";
import { normalizeSpark } from "../../../shared/spark-format.js";
import {
  BASES, PARTS, MAX_PARTS, STANDS, KNOB_MOVES, BUTTON_MOVES, PATTERNS, STICKERS, JOYSTICK_MOVES, REVEALS, STAGES,
} from "../../../shared/change-it/menu.js";
import { resolveSpark, saveAndShow } from "./play.js";
import { createScene } from "../journeys/change-it/scene.js";
import { biggerTextButton } from "../ui/header.js";
import { logo } from "../ui/icons.js";

const say = (key) => key.replace(/-/g, " ");
const get = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj);
function set(obj, path, value) {
  const last = path[path.length - 1];
  get(obj, path.slice(0, -1))[last] = value;
}

export function remixScreen({ id }) {
  const original = resolveSpark(id);
  if (!original) return go("/ask");
  if (original.journey !== "change-it") return go(`/play/${id}`);

  let spark = structuredClone(original);
  // Undo history lives in the session so it survives the redraw after an undo.
  session.remixHistory ||= [];
  const history = session.remixHistory;
  const draft = spark.draft;
  const fields = []; // { el, path } to refresh AI/changed marks

  function mark() {
    for (const f of fields) {
      const changed = JSON.stringify(get(spark, f.path)) !== JSON.stringify(get(draft, f.path));
      f.el.classList.toggle("is-ai", !changed);
      f.el.classList.toggle("is-changed", changed);
    }
  }

  function change(path, value) {
    history.push(structuredClone(spark));
    if (history.length > 40) history.shift();
    set(spark, path, value);
    spark = normalizeSpark(spark);
    mark();
  }

  function textField(path, label, max = 18) {
    const el = h("input", { class: "input", type: "text", value: get(spark, path), maxlength: String(max), "aria-label": label });
    el.addEventListener("change", () => change(path, el.value));
    fields.push({ el, path });
    return el;
  }

  function selectField(path, options, label, onPicked) {
    const el = h("select", { class: "select", "aria-label": label },
      options.map((o) => h("option", { value: o, selected: get(spark, path) === o }, say(o))),
    );
    el.addEventListener("change", () => { change(path, el.value); onPicked?.(el.value); });
    fields.push({ el, path });
    return el;
  }

  function colorField(path, label) {
    const el = h("input", { class: "input", type: "color", value: get(spark, path), "aria-label": label, style: { padding: "0.25rem", width: "4.5rem" } });
    el.addEventListener("change", () => change(path, el.value.toUpperCase()));
    fields.push({ el, path });
    return el;
  }

  function buttonValueField(i) {
    const path = ["controls", "buttons", i, "value"];
    const does = spark.controls.buttons[i].does;
    const label = `Button ${i + 1} choice`;
    if (does === "color") return colorField(path, label);
    return selectField(path, does === "pattern" ? PATTERNS : STICKERS, label);
  }

  const row = (name, ...cells) => h("tr", {}, h("td", {}, name), cells.map((c) => h("td", {}, c)));
  const c = spark.controls;

  const valueCells = c.buttons.map((_, i) => h("div", {}, buttonValueField(i)));
  const controlsTable = h("table", { class: "remix-table" },
    h("thead", {}, h("tr", {}, h("th", {}, "Control"), h("th", {}, "Its name"), h("th", {}, "What it does"), h("th", {}, ""))),
    h("tbody", {},
      row("Joystick", textField(["controls", "joystick", "label"], "Joystick name", 22), selectField(["controls", "joystick", "does"], Object.keys(JOYSTICK_MOVES), "Joystick does"), ""),
      c.knobs.map((_, i) => row(`Knob ${i + 1}`,
        textField(["controls", "knobs", i, "label"], `Knob ${i + 1} name`),
        selectField(["controls", "knobs", i, "does"], Object.keys(KNOB_MOVES), `Knob ${i + 1} does`),
        "",
      )),
      c.buttons.map((_, i) => row(`Button ${i + 1}`,
        textField(["controls", "buttons", i, "label"], `Button ${i + 1} name`, 16),
        selectField(["controls", "buttons", i, "does"], Object.keys(BUTTON_MOVES), `Button ${i + 1} does`, () => {
          // A new kind of button needs a matching choice (a color, pattern or sticker).
          const fresh = buttonValueField(i);
          valueCells[i].replaceChildren(fresh);
          mark();
        }),
        valueCells[i],
      )),
      row("Ignite", textField(["controls", "ignite", "label"], "Ignite name", 14), selectField(["controls", "ignite", "does"], Object.keys(REVEALS), "Ignite does"), ""),
    ),
  );

  const partBoxes = Object.keys(PARTS).map((part) => {
    const box = h("input", { type: "checkbox", id: `part-${part}`, checked: spark.content.shape.parts.includes(part) });
    box.addEventListener("change", () => {
      let parts = spark.content.shape.parts.filter((p) => p !== part);
      if (box.checked) {
        if (parts.length >= MAX_PARTS) { box.checked = false; toast(`Up to ${MAX_PARTS} parts. Untick one first.`); return; }
        parts = [...parts, part];
      }
      change(["content", "shape", "parts"], parts);
    });
    return h("label", { for: `part-${part}`, style: { display: "inline-flex", alignItems: "center", gap: "0.375rem", minHeight: "3rem", padding: "0 0.75rem", borderRadius: "0.75rem", border: "2px solid #F0DCCB", background: "#FFFFFF", fontSize: "1.0625rem", fontWeight: "700" } }, box, say(part));
  });
  const partsWrap = h("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.5rem", borderRadius: "0.75rem" } }, partBoxes);
  fields.push({ el: partsWrap, path: ["content", "shape", "parts"] });

  const lookPanel = h("section", { class: "panel" },
    h("h2", { class: "eyebrow" }, "Its look"),
    h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", gap: "0.75rem" } },
      h("div", { class: "field" }, h("span", { class: "label" }, "Shape"), selectField(["content", "shape", "base"], Object.keys(BASES), "Shape")),
      h("div", { class: "field" }, h("span", { class: "label" }, "Sits on"), selectField(["content", "shape", "stand"], Object.keys(STANDS), "Sits on")),
      h("div", { class: "field" }, h("span", { class: "label" }, "Background"), selectField(["content", "stage"], Object.keys(STAGES), "Background")),
      h("div", { class: "field" }, h("span", { class: "label" }, "Starting color"), colorField(["content", "shape", "color"], "Starting color")),
    ),
    h("span", { class: "label", style: { fontWeight: "700" } }, `Parts (up to ${MAX_PARTS})`),
    partsWrap,
  );

  const nameField = textField(["title"], "Name", 32);
  nameField.id = "remix-name";
  nameField.dataset.autofocus = "";

  // Live preview of the recipe.
  const previewBox = h("div", { class: "stage-canvas", role: "img", "aria-label": "Preview of your Spark" });
  const preview = h("div", { class: "stage" }, previewBox);
  const previewState = () => {
    const moves = {};
    spark.controls.knobs.forEach((k) => (moves[k.does] = k.start / 100));
    return {
      base: spark.content.shape.base, parts: spark.content.shape.parts, stand: spark.content.shape.stand,
      stageColor: STAGES[spark.content.stage], color: spark.content.shape.color, accent: spark.content.shape.accent,
      moves, pattern: null, stickers: [], spin: performance.now() / 1500, tilt: 0, reveal: null, revealDone: null,
    };
  };

  const finish = (save) => {
    spark = normalizeSpark({ ...spark, title: nameField.value || spark.title });
    session.working = spark;
    if (save) saveAndShow(spark);
    else go("/play/working");
  };

  const undo = h("button", {
    class: "btn", type: "button",
    onclick: () => {
      if (!history.length) return toast("Nothing to undo yet.");
      spark = history.pop();
      session.working = spark;
      go(`/remix/working`); // redraw the form from the restored copy
    },
  }, "Undo");

  const el = h("div", { class: "screen" },
    h("header", { class: "bar" },
      h("div", { style: { display: "flex", alignItems: "center", gap: "1rem" } },
        h("a", { href: "#/ask", "aria-label": "Spark Studio home", html: logo() }),
        h("h1", { class: "bar-title" }, "Make it yours"),
      ),
      h("nav", { "aria-label": "Remix" },
        undo,
        h("button", { class: "btn", type: "button", onclick: () => finish(false) }, "Play it"),
        h("button", { class: "btn btn-primary", type: "button", onclick: () => finish(true) }, "Save to today's gallery"),
        biggerTextButton(),
      ),
    ),
    h("main", { id: "main", class: "remix" },
      h("div", { class: "remix-preview", style: { display: "flex", flexDirection: "column", gap: "1rem" } },
        h("div", { class: "legend" },
          h("span", {}, h("i", { style: { background: "#D6EBFF" } }), "AI drafted this"),
          h("span", {}, h("i", { style: { background: "#FFD9C2" } }), "You changed this"),
        ),
        preview,
        h("div", { class: "field" }, h("label", { for: "remix-name" }, "Name"), nameField),
      ),
      h("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" } },
        h("section", { class: "panel" }, h("h2", { class: "eyebrow" }, "Controls"), h("div", { style: { overflowX: "auto" } }, controlsTable)),
        lookPanel,
        h("p", { class: "muted", style: { fontSize: "1.0625rem" } }, "Every \"What it does\" list only holds moves Spark already knows, so a remix can't break the Spark."),
      ),
    ),
  );

  // Keep edits if the kid leaves and comes back.
  session.working = spark;
  const keep = setInterval(() => (session.working = spark), 500);
  mark();
  let scene = null;
  requestAnimationFrame(() => (scene = createScene(previewBox, previewState)));
  return { el, cleanup: () => { clearInterval(keep); scene?.remove(); } };
}
