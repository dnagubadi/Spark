// Spark-Plug input. The controller shows up over USB as a standard gamepad, so the
// browser reads it with the Gamepad API (no driver). The keyboard can stand in for it
// while there's no hardware. Screens subscribe with onPlug(handler).
//
// Events sent to handlers:
//   { type: "knob",   index: 0..2, value: 0..100 }   absolute (gamepad) ...
//   { type: "nudge",  index: 0..2, delta: ±5 }        ...or relative (keyboard)
//   { type: "button", index: 0..3 }
//   { type: "ignite" }
//   { type: "stick",  x: -1..1, y: -1..1 }
//
// Keyboard stand-in (ignored while typing in a text box):
//   Knob 1: Q / W   Knob 2: A / S   Knob 3: Z / X   Buttons: 1 2 3 4
//   Ignite: Enter   Joystick: J / L (left / right)

// Pico firmware mapping. Change these if the CircuitPython code sends a different layout.
export const GAMEPAD_MAP = {
  stickX: 0,
  stickY: 1,
  knobs: [2, 3, 4], // axes, -1..1
  buttons: [0, 1, 2, 3],
  ignite: 4,
};

const handlers = new Set();
export function onPlug(fn) {
  handlers.add(fn);
  return () => handlers.delete(fn);
}
function emit(event) {
  window.dispatchEvent(new Event("spark-activity"));
  for (const fn of handlers) fn(event);
}

function typing(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;
  if (target.tagName === "TEXTAREA" || target.tagName === "SELECT") return true;
  return target.tagName === "INPUT" && !["range", "checkbox", "radio", "button"].includes(target.type);
}

const KEYS = {
  q: ["nudge", 0, -5], w: ["nudge", 0, 5],
  a: ["nudge", 1, -5], s: ["nudge", 1, 5],
  z: ["nudge", 2, -5], x: ["nudge", 2, 5],
  1: ["button", 0], 2: ["button", 1], 3: ["button", 2], 4: ["button", 3],
};

function onKey(e) {
  if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
  const k = e.key.toLowerCase();
  if (k in KEYS) {
    const [type, index, delta] = KEYS[k];
    emit(type === "nudge" ? { type, index, delta } : { type, index });
    e.preventDefault();
  } else if (k === "enter" && !(e.target instanceof HTMLButtonElement) && e.target.tagName !== "A") {
    emit({ type: "ignite" });
    e.preventDefault();
  } else if (k === "j" || k === "l") {
    emit({ type: "stick", x: k === "j" ? -1 : 1, y: 0 });
  }
}

let last = null;
function poll() {
  const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
  if (pad) {
    const prev = last || { axes: [], buttons: [] };
    const now = { axes: pad.axes.slice(), buttons: pad.buttons.map((b) => b.pressed) };
    GAMEPAD_MAP.knobs.forEach((axis, index) => {
      const v = now.axes[axis];
      if (v === undefined) return;
      const value = Math.round(((v + 1) / 2) * 100);
      const before = prev.axes[axis] === undefined ? null : Math.round(((prev.axes[axis] + 1) / 2) * 100);
      if (before === null || Math.abs(value - before) >= 2) emit({ type: "knob", index, value });
    });
    GAMEPAD_MAP.buttons.forEach((b, index) => {
      if (now.buttons[b] && !prev.buttons[b]) emit({ type: "button", index });
    });
    if (now.buttons[GAMEPAD_MAP.ignite] && !prev.buttons[GAMEPAD_MAP.ignite]) emit({ type: "ignite" });
    const x = now.axes[GAMEPAD_MAP.stickX] || 0;
    const y = now.axes[GAMEPAD_MAP.stickY] || 0;
    if (Math.abs(x) > 0.25 || Math.abs(y) > 0.25) emit({ type: "stick", x, y });
    last = now;
  }
  requestAnimationFrame(poll);
}

export function startPlug() {
  window.addEventListener("keydown", onKey);
  requestAnimationFrame(poll);
}
