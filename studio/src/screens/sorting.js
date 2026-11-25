// The AI scores the topic for all five journeys, then we decide where to go.
import { h } from "../lib/dom.js";
import { go, currentPath } from "../lib/router.js";
import { session } from "../lib/session.js";
import { rankTopic } from "../lib/api.js";
import { CONFIG } from "../config.js";
import { studioHeader } from "../ui/header.js";

export function loadingView(title, lead) {
  return h("div", { class: "screen" },
    studioHeader(),
    h("main", { id: "main", class: "center", "aria-busy": "true" },
      h("div", { class: "building-dots", "aria-hidden": "true" }, h("span"), h("span"), h("span")),
      h("h1", {}, title),
      lead && h("p", { class: "lead" }, lead),
    ),
  );
}

export function sortingScreen() {
  if (!session.topic) return go("/ask");
  const here = currentPath();
  (async () => {
    let rank;
    try {
      rank = await rankTopic(session.topic);
    } catch (err) {
      console.error(err);
      rank = null;
    }
    if (currentPath() !== here) return; // the kid moved on
    session.rank = rank;
    if (!rank || !rank.ok) return go("/try-another");
    if (session.lockedJourney) return go(`/build/${session.lockedJourney}`);
    if (CONFIG.autoPickJourney) {
      const best = rank.ideas.find((i) => i.built);
      if (best) return go(`/build/${best.journey}`);
    }
    go("/ranked");
  })();
  return loadingView(`Thinking about ${session.topic}…`, "Spark is finding the best ways to play with it.");
}
