// POST /api/draft  { topic, journey, idea? }  ->  { body: { title, content, controls } }
// Fills in a journey's content and picks its behaviors from the coded menu.
// The browser wraps the body into a full Spark (shared/spark-format.js).
import { askForJSON, json, readBody, SparkAIError } from "../../server/claude.js";
import { CHANGE_IT_SCHEMA, changeItPrompt } from "../../shared/prompts.js";
import { cleanTopic, looksUnsafe } from "../../shared/rank.js";
import { normalizeBody } from "../../shared/spark-format.js";

const DRAFTERS = {
  "change-it": { prompt: changeItPrompt, schema: CHANGE_IT_SCHEMA },
};

export async function onRequestPost({ request, env }) {
  const { topic, journey, idea } = await readBody(request);
  const t = cleanTopic(topic);
  const drafter = DRAFTERS[journey];
  if (!t) return json({ error: "Type a topic first", kind: "empty" }, 400);
  if (!drafter) return json({ error: `The ${journey} journey isn't built yet`, kind: "not_built" }, 400);
  if (looksUnsafe(t)) return json({ error: "Let's try a different topic", kind: "unsafe" }, 422);

  try {
    const { system, user } = drafter.prompt(t, idea);
    const raw = await askForJSON(env, { system, user, schema: drafter.schema });
    return json({ body: normalizeBody(journey, raw) });
  } catch (err) {
    const e = err instanceof SparkAIError ? err : new SparkAIError(String(err));
    return json({ error: e.message, kind: e.kind }, e.status);
  }
}
