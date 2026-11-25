// Today's Sparks: the station's shared gallery for the day.
// One shared station account, no kid accounts. Kept in this browser for now
// (localStorage); Supabase will replace this so codes work from any device.

import { normalizeSpark } from "../../../shared/spark-format.js";
import { makeCode } from "./share.js";

const KEY = "spark.today.v1";

function today() {
  return new Date().toLocaleDateString("en-CA"); // 2026-11-25
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (data && data.day === today() && Array.isArray(data.sparks)) return data;
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  return { day: today(), sparks: [] };
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function listSparks() {
  return load().sparks.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getSpark(id) {
  const s = load().sparks.find((x) => x.id === id);
  return s ? normalizeSpark(s) : null;
}

export function findByCode(code) {
  const c = String(code || "").trim().toUpperCase();
  const s = load().sparks.find((x) => x.shareCode === c);
  return s ? normalizeSpark(s) : null;
}

export function saveSpark(spark) {
  const data = load();
  const taken = new Set(data.sparks.map((s) => s.shareCode));
  const saved = { ...spark, updatedAt: new Date().toISOString() };
  if (!saved.shareCode) {
    do saved.shareCode = makeCode(); while (taken.has(saved.shareCode));
  }
  const i = data.sparks.findIndex((s) => s.id === saved.id);
  if (i >= 0) data.sparks[i] = saved;
  else data.sparks.push(saved);
  const ok = write(data);
  return { spark: saved, ok };
}
