// What we ask the AI, and the JSON shapes it must answer in.
// The schemas use enums built from the coded menus, so the AI can only pick
// moves Spark already knows. normalize*() checks everything again afterwards.

import { JOURNEYS, JOURNEY_IDS } from "./journeys.js";
import {
  BASES, PARTS, STANDS, KNOB_MOVES, BUTTON_MOVES, PATTERNS, STICKERS,
  JOYSTICK_MOVES, REVEALS, STAGES,
} from "./change-it/menu.js";

const KID_RULES = `You write for curious kids aged about 7 to 12 at a museum-style station.
Use short, plain, friendly words. No scary, violent, gross or grown-up content.
Never ask for or mention personal information. Never use brand names or real people.`;

// ---------- 1. Rank: score a topic for every journey ----------

export const RANK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "topic", "ideas"],
  properties: {
    ok: {
      type: "boolean",
      description: "false if the topic is not kid-safe, or is not a real thing or idea a kid could explore",
    },
    topic: { type: "string", description: "the topic cleaned up in 1 to 4 words, lower case" },
    ideas: {
      type: "array",
      description: "exactly one idea per journey, all five journeys",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["journey", "fit", "title", "pitch"],
        properties: {
          journey: { type: "string", enum: JOURNEY_IDS },
          fit: { type: "integer", enum: [1, 2, 3, 4, 5], description: "5 = great fit, 1 = a stretch" },
          title: { type: "string", description: "2 to 4 words, like 'Bottle band'" },
          pitch: { type: "string", description: "one sentence a kid reads, under 18 words" },
        },
      },
    },
  },
};

export function rankPrompt(topic) {
  const list = JOURNEYS.map((j) => `- ${j.id} (${j.name}): ${j.verb}`).join("\n");
  return {
    system: `${KID_RULES}

Spark turns any topic into a small playable game called a Spark. There are five journeys
(game frameworks). For the kid's topic, write one Spark idea for EVERY journey and score how well
the topic fits that journey from 1 to 5. Be honest: most topics fit two or three journeys well.

Journeys:
${list}

If the topic isn't kid-safe or isn't something to explore (gibberish, a person's name, an insult),
set ok to false and still return five gentle generic ideas.`,
    user: `The kid typed: ${JSON.stringify(String(topic).slice(0, 80))}`,
  };
}

// ---------- 2. Draft: fill in a Change It Spark ----------

const menuLines = (obj) => Object.entries(obj).map(([k, v]) => `  ${k}: ${v}`).join("\n");

export const CHANGE_IT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "content", "controls"],
  properties: {
    title: { type: "string", description: "a fun Spark name, 2 to 4 words" },
    content: {
      type: "object",
      additionalProperties: false,
      required: ["thing", "tryThis", "stage", "shape", "panelTitle", "reveal", "fact"],
      properties: {
        thing: { type: "string", description: "the one thing the kid shapes, 1 or 2 words, like 'pot'" },
        tryThis: { type: "string", description: "a first thing to try with Knob 1, under 9 words" },
        stage: { type: "string", enum: Object.keys(STAGES) },
        shape: {
          type: "object",
          additionalProperties: false,
          required: ["base", "parts", "stand", "color", "accent"],
          properties: {
            base: { type: "string", enum: Object.keys(BASES) },
            parts: { type: "array", items: { type: "string", enum: Object.keys(PARTS) } },
            stand: { type: "string", enum: Object.keys(STANDS) },
            color: { type: "string", description: "starting body color as #RRGGBB" },
            accent: { type: "string", description: "darker detail color as #RRGGBB" },
          },
        },
        panelTitle: { type: "string", description: "1 word naming the button choices, like GLAZE or FROSTING" },
        reveal: {
          type: "object",
          additionalProperties: false,
          required: ["title", "text", "after"],
          properties: {
            title: { type: "string", description: "2 to 3 words, like THE KILN" },
            text: { type: "string", description: "1 to 2 sentences: what Ignite will do and why, a real fact" },
            after: { type: "string", description: "1 sentence shown after the reveal" },
          },
        },
        fact: { type: "string", description: "one true, surprising fact about the topic, under 25 words" },
      },
    },
    controls: {
      type: "object",
      additionalProperties: false,
      required: ["joystick", "knobs", "buttons", "ignite"],
      properties: {
        joystick: {
          type: "object",
          additionalProperties: false,
          required: ["label", "does"],
          properties: {
            label: { type: "string", description: "2 to 3 words, like 'Spin the wheel'" },
            does: { type: "string", enum: Object.keys(JOYSTICK_MOVES) },
          },
        },
        knobs: {
          type: "array",
          description: "exactly 3 knobs, each with a different 'does'",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "does", "low", "high", "start", "up", "down"],
            properties: {
              label: { type: "string", description: "1 word, like Height" },
              does: { type: "string", enum: Object.keys(KNOB_MOVES) },
              low: { type: "string", description: "1 word for the low end, like Short" },
              high: { type: "string", description: "1 word for the high end, like Tall" },
              start: { type: "integer", description: "starting position 0 to 100" },
              up: { type: "string", description: "'What changed' sentence when turned up, with a real fact, under 20 words" },
              down: { type: "string", description: "'What changed' sentence when turned down, under 20 words" },
            },
          },
        },
        buttons: {
          type: "array",
          description: "exactly 4 buttons",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "does", "value"],
            properties: {
              label: { type: "string", description: "1 or 2 words" },
              does: { type: "string", enum: Object.keys(BUTTON_MOVES) },
              value: {
                type: "string",
                description: `color: #RRGGBB. pattern: one of ${PATTERNS.join(", ")}. sticker: one of ${STICKERS.join(", ")}.`,
              },
            },
          },
        },
        ignite: {
          type: "object",
          additionalProperties: false,
          required: ["label", "does"],
          properties: {
            label: { type: "string", description: "2 words, like 'Fire it'" },
            does: { type: "string", enum: Object.keys(REVEALS) },
          },
        },
      },
    },
  },
};

export function changeItPrompt(topic, idea) {
  return {
    system: `${KID_RULES}

You fill in a Change It Spark. Change It is a coded game: the kid shapes ONE thing with
3 knobs, styles it with 4 buttons, moves it with a joystick, then presses the big Ignite
button for a reveal. You do not write code or invent new mechanics. You only write the
words and pick from these menus.

Body shapes (base):
${menuLines(BASES)}
Parts (pick 0 to 3):
${menuLines(PARTS)}
Stands:
${menuLines(STANDS)}
Knob moves (3 different ones):
${menuLines(KNOB_MOVES)}
Button moves:
${menuLines(BUTTON_MOVES)}
  patterns: ${PATTERNS.join(", ")}
  stickers: ${STICKERS.join(", ")}
Joystick moves:
${menuLines(JOYSTICK_MOVES)}
Ignite reveals:
${menuLines(REVEALS)}
Stages: ${Object.keys(STAGES).join(", ")}

Pick the base, parts, knob moves and reveal that make the most sense for the topic, and name
every control in the topic's own words (Height, Frosting, Fire it). The "up" and "down"
sentences teach one small true thing about the topic each time. Use bright, friendly colors.`,
    user: `Topic: ${JSON.stringify(String(topic).slice(0, 80))}${
      idea ? `\nThe kid picked this idea: ${JSON.stringify(String(idea).slice(0, 120))}` : ""
    }`,
  };
}
