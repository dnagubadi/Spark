// Run with: npm test
// These check the rule that matters most: whatever comes back from the AI, a
// Spark only ever uses moves from the coded menu.

import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeChangeIt } from "../shared/change-it/normalize.js";
import { KNOB_IDS, BUTTON_IDS, PATTERNS, STICKERS, MAX_PARTS } from "../shared/change-it/menu.js";
import { createSpark, normalizeSpark } from "../shared/spark-format.js";
import { normalizeRank, looksUnsafe } from "../shared/rank.js";
import { offlineRank, offlineDraft } from "../shared/offline.js";
import { JOURNEY_IDS } from "../shared/journeys.js";
import { CHANGE_IT_SCHEMA, RANK_SCHEMA } from "../shared/prompts.js";

test("off-menu AI output is replaced with menu moves", () => {
  const out = normalizeChangeIt({
    title: "x".repeat(200),
    content: { shape: { base: "spaceship", parts: ["laser", "lid", "lid", "face", "legs", "wings"], stand: "lava", color: "red" } },
    controls: {
      knobs: [{ does: "explode" }, { does: "stretch-tall" }, { does: "stretch-tall" }],
      buttons: [{ does: "delete", value: "?" }, { does: "pattern", value: "plaid" }, { does: "sticker", value: "skull" }],
      ignite: { does: "nuke" },
      joystick: { does: "fly" },
    },
  });
  assert.equal(out.title.length, 32);
  assert.equal(out.content.shape.base, "vase");
  assert.equal(out.content.shape.stand, "plate");
  assert.equal(out.content.shape.color, "#2F6FED");
  assert.deepEqual(out.content.shape.parts, ["lid", "face", "legs"]);
  assert.ok(out.content.shape.parts.length <= MAX_PARTS);
  const moves = out.controls.knobs.map((k) => k.does);
  assert.ok(moves.every((m) => KNOB_IDS.includes(m)));
  assert.equal(new Set(moves).size, 3, "three knobs, three different moves");
  assert.equal(out.controls.buttons.length, 4);
  for (const b of out.controls.buttons) {
    assert.ok(BUTTON_IDS.includes(b.does));
    if (b.does === "pattern") assert.ok(PATTERNS.includes(b.value));
    if (b.does === "sticker") assert.ok(STICKERS.includes(b.value));
    if (b.does === "color") assert.match(b.value, /^#[0-9A-F]{6}$/);
  }
  assert.equal(out.controls.ignite.does, "sparkle");
  assert.equal(out.controls.joystick.does, "spin");
});

test("a Spark round-trips through the Spark format", () => {
  const spark = createSpark({ topic: "pottery", journey: "change-it", body: offlineDraft("change-it", "pottery"), source: "offline" });
  assert.equal(spark.format, "spark/1");
  assert.equal(spark.title, "Spin a Pot");
  assert.deepEqual(spark.draft.controls, spark.controls);
  const again = normalizeSpark(JSON.parse(JSON.stringify(spark)));
  assert.deepEqual(again.controls, spark.controls);
  assert.throws(() => normalizeSpark({ format: "nope" }));
  assert.throws(() => createSpark({ topic: "x", journey: "hear-it", body: {} }), /No coded framework/);
});

test("ranking always lists all five journeys, best first", () => {
  const r = normalizeRank({ ok: true, ideas: [{ journey: "hear-it", fit: 5, title: "Band", pitch: "Play" }, { journey: "fake", fit: 5 }] }, "drums");
  assert.deepEqual(r.ideas.map((i) => i.journey).sort(), [...JOURNEY_IDS].sort());
  assert.equal(r.ideas[0].journey, "hear-it");
  assert.ok(r.ideas.every((i, n) => n === 0 || r.ideas[n - 1].fit >= i.fit));
});

test("unsafe topics get a gentle try-another", () => {
  assert.equal(looksUnsafe("guns"), true);
  assert.equal(looksUnsafe("volcanoes"), false);
  assert.equal(offlineRank("pottery").ok, true);
  assert.equal(normalizeRank({ ok: true, ideas: [] }, "a bomb").ok, false);
});

test("offline drafts exist for any topic", () => {
  for (const t of ["pottery", "cake", "robots", "a water bottle", "sea turtles", ""]) {
    const s = createSpark({ topic: t, journey: "change-it", body: offlineDraft("change-it", t) });
    assert.equal(s.controls.knobs.length, 3);
  }
});

test("AI schemas only offer menu values", () => {
  const knob = CHANGE_IT_SCHEMA.properties.controls.properties.knobs.items.properties.does;
  assert.deepEqual(knob.enum, KNOB_IDS);
  assert.deepEqual(RANK_SCHEMA.properties.ideas.items.properties.journey.enum, JOURNEY_IDS);
});
