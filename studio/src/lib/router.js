// Hash routing (#/ask, #/play/sp_123) so the studio works on any static host.

const routes = [];
let cleanup = null;

export function route(pattern, render) {
  const keys = [];
  const re = new RegExp(
    "^" + pattern.replace(/:([a-z]+)/gi, (_, k) => (keys.push(k), "([^/]+)")) + "$",
  );
  routes.push({ re, keys, render });
}

export function go(path) {
  if (location.hash === "#" + path) render();
  else location.hash = path;
}

export function currentPath() {
  return location.hash.replace(/^#/, "") || "/ask";
}

export async function render() {
  const path = currentPath();
  for (const r of routes) {
    const m = path.match(r.re);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    if (typeof cleanup === "function") cleanup();
    cleanup = null;
    const app = document.getElementById("app");
    const view = await r.render(params);
    if (!view) return;
    app.replaceChildren(view.el || view);
    cleanup = view.cleanup || null;
    window.scrollTo(0, 0);
    const focusTarget = app.querySelector("[data-autofocus]") || app.querySelector("h1");
    if (focusTarget) {
      if (!focusTarget.hasAttribute("tabindex") && focusTarget.tagName === "H1") focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus({ preventScroll: true });
    }
    return;
  }
  go("/ask");
}

export function startRouter() {
  window.addEventListener("hashchange", render);
  render();
}
