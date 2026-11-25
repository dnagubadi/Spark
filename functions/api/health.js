// GET /api/health  tells the studio whether AI drafting is switched on.
import { hasKey, json, DEFAULT_MODEL } from "../../server/claude.js";

export async function onRequestGet({ env }) {
  return json({ ok: true, ai: hasKey(env), model: env.SPARK_MODEL || DEFAULT_MODEL });
}
