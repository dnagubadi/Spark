// 3 · PLAY: play the Spark on screen or with the Spark-Plug.
import { h, toast } from "../lib/dom.js";
import { go } from "../lib/router.js";
import { session } from "../lib/session.js";
import { getSpark, saveSpark } from "../lib/store.js";
import { journeyById } from "../../../shared/journeys.js";
import { BOARDS } from "../journeys/index.js";
import { biggerTextButton } from "../ui/header.js";
import { logo, journeyIcon } from "../ui/icons.js";

// Find the Spark a route means: "working" is the one in progress, anything else
// is an id in Today's Sparks.
export function resolveSpark(id) {
  if (id === "working") return session.working;
  const saved = getSpark(id);
  if (saved) session.working = saved;
  return saved;
}

export function saveAndShow(spark) {
  const { spark: saved, ok } = saveSpark(spark);
  session.working = saved;
  if (!ok) toast("This browser couldn't save it. Ask a grown-up to check storage.");
  go(`/sparks/${saved.id}`);
}

export function playScreen({ id }) {
  const spark = resolveSpark(id);
  if (!spark) return go("/ask");
  const board = BOARDS[spark.journey];
  if (!board) return go(`/soon/${spark.journey}`);
  const j = journeyById(spark.journey);
  session.remixHistory = [];

  const header = h("header", { class: "bar" },
    h("div", { style: { display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" } },
      h("a", { href: "#/ask", "aria-label": "Spark Studio home", html: logo() }),
      h("h1", { class: "bar-title" }, spark.title),
      h("span", { class: "badge", html: `${journeyIcon(j.id, 20)}<span>${j.name}</span>` }),
      spark.source === "offline" && h("span", { class: "mode-pill", title: "Drafted without AI, from Spark's built-in starters" }, "Offline draft"),
    ),
    h("nav", { "aria-label": "Spark" },
      h("a", { class: "btn", href: "#/ask" }, "Start over"),
      h("a", { class: "btn", href: `#/remix/${id}` }, "Remix"),
      h("button", { class: "btn btn-primary", type: "button", onclick: () => saveAndShow(spark) }, "Save"),
      biggerTextButton(),
    ),
  );
  return board(spark, { header });
}
