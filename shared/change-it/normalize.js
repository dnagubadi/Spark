// Change It: turn whatever came back (from the AI, from a remix, from an old save)
// into a safe, complete Change It Spark body. Anything off-menu is replaced with a
// menu item, every string is trimmed to a sensible length, and missing fields get
// defaults. Run this on every Spark before playing it.

import {
  BASES, PARTS, MAX_PARTS, STANDS, KNOB_IDS, BUTTON_IDS, PATTERNS, STICKERS,
  JOYSTICK_MOVES, REVEALS, STAGES,
} from "./menu.js";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function text(value, fallback, max = 80) {
  const s = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return (s || fallback).slice(0, max);
}

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function hex(value, fallback) {
  return typeof value === "string" && HEX.test(value) ? value.toUpperCase() : fallback;
}

function num(value, fallback, lo, hi) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(hi, Math.max(lo, n)));
}

const DEFAULT_KNOBS = [
  { label: "Height", does: "stretch-tall", low: "Short", high: "Tall" },
  { label: "Width", does: "stretch-wide", low: "Thin", high: "Wide" },
  { label: "Curve", does: "bend-sides", low: "Straight", high: "Round" },
];

const DEFAULT_BUTTONS = [
  { label: "Blue", does: "color", value: "#2F6FED" },
  { label: "Orange", does: "color", value: "#FF7A1A" },
  { label: "Cream", does: "color", value: "#FFF6EA" },
  { label: "Speckles", does: "pattern", value: "speckles" },
];

function normalizeKnobs(raw) {
  const list = Array.isArray(raw) ? raw.slice(0, 3) : [];
  const used = new Set();
  return DEFAULT_KNOBS.map((fallback, i) => {
    const k = list[i] || {};
    let does = pick(k.does, KNOB_IDS, fallback.does);
    // Three knobs, three different moves.
    if (used.has(does)) does = KNOB_IDS.find((m) => !used.has(m));
    used.add(does);
    const label = text(k.label, fallback.label, 18);
    return {
      label,
      does,
      low: text(k.low, fallback.low, 14),
      high: text(k.high, fallback.high, 14),
      start: num(k.start, 50, 0, 100),
      up: text(k.up, `Your ${label.toLowerCase()} went up.`, 140),
      down: text(k.down, `Your ${label.toLowerCase()} went down.`, 140),
    };
  });
}

function buttonValue(does, value, fallback) {
  if (does === "color") return hex(value, fallback.does === "color" ? fallback.value : "#2F6FED");
  if (does === "pattern") return pick(value, PATTERNS, "speckles");
  return pick(value, STICKERS, "star");
}

function normalizeButtons(raw) {
  const list = Array.isArray(raw) ? raw.slice(0, 4) : [];
  return DEFAULT_BUTTONS.map((fallback, i) => {
    const b = list[i] || fallback;
    const does = pick(b.does, BUTTON_IDS, fallback.does);
    return {
      label: text(b.label, fallback.label, 16),
      does,
      value: buttonValue(does, b.value, fallback),
    };
  });
}

// Takes { title, content, controls } in any state and returns a clean copy.
export function normalizeChangeIt(raw = {}) {
  const c = raw.content || {};
  const ctl = raw.controls || {};
  const shape = c.shape || {};
  const parts = Array.isArray(shape.parts)
    ? [...new Set(shape.parts.filter((p) => p in PARTS))].slice(0, MAX_PARTS)
    : [];
  const thing = text(c.thing, "thing", 20).toLowerCase();

  return {
    title: text(raw.title, "My Spark", 32),
    content: {
      thing,
      tryThis: text(c.tryThis, "Turn Knob 1 all the way up.", 70),
      stage: pick(c.stage, Object.keys(STAGES), "peach"),
      shape: {
        base: pick(shape.base, Object.keys(BASES), "vase"),
        parts,
        stand: pick(shape.stand, Object.keys(STANDS), "plate"),
        color: hex(shape.color, "#2F6FED"),
        accent: hex(shape.accent, "#1B2A4A"),
      },
      panelTitle: text(c.panelTitle, "COLORS", 18).toUpperCase(),
      reveal: {
        title: text(c.reveal?.title, "THE BIG REVEAL", 22).toUpperCase(),
        text: text(c.reveal?.text, "When it looks right, press Ignite.", 160),
        after: text(c.reveal?.after, "Ta-da! It's finished.", 160),
      },
      fact: text(c.fact, "", 180),
    },
    controls: {
      joystick: {
        label: text(ctl.joystick?.label, "Spin it", 22),
        does: pick(ctl.joystick?.does, Object.keys(JOYSTICK_MOVES), "spin"),
      },
      knobs: normalizeKnobs(ctl.knobs),
      buttons: normalizeButtons(ctl.buttons),
      ignite: {
        label: text(ctl.ignite?.label, "Reveal it", 14),
        does: pick(ctl.ignite?.does, Object.keys(REVEALS), "sparkle"),
      },
    },
  };
}
