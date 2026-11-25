// POST /api/rank  { topic }  ->  { ok, topic, ideas: [ { journey, fit, title, pitch, built } x5 ] }
// Scores a kid's topic for all five journeys, best fit first.
import { askForJSON, json, readBody, SparkAIError } from "../../server/claude.js";
import { RANK_SCHEMA, rankPrompt } from "../../shared/prompts.js";
import { cleanTopic, looksUnsafe, normalizeRank } from "../../shared/rank.js";

export async function onRequestPost({ request, env }) {
  const { topic } = await readBody(request);
  const t = cleanTopic(topic);
  if (!t) return json({ error: "Type a topic first", kind: "empty" }, 400);
  if (looksUnsafe(t)) return json(normalizeRank({ ok: false, ideas: [] }, t));

  try {
    const { system, user } = rankPrompt(t);
    const raw = await askForJSON(env, { system, user, schema: RANK_SCHEMA, maxTokens: 4000 });
    return json(normalizeRank(raw, t));
  } catch (err) {
    const e = err instanceof SparkAIError ? err : new SparkAIError(String(err));
    return json({ error: e.message, kind: e.kind }, e.status);
  }
}
