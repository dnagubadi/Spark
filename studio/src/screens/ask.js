// 1 · ASK: type a topic or tap an idea, then Spark it (or press Ignite).
import { h } from "../lib/dom.js";
import { go } from "../lib/router.js";
import { session } from "../lib/session.js";
import { onPlug } from "../lib/plug.js";
import { CONFIG } from "../config.js";
import { JOURNEYS } from "../../../shared/journeys.js";
import { cleanTopic } from "../../../shared/rank.js";
import { studioHeader, navLink } from "../ui/header.js";
import { journeyIcon } from "../ui/icons.js";

export function askScreen({ ideas = CONFIG.ideas, heading = "What are you curious about?", lead = null } = {}) {
  const note = h("p", { class: "ask-note", role: "status" });
  const input = h("input", {
    id: "topic", class: "ask-input", type: "text", autocomplete: "off", maxlength: "60",
    placeholder: "like pottery, sharks or a water bottle", value: session.topic, "data-autofocus": true,
  });

  function submit(topic) {
    const t = cleanTopic(topic ?? input.value);
    if (!t) {
      note.textContent = "Type something you like first, or tap an idea.";
      note.classList.add("is-error");
      input.focus();
      return;
    }
    session.topic = t;
    go("/sorting");
  }

  const form = h("form", { class: "ask-form", onsubmit: (e) => { e.preventDefault(); submit(); } },
    h("label", { for: "topic" }, "Type anything. A thing, an animal, a hobby, a place."),
    h("div", { class: "ask-row" }, input, h("button", { class: "btn btn-primary btn-xl", type: "submit" }, "Spark it")),
  );

  const chips = ideas.map((idea) => h("button", { class: "chip", type: "button", onclick: () => submit(idea) }, idea));

  const journeyChips = JOURNEYS.map((j) => {
    const btn = h("button", {
      class: "btn journey-chip", type: "button", "aria-pressed": String(session.lockedJourney === j.id),
      html: `${journeyIcon(j.id)}<span>${j.name}</span>`,
      onclick: () => {
        session.lockedJourney = session.lockedJourney === j.id ? null : j.id;
        journeyChips.forEach((b) => b.setAttribute("aria-pressed", String(b === btn && session.lockedJourney === j.id)));
      },
    });
    return btn;
  });

  // Spark-Plug: Knob 1 scrolls the ideas, Ignite sparks it.
  let pick = -1;
  const off = onPlug((e) => {
    if (e.type === "ignite") submit(pick >= 0 && !input.value.trim() ? ideas[pick] : undefined);
    const step = e.type === "nudge" && e.index === 0 ? Math.sign(e.delta) : 0;
    const abs = e.type === "knob" && e.index === 0 ? Math.min(ideas.length - 1, Math.floor((e.value / 101) * ideas.length)) : null;
    if (step || abs !== null) {
      pick = abs ?? (pick + step + ideas.length) % ideas.length;
      chips.forEach((c, i) => c.classList.toggle("is-highlight", i === pick));
      input.value = "";
      input.placeholder = ideas[pick];
    }
  });

  const el = h("div", { class: "screen" },
    studioHeader([navLink("#/sparks", "Today's Sparks")]),
    h("main", { id: "main", class: "ask" },
      h("h1", {}, heading),
      lead && h("p", { class: "lead" }, lead),
      form,
      note,
      h("div", { class: "ask-section" },
        h("span", {}, "Or tap an idea:"),
        h("div", { class: "chip-row" }, chips),
      ),
      h("div", { class: "ask-section" },
        h("span", { class: "muted" }, "Already know what you want to make? Pick one first (optional):"),
        h("div", { class: "journey-chips", role: "group", "aria-label": "Pick a journey first" }, journeyChips),
      ),
    ),
    h("footer", { class: "foot" },
      h("div", { class: "plug-hint" },
        h("span", { class: "dome", "aria-hidden": "true" }),
        h("span", { html: "Using a Spark-Plug? Turn <b>Knob 1</b> to scroll the ideas, then press <b>Ignite</b> to Spark it." }),
      ),
      h("span", { class: "muted" }, "Saved Sparks go to this station's gallery for today."),
    ),
  );
  return { el, cleanup: off };
}
