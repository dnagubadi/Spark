// Change It: the play screen. Shape one thing with 3 knobs, style it with 4
// buttons, move it with the joystick, then press Ignite for the big reveal.
// Pattern every Spark follows: try something, see what changes, build on it.

import { h } from "../../lib/dom.js";
import { controlStrip } from "../../ui/controls.js";
import { createScene } from "./scene.js";
import { STAGES } from "../../../../shared/change-it/menu.js";

const word = (k, v) => (v < 34 ? k.low : v > 66 ? k.high : "In between");

function swatchStyle(b) {
  if (b.does === "color") return { background: b.value };
  if (b.does === "pattern") {
    const bg = { speckles: "radial-gradient(#1B2A4A 3px, transparent 3px) 0 0/14px 14px, #FFF6EA", stripes: "repeating-linear-gradient(0deg, #1B2A4A 0 6px, #FFF6EA 6px 16px)", zigzag: "linear-gradient(135deg, #FFF6EA 25%, transparent 25%) -8px 0/16px 16px, linear-gradient(225deg, #FFF6EA 25%, transparent 25%) -8px 0/16px 16px, linear-gradient(315deg, #FFF6EA 25%, transparent 25%) 0 0/16px 16px, linear-gradient(45deg, #FFF6EA 25%, #1B2A4A 25%) 0 0/16px 16px", dots: "radial-gradient(#FF7A1A 4px, transparent 4px) 0 0/16px 16px, #D6EBFF" };
    return { background: bg[b.value] || bg.speckles };
  }
  return { background: "#FFF0B3" };
}

const STICKER_GLYPH = { star: "★", heart: "♥", spark: "✦", flower: "✿", bolt: "⚡" };

