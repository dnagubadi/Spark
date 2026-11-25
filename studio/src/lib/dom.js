// A tiny helper for building screens without a framework.
//   h("button", { class: "btn", onclick: go }, "Spark it")
// Attributes starting with "on" become event listeners. `html` sets trusted
// markup (only our own SVG icons, never kid or AI text). Everything else is text.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === false || value === null || value === undefined) continue;
    if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
    else if (key === "html") el.innerHTML = value;
    else if (key === "style" && typeof value === "object") Object.assign(el.style, value);
    else if (key === "dataset") Object.assign(el.dataset, value);
    else el.setAttribute(key, value === true ? "" : value);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let toastTimer;
export function toast(message) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = h("div", { class: "toast", role: "status" });
    document.body.append(t);
  }
  t.textContent = message;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3500);
}
