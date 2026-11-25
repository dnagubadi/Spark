import { h } from "../lib/dom.js";
import { logo } from "./icons.js";

export function biggerTextButton() {
  const root = document.documentElement;
  const btn = h("button", {
    class: "btn", type: "button", "aria-pressed": String(root.dataset.big === "true"),
    onclick: () => {
      const on = root.dataset.big !== "true";
      root.dataset.big = String(on);
      btn.setAttribute("aria-pressed", String(on));
    },
  }, "Bigger text");
  return btn;
}

// The studio header: logo + name on the left, nav on the right.
export function studioHeader(navItems = []) {
  return h("header", { class: "bar" },
    h("a", { class: "brand", href: "#/ask", html: `${logo()}<span class="brand-name">Spark Studio</span>` }),
    h("nav", { "aria-label": "Studio" }, ...navItems, biggerTextButton()),
  );
}

export const navLink = (href, label, primary = false) =>
  h("a", { class: `btn${primary ? " btn-primary" : ""}`, href }, label);
