// Ranked journeys: the best fit big, the other four still tappable. The kid chooses.
import { h } from "../lib/dom.js";
import { go } from "../lib/router.js";
import { session } from "../lib/session.js";
import { journeyById, fitWord } from "../../../shared/journeys.js";
import { studioHeader, navLink } from "../ui/header.js";
import { journeyIcon } from "../ui/icons.js";

function fitBadge(fit, size) {
  const dots = [1, 2, 3, 4, 5].map((n) => h("span", { class: n <= fit ? "on" : "" }));
  return h("span", { class: "fit" }, fitWord(fit), h("span", { class: "fit-dots", "aria-hidden": "true", style: size ? { gap: "4px" } : {} }, dots));
}

function startJourney(idea) {
  session.pickedIdea = `${idea.title}: ${idea.pitch}`;
  go(idea.built ? `/build/${idea.journey}` : `/soon/${idea.journey}`);
}

function card(idea, best) {
  const j = journeyById(idea.journey);
  return h("article", { class: `idea${best ? " idea-best" : ""}` },
    h("div", { class: "idea-head" },
      best ? h("span", { class: "tag-best" }, "Best fit") : h("h2", { class: "idea-name", html: `${journeyIcon(j.id, 30)}<span>${j.name}</span>` }),
      h("span", { style: { display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" } },
        !idea.built && h("span", { class: "tag-soon" }, "Coming soon"),
        fitBadge(idea.fit),
      ),
    ),
    best && h("h2", { class: "idea-name", html: `${journeyIcon(j.id, 48)}<span>${j.name}</span>` }),
    h("p", { class: "idea-title" }, idea.title),
    h("p", { class: "idea-pitch" }, idea.pitch),
    best && h("div", { class: "idea-art", html: journeyIcon(j.id, 140), style: { opacity: "0.9" } }),
    h("button", {
      class: best ? "btn btn-primary btn-lg" : "btn btn-lg", type: "button",
      onclick: () => startJourney(idea),
    }, best ? "Make this Spark" : "Make this one"),
  );
}

export function rankedScreen() {
  const rank = session.rank;
  if (!rank) return go("/ask");
  const [best, ...rest] = rank.ideas;
  const el = h("div", { class: "screen" },
    studioHeader([navLink("#/sparks", "Today's Sparks")]),
    h("main", { id: "main", class: "ranked" },
      h("div", { class: "ranked-head" },
        h("div", {},
          h("h1", {}, `${rank.topic.charAt(0).toUpperCase()}${rank.topic.slice(1)} could become…`),
          h("p", { class: "muted" }, "We sorted all five ways to play by how well they fit. Pick any one."),
        ),
        h("div", { style: { display: "flex", gap: "0.75rem", alignItems: "center" } },
          rank.source === "offline" && h("span", { class: "mode-pill", title: "No AI connected, using built-in ideas" }, "Offline ideas"),
          h("a", { class: "btn btn-lg", href: "#/ask" }, "Try another topic"),
        ),
      ),
      h("div", { class: "ranked-grid" }, card(best, true), h("div", { class: "ranked-rest" }, rest.map((i) => card(i, false)))),
    ),
  );
  return el;
}
