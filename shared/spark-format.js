// The Spark format: one JSON shape every Spark is saved in, whatever the journey.
// The controller, Spark Studio, Today's Sparks and sharing all read this.
//
// {
//   "format": "spark/1",
//   "id": "sp_…",                 unique id on this station
//   "journey": "change-it",       which coded framework plays it
//   "topic": "pottery",           what the kid typed
//   "title": "Spin a Pot",
//   "content":  { … },            journey-specific look and words (AI-filled)
//   "controls": {                 what each Spark-Plug control is called and does
//     "joystick": { "label", "does" },
//     "knobs":   [ { "label", "does", … } x3 ],
//     "buttons": [ { "label", "does", "value" } x4 ],
//     "ignite":  { "label", "does" }
//   },
//   "draft": { title, content, controls }   the AI's first version, kept so Remix
//                                           can show "AI drafted this" vs "You changed this"
//   "createdAt", "updatedAt", "shareCode", "source": "ai" | "offline"
// }
//
// "does" values always come from the journey's coded menu (shared/<journey>/menu.js).

import { normalizeChangeIt } from "./change-it/normalize.js";

export const FORMAT = "spark/1";

const NORMALIZERS = {
  "change-it": normalizeChangeIt,
};

export function canPlay(journey) {
  return journey in NORMALIZERS;
}

export function normalizeBody(journey, body) {
  const fn = NORMALIZERS[journey];
  if (!fn) throw new Error(`No coded framework for journey "${journey}" yet`);
  return fn(body);
}

function newId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `sp_${Date.now().toString(36)}${rand}`;
}

// Wrap a drafted body into a full Spark.
export function createSpark({ topic, journey, body, source = "ai" }) {
  const clean = normalizeBody(journey, body);
  const now = new Date().toISOString();
  return {
    format: FORMAT,
    id: newId(),
    journey,
    topic: String(topic || "").slice(0, 60),
    title: clean.title,
    content: clean.content,
    controls: clean.controls,
    draft: structuredClone(clean),
    source,
    shareCode: null,
    createdAt: now,
    updatedAt: now,
  };
}

// Re-check a whole Spark (after a remix, or loading one from a link).
export function normalizeSpark(spark) {
  if (!spark || spark.format !== FORMAT) throw new Error("That isn't a Spark file");
  const clean = normalizeBody(spark.journey, spark);
  const draft = spark.draft ? normalizeBody(spark.journey, spark.draft) : structuredClone(clean);
  return {
    ...spark,
    title: clean.title,
    content: clean.content,
    controls: clean.controls,
    draft,
  };
}
