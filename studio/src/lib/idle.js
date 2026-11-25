// Expo handoff: after a quiet stretch, ask "Still exploring?", then reset the
// station for the next kid. Any touch, key, mouse move or controller input counts.

import { CONFIG } from "../config.js";
import { h } from "./dom.js";

let quietTimer = null;
let countdownTimer = null;
let overlay = null;
let onReset = () => {};

function clearOverlay() {
  clearInterval(countdownTimer);
  overlay?.remove();
  overlay = null;
}

function arm() {
  clearTimeout(quietTimer);
  if (overlay) return; // the countdown is showing; only the button cancels it
  quietTimer = setTimeout(ask, CONFIG.idleSeconds * 1000);
}

function ask() {
  // Nothing to protect on a fresh Ask screen.
  if ((location.hash || "#/ask") === "#/ask") return arm();
  let left = CONFIG.idleCountdownSeconds;
  const count = h("p", { class: "countdown", "aria-live": "polite" }, String(left));
  const stay = h("button", { class: "btn btn-primary btn-lg", type: "button", onclick: () => { clearOverlay(); arm(); } }, "I'm still here");
  overlay = h("div", { class: "overlay" },
    h("div", { class: "dialog", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "idle-title" },
      h("h2", { id: "idle-title" }, "Still exploring?"),
      h("p", {}, "The station will get ready for the next explorer in"),
      count,
      stay,
    ),
  );
  document.getElementById("overlay-root").append(overlay);
  stay.focus();
  countdownTimer = setInterval(() => {
    left -= 1;
    count.textContent = String(left);
    if (left <= 0) {
      clearOverlay();
      onReset();
      arm();
    }
  }, 1000);
}

export function startIdle(resetFn) {
  onReset = resetFn;
  for (const ev of ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "spark-activity"]) {
    window.addEventListener(ev, arm, { passive: true });
  }
  arm();
}
