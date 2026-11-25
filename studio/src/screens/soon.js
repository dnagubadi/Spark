// A journey that isn't built yet. Every journey stays offered, so the kid gets a
// friendly way forward instead of a dead end.
import { h } from "../lib/dom.js";
import { go } from "../lib/router.js";
import { session } from "../lib/session.js";
import { journeyById } from "../../../shared/journeys.js";
import { studioHeader, navLink } from "../ui/header.js";
import { journeyIcon } from "../ui/icons.js";

export function soonScreen({ journey }) {
  const j = journeyById(journey);
  if (!j) return go("/ask");
  return h("div", { class: "screen" },
    studioHeader([navLink("#/sparks", "Today's Sparks")]),
    h("main", { id: "main", class: "center" },
      h("div", { html: journeyIcon(j.id, 120) }),
      h("h1", {}, `${j.name} is still being built`),
      h("p", { class: "lead" }, `${j.verb}. It's coming soon to Spark Studio. Want to make ${session.topic || "it"} a Change It Spark instead?`),
      h("div", { style: { display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" } },
        h("button", { class: "btn btn-primary btn-lg", type: "button", onclick: () => go("/build/change-it") }, "Make it a Change It"),
        session.rank && h("a", { class: "btn btn-lg", href: "#/ranked" }, "Back to the choices"),
        h("a", { class: "btn btn-lg", href: "#/ask" }, "Try another topic"),
      ),
    ),
  );
}
