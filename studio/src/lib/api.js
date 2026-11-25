// Talks to the server functions in functions/api. If the AI isn't set up (no key,
// no Wi-Fi), falls back to offline mode so the station keeps working.

import { offlineRank, offlineDraft } from "../../../shared/offline.js";
import { normalizeRank } from "../../../shared/rank.js";

let health = null;

export async function getHealth() {
  if (health) return health;
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    health = res.ok ? await res.json() : { ai: false };
  } catch {
    health = { ai: false };
  }
  return health;
}

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.kind = data.kind || "http";
    throw err;
  }
  return data;
}

// Kinds of failure where offline mode is the right answer.
const OFFLINE_OK = new Set(["no_key", "bad_key", "rate_limit", "ai_error", "http", "server_error"]);

export async function rankTopic(topic) {
  const { ai } = await getHealth();
  if (!ai) return { ...offlineRank(topic), source: "offline" };
  try {
    const data = await post("/api/rank", { topic });
    return { ...normalizeRank(data, topic), source: "ai" };
  } catch (err) {
    if (err.kind === "refusal") return { ...normalizeRank({ ok: false }, topic), source: "ai" };
    if (OFFLINE_OK.has(err.kind) || err instanceof TypeError) {
      console.warn("[spark] ranking offline:", err.message);
      return { ...offlineRank(topic), source: "offline" };
    }
    throw err;
  }
}

export async function draftSpark({ topic, journey, idea }) {
  const { ai } = await getHealth();
  if (!ai) return { body: offlineDraft(journey, topic), source: "offline" };
  try {
    const data = await post("/api/draft", { topic, journey, idea });
    return { body: data.body, source: "ai" };
  } catch (err) {
    if (OFFLINE_OK.has(err.kind) || err instanceof TypeError) {
      console.warn("[spark] drafting offline:", err.message);
      return { body: offlineDraft(journey, topic), source: "offline" };
    }
    throw err;
  }
}
