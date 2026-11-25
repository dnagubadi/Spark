// The Spark-Plug control strip: joystick, 3 knobs, 4 buttons and Ignite, drawn
// like the real controller. Every control works with touch, mouse, keyboard and
// the physical Spark-Plug, so the controller is a bonus, never required.
//
// controlStrip({ controls, buttonArt, onKnob, onButton, onIgnite, onStick })
//   -> { el, setKnob(i, value), setPressed(i, bool), cleanup() }

import { h } from "../lib/dom.js";
import { onPlug } from "../lib/plug.js";
import { knobSVG, stickSVG, capSVG } from "./icons.js";

export function controlStrip({ controls, buttonArt = () => "#FFFFFF", onKnob, onButton, onIgnite, onStick }) {
  const knobs = controls.knobs.map((k, i) => {
    const input = h("input", {
      id: `knob-${i}`, type: "range", min: "0", max: "100", value: String(k.start),
      "aria-label": `Knob ${i + 1}: ${k.label}`, "aria-valuetext": "",
    });
    const face = h("div", { class: "knob", html: knobSVG() });
    face.append(input);
    const box = h("div", { class: "ctl" },
      h("div", { class: "knob-wrap" }, face, h("span", { class: "ctl-label" }, `KNOB ${i + 1}`)),
      h("label", { class: "ctl-name", for: `knob-${i}` }, k.label),
    );
    const paint = (v) => {
      face.querySelector(".needle").setAttribute("transform", `rotate(${-135 + v * 2.7})`);
      face.querySelectorAll(".tick").forEach((t) => t.setAttribute("stroke", Number(t.dataset.i) * 10 <= v ? "#1B2A4A" : "#E3D3C3"));
      input.setAttribute("aria-valuetext", v < 34 ? k.low : v > 66 ? k.high : "In between");
    };
    input.addEventListener("input", () => { paint(+input.value); onKnob(i, +input.value); });

    // Drag up/down or around the knob with a finger, like turning a real one.
    let drag = null;
    face.addEventListener("pointerdown", (e) => {
      drag = { y: e.clientY, x: e.clientX, v: +input.value };
      face.setPointerCapture(e.pointerId);
      input.focus();
      e.preventDefault();
    });
    face.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const v = Math.round(Math.min(100, Math.max(0, drag.v + (drag.y - e.clientY) * 0.6 + (e.clientX - drag.x) * 0.6)));
      if (v !== +input.value) { input.value = String(v); paint(v); onKnob(i, v); }
    });
    const end = () => (drag = null);
    face.addEventListener("pointerup", end);
    face.addEventListener("pointercancel", end);

    paint(k.start);
    return { box, input, paint };
  });

  const buttons = controls.buttons.map((b, i) =>
    h("button", {
      class: "plug-btn", type: "button", "aria-pressed": "false",
      html: `${capSVG(buttonArt(b))}<span></span>`,
      onclick: () => onButton(i),
    }),
  );
  buttons.forEach((btn, i) => (btn.querySelector("span").textContent = controls.buttons[i].label));

  // Joystick: drag left/right, or focus it and use the arrow keys.
  const stick = h("button", {
    class: "stick", type: "button", html: stickSVG(),
    "aria-label": `Joystick: ${controls.joystick.label}. Use the left and right arrow keys.`,
  });
  let stickDrag = null;
  const lean = (x) => stick.querySelector(".stick-top").setAttribute("transform", `rotate(${x * 18} 38 46)`);
  stick.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const x = e.key === "ArrowLeft" ? -1 : 1;
      lean(x); onStick(x, 0); e.preventDefault();
    }
  });
  stick.addEventListener("keyup", () => lean(0));
  stick.addEventListener("pointerdown", (e) => { stickDrag = e.clientX; stick.setPointerCapture(e.pointerId); });
  stick.addEventListener("pointermove", (e) => {
    if (stickDrag === null) return;
    const x = Math.max(-1, Math.min(1, (e.clientX - stickDrag) / 40));
    lean(x); onStick(x, 0);
  });
  const stickEnd = () => { stickDrag = null; lean(0); };
  stick.addEventListener("pointerup", stickEnd);
  stick.addEventListener("pointercancel", stickEnd);

  const ignite = h("button", { class: "ignite", type: "button", "aria-label": `Ignite: ${controls.ignite.label}`, onclick: () => onIgnite() });

  const el = h("footer", { class: "strip", "aria-label": "Controls, on screen or on the Spark-Plug" },
    h("div", { class: "ctl" }, h("span", { class: "ctl-label" }, "JOYSTICK"), h("b", { class: "ctl-name" }, controls.joystick.label), stick),
    knobs.map((k) => k.box),
    h("div", { class: "ctl ctl-buttons" }, h("span", { class: "ctl-label" }, "BUTTONS"), h("div", { class: "plug-buttons" }, buttons)),
    h("div", { class: "ctl ignite-ctl" },
      h("span", { class: "ctl-label" }, "IGNITE"),
      h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, ignite, h("span", { class: "ignite-base", "aria-hidden": "true" })),
      h("b", { class: "ctl-name" }, controls.ignite.label),
    ),
  );

  function setKnob(i, v) {
    const k = knobs[i];
    k.input.value = String(v);
    k.paint(v);
    onKnob(i, v);
  }

  const flash = (node) => { node.classList.add("is-down"); setTimeout(() => node.classList.remove("is-down"), 140); };

  // The physical Spark-Plug (or its keyboard stand-in).
  let stickRelease;
  const off = onPlug((e) => {
    if (e.type === "knob") setKnob(e.index, e.value);
    if (e.type === "nudge") setKnob(e.index, Math.min(100, Math.max(0, +knobs[e.index].input.value + e.delta)));
    if (e.type === "button") { flash(buttons[e.index]); onButton(e.index); }
    if (e.type === "ignite") { flash(ignite); onIgnite(); }
    if (e.type === "stick") {
      lean(e.x); onStick(e.x, e.y);
      clearTimeout(stickRelease); stickRelease = setTimeout(() => lean(0), 150);
    }
  });

  return {
    el,
    setKnob,
    setPressed: (i, on) => buttons[i].setAttribute("aria-pressed", String(on)),
    cleanup: off,
  };
}