export function changeItBoard(spark, { header }) {
  const { content, controls } = spark;
  const startColor = content.shape.color;

  // ----- live play state (not saved; a Spark always starts from its recipe) -----
  const state = {
    values: controls.knobs.map((k) => k.start),
    color: startColor,
    pattern: null,
    stickers: [],
    spin: 0,
    spinVel: 0,
    tilt: 0,
    tiltTarget: 0,
    reveal: null,
    revealDone: null,
    before: false,
  };

  const sceneState = () => {
    const values = state.before ? controls.knobs.map((k) => k.start) : state.values;
    const moves = {};
    controls.knobs.forEach((k, i) => (moves[k.does] = values[i] / 100));
    return {
      base: content.shape.base,
      parts: content.shape.parts,
      stand: content.shape.stand,
      stageColor: STAGES[content.stage],
      color: state.before ? startColor : state.color,
      accent: content.shape.accent,
      moves,
      pattern: state.before ? null : state.pattern,
      stickers: state.before ? [] : state.stickers,
      spin: state.spin,
      tilt: state.tilt,
      reveal: state.before ? null : state.reveal,
      revealDone: state.before ? null : state.revealDone,
    };
  };

  // ----- left: try this + readouts -----
  const meters = controls.knobs.map((k, i) => {
    const value = h("span", {}, word(k, state.values[i]));
    const bar = h("div", { style: { width: `${state.values[i]}%` } });
    const row = h("div", { class: "readout" },
      h("div", { class: "readout-top" }, h("b", {}, k.label), value),
      h("div", { class: "meter", "aria-hidden": "true" }, bar),
    );
    return { row, value, bar };
  });
  const left = h("aside", { class: "side", "aria-label": "Shape" },
    h("section", { class: "panel" }, h("h2", { class: "eyebrow eyebrow-warm" }, "Try this"), h("p", { class: "try-this" }, content.tryThis)),
    h("section", { class: "panel", style: { flex: "1" } },
      h("h2", { class: "eyebrow" }, `Your ${content.thing}`),
      meters.map((m) => m.row),
    ),
  );

  // ----- middle: the stage -----
  const caption = h("p", { class: "caption", "aria-live": "polite" });
  const setWhatChanged = (sentence) => {
    caption.replaceChildren(h("b", {}, "What changed: "), sentence);
  };
  if (content.fact) caption.replaceChildren(h("b", {}, "Did you know? "), content.fact);
  else caption.replaceChildren(h("b", {}, "Try this: "), content.tryThis);

  const beforeBtn = h("button", { type: "button", "aria-pressed": "false", onclick: () => setCompare(true) }, "Before");
  const nowBtn = h("button", { type: "button", "aria-pressed": "true", onclick: () => setCompare(false) }, "Now");
  function setCompare(before) {
    state.before = before;
    beforeBtn.setAttribute("aria-pressed", String(before));
    nowBtn.setAttribute("aria-pressed", String(!before));
  }
  const canvasBox = h("div", { class: "stage-canvas", role: "img", "aria-label": `Your ${content.thing}` });
  const stage = h("div", { class: "stage", style: { background: STAGES[content.stage] } },
    canvasBox,
    h("div", { class: "compare", role: "group", "aria-label": "Compare" }, beforeBtn, nowBtn),
    caption,
  );

  // ----- right: button choices + the reveal -----
  const swatches = controls.buttons.map((b, i) =>
    h("button", { class: "swatch", type: "button", "aria-pressed": "false", onclick: () => press(i) },
      h("span", { class: "swatch-dot", style: swatchStyle(b), "aria-hidden": "true" }, b.does === "sticker" ? STICKER_GLYPH[b.value] : ""),
      b.label,
    ),
  );
  const right = h("aside", { class: "side", "aria-label": content.panelTitle },
    h("section", { class: "panel" }, h("h2", { class: "eyebrow" }, content.panelTitle), h("div", { class: "swatches" }, swatches)),
    h("section", { class: "panel", style: { flex: "1" } },
      h("h2", { class: "eyebrow" }, content.reveal.title),
      h("p", {}, content.reveal.text),
    ),
  );

  // ----- actions -----
  const settle = controls.knobs.map(() => ({ timer: null, from: null }));
  function turn(i, v) {
    if (state.before) setCompare(false);
    const s = settle[i];
    if (s.from === null) s.from = state.values[i];
    state.values[i] = v;
    meters[i].value.textContent = word(controls.knobs[i], v);
    meters[i].bar.style.width = `${v}%`;
    if (state.revealDone) state.revealDone = null; // changed it again, reveal again
    clearTimeout(s.timer);
    s.timer = setTimeout(() => {
      const k = controls.knobs[i];
      if (v !== s.from) setWhatChanged(v > s.from ? k.up : k.down);
      s.from = null;
    }, 280);
  }

  function refreshPressed() {
    controls.buttons.forEach((b, i) => {
      const on = b.does === "color" ? state.color === b.value
        : b.does === "pattern" ? state.pattern === b.value
        : state.stickers.includes(b.value);
      strip.setPressed(i, on);
      swatches[i].setAttribute("aria-pressed", String(on));
    });
  }

  function press(i) {
    if (state.before) setCompare(false);
    const b = controls.buttons[i];
    if (b.does === "color") {
      state.color = state.color === b.value ? startColor : b.value;
    } else if (b.does === "pattern") {
      state.pattern = state.pattern === b.value ? null : b.value;
    } else {
      state.stickers = state.stickers.includes(b.value)
        ? state.stickers.filter((x) => x !== b.value)
        : [...state.stickers, b.value].slice(-3);
    }
    state.revealDone = null;
    refreshPressed();
    setWhatChanged(`you picked ${b.label}.`);
  }

  function ignite() {
    if (state.reveal) return;
    if (state.before) setCompare(false);
    state.reveal = { kind: controls.ignite.does, t: 0 };
    caption.replaceChildren(h("b", {}, `${controls.ignite.label}! `), "Watch closely…");
  }

  const strip = controlStrip({
    controls,
    buttonArt: (b) => (b.does === "color" ? b.value : b.does === "pattern" ? "#FFD9C2" : "#FFD23F"),
    onKnob: turn,
    onButton: press,
    onIgnite: ignite,
    onStick: (x) => {
      if (controls.joystick.does === "spin") state.spinVel = x * 0.12;
      else state.tiltTarget = x;
    },
  });
  refreshPressed();

  // ----- animation clock for spin, tilt and reveal -----
  let raf;
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.spin += state.spinVel;
    state.spinVel *= 0.93;
    if (content.shape.stand === "wheel") state.spin += 0.004; // the wheel keeps turning
    state.tilt += (state.tiltTarget - state.tilt) * 0.12;
    state.tiltTarget *= 0.9;
    if (state.reveal) {
      state.reveal.t += dt;
      if (state.reveal.t > 2.6) {
        state.revealDone = state.reveal.kind;
        state.reveal = null;
        caption.replaceChildren(h("b", {}, "Ta-da! "), content.reveal.after);
      }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const el = h("div", { class: "screen" },
    header,
    h("main", { id: "main", class: "board" }, left, stage, right),
    strip.el,
  );

  // p5 needs the stage in the page to measure it.
  let scene = null;
  queueMicrotask(() => requestAnimationFrame(() => (scene = createScene(canvasBox, sceneState))));

  return {
    el,
    cleanup() {
      cancelAnimationFrame(raf);
      strip.cleanup();
      scene?.remove();
      settle.forEach((s) => clearTimeout(s.timer));
    },
  };
}
