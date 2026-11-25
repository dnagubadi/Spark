// Clean up a topic ranking so the Ranked screen always gets all five journeys,
// sorted best fit first.

import { JOURNEYS, JOURNEY_IDS } from "./journeys.js";
import { text } from "./change-it/normalize.js";

// A tiny first line of defence. The AI also judges kid safety (the "ok" flag).
const BLOCKED = [
  "kill", "gun", "blood", "gore", "murder", "sex", "porn", "nude", "drug", "cocaine", "weed",
  "suicide", "nazi", "terror", "bomb", "beer", "vodka", "casino",
];

export function looksUnsafe(topic) {
  const t = String(topic || "").toLowerCase();
  return BLOCKED.some((w) => new RegExp(`\\b${w}`).test(t));
}

export function cleanTopic(topic) {
  return String(topic || "").replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 40);
}

export function normalizeRank(raw, topic) {
  const ideas = Array.isArray(raw?.ideas) ? raw.ideas : [];
  const byJourney = new Map();
  for (const idea of ideas) {
    if (JOURNEY_IDS.includes(idea?.journey) && !byJourney.has(idea.journey)) byJourney.set(idea.journey, idea);
  }
  const t = text(raw?.topic, cleanTopic(topic) || "your topic", 40).toLowerCase();
  const list = JOURNEYS.map((j, order) => {
    const idea = byJourney.get(j.id) || {};
    const fit = Math.round(Math.min(5, Math.max(1, Number(idea.fit) || 2)));
    return {
      journey: j.id,
      fit,
      title: text(idea.title, `${j.name}: ${t}`, 32),
      pitch: text(idea.pitch, `${j.verb}, all about ${t}.`, 140),
      built: j.built,
      order,
    };
  });
  // Best fit first. On a tie, a journey that's already built goes first.
  list.sort((a, b) => b.fit - a.fit || Number(b.built) - Number(a.built) || a.order - b.order);
  return {
    ok: raw?.ok !== false && !looksUnsafe(topic),
    topic: t,
    ideas: list.map(({ order, ...rest }) => rest),
  };
}
