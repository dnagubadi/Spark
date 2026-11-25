// A friendly nudge when a topic doesn't fit Spark or isn't kid-safe.
import { h } from "../lib/dom.js";
import { askScreen } from "./ask.js";
import { CONFIG } from "../config.js";
import { friendlyFace } from "../ui/icons.js";
import { session } from "../lib/session.js";

export function tryAnotherScreen() {
  session.topic = "";
  const view = askScreen({
    ideas: CONFIG.tryAnotherIdeas,
    heading: "Hmm, let's try a different topic",
    lead: "That one is tricky to turn into a Spark. These ideas work great, or type your own.",
  });
  const main = view.el.querySelector("main");
  main.prepend(h("div", { html: friendlyFace() }));
  return view;
}
