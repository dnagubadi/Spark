// Offline mode: what Spark does when there's no AI (no API key, no Wi-Fi at the expo).
// Ranking uses simple keyword hints, and Change It uses hand-written starter Sparks
// or a fill-in-the-blanks template. Good for demos and for testing the journey code.

import { JOURNEYS } from "./journeys.js";
import { cleanTopic, normalizeRank } from "./rank.js";

const HINTS = {
  "hear-it": ["music", "drum", "song", "sound", "band", "guitar", "piano", "bird", "bottle", "voice", "whale", "rain", "thunder"],
  "catch-it": ["volcano", "rain", "storm", "thunder", "snow", "bee", "fish", "meteor", "lava", "asteroid", "fruit", "bug"],
  "explore-it": ["ocean", "sea", "turtle", "space", "moon", "planet", "forest", "jungle", "cave", "city", "desert", "dinosaur", "trip", "river"],
  "build-it": ["rollercoaster", "bridge", "marble", "machine", "car", "rocket", "tower", "skateboard", "domino", "ramp", "robot"],
  "change-it": ["pottery", "pot", "vase", "cake", "cupcake", "pizza", "shoe", "sneaker", "robot", "hat", "bottle", "cookie", "fashion", "clay", "monster", "candle", "pumpkin"],
};

export function offlineRank(topic) {
  const t = cleanTopic(topic).toLowerCase() || "your topic";
  const ideas = JOURNEYS.map((j) => {
    const hit = (HINTS[j.id] || []).some((w) => t.includes(w));
    return {
      journey: j.id,
      fit: hit ? 5 : j.id === "change-it" ? 4 : 2,
      title: `${j.name}: ${t}`,
      pitch: `${j.verb}, all about ${t}.`,
    };
  });
  return normalizeRank({ ok: true, topic: t, ideas }, topic);
}

// ---------- Hand-written Change It starters ----------

const STARTERS = [
  {
    match: ["pottery", "pot", "vase", "clay", "ceramic"],
    body: {
      title: "Spin a Pot",
      content: {
        thing: "pot",
        tryThis: "Turn Height all the way up.",
        stage: "peach",
        shape: { base: "vase", parts: [], stand: "wheel", color: "#2F6FED", accent: "#1B2A4A" },
        panelTitle: "GLAZE",
        reveal: {
          title: "THE KILN",
          text: "When it looks right, press Ignite to fire it. Glazes change color in the heat, so the reveal is a surprise.",
          after: "Your pot came out of the kiln hard, shiny and ready for flowers.",
        },
        fact: "People have been making pots out of clay for more than 20,000 years.",
      },
      controls: {
        joystick: { label: "Spin the wheel", does: "spin" },
        knobs: [
          { label: "Height", does: "stretch-tall", low: "Short", high: "Tall", start: 45, up: "Your pot got taller. Tall, narrow pots are great for flowers.", down: "Your pot got shorter. Short pots are steady and hard to tip over." },
          { label: "Width", does: "stretch-wide", low: "Thin", high: "Wide", start: 50, up: "Your pot got wider. Wide pots hold lots of soup.", down: "Your pot got thinner. Potters squeeze the clay in with their hands." },
          { label: "Curve", does: "bend-sides", low: "Straight", high: "Round", start: 55, up: "The sides got rounder, like a belly. Round pots are strong.", down: "The sides got straighter, like a cup." },
        ],
        buttons: [
          { label: "Blue glaze", does: "color", value: "#2F6FED" },
          { label: "Sun glaze", does: "color", value: "#FFD23F" },
          { label: "Sky glaze", does: "color", value: "#D6EBFF" },
          { label: "Speckles", does: "pattern", value: "speckles" },
        ],
        ignite: { label: "Fire it", does: "fire" },
      },
    },
  },
  {
    match: ["cake", "cupcake", "bake", "birthday", "dessert", "bread"],
    body: {
      title: "Cake Lab",
      content: {
        thing: "cake",
        tryThis: "Make your cake really tall.",
        stage: "sun",
        shape: { base: "box", parts: ["candles"], stand: "plate", color: "#FFD9C2", accent: "#A33A12" },
        panelTitle: "FROSTING",
        reveal: {
          title: "THE OVEN",
          text: "Press Ignite to bake it. Heat makes tiny gas bubbles in the batter grow, so cakes rise.",
          after: "Your cake rose and turned golden. Time to share a slice!",
        },
        fact: "Baking soda makes bubbles of carbon dioxide, the same gas you breathe out.",
      },
      controls: {
        joystick: { label: "Turn the plate", does: "spin" },
        knobs: [
          { label: "Layers", does: "stretch-tall", low: "Flat", high: "Tall", start: 40, up: "More layers! Tall cakes need strong frosting to stay up.", down: "Fewer layers. A flat cake bakes faster." },
          { label: "Size", does: "stretch-wide", low: "Tiny", high: "Huge", start: 50, up: "A bigger cake feeds more friends.", down: "A tiny cake, like a cupcake." },
          { label: "Puff", does: "puff-top", low: "Flat", high: "Domed", start: 30, up: "The top puffed up, like when the oven is extra hot.", down: "The top went flat and smooth." },
        ],
        buttons: [
          { label: "Strawberry", does: "color", value: "#FFB3C7" },
          { label: "Chocolate", does: "color", value: "#7A4A2A" },
          { label: "Sprinkles", does: "pattern", value: "dots" },
          { label: "Cherry star", does: "sticker", value: "star" },
        ],
        ignite: { label: "Bake it", does: "bake" },
      },
    },
  },
  {
    match: ["robot", "machine", "android", "computer"],
    body: {
      title: "Robot Maker",
      content: {
        thing: "robot",
        tryThis: "Give your robot a wobbly body.",
        stage: "sky",
        shape: { base: "box", parts: ["face", "antenna", "wheels"], stand: "table", color: "#8A97B0", accent: "#1B2A4A" },
        panelTitle: "PAINT",
        reveal: {
          title: "POWER ON",
          text: "Press Ignite to switch it on. Robots need power before their sensors and motors can work.",
          after: "Beep boop! Your robot is awake and glowing.",
        },
        fact: "The word robot comes from a Czech word that means hard work.",
      },
      controls: {
        joystick: { label: "Steer the robot", does: "tilt" },
        knobs: [
          { label: "Height", does: "stretch-tall", low: "Short", high: "Tall", start: 50, up: "Taller robots can reach high shelves.", down: "Shorter robots are harder to knock over." },
          { label: "Wobble", does: "wobble", low: "Smooth", high: "Bumpy", start: 10, up: "Bumps and bolts! Real robots have screws holding them together.", down: "Smooth and sleek, like a space robot." },
          { label: "Head", does: "taper", low: "Small", high: "Big", start: 50, up: "A bigger top, with room for more sensors.", down: "A smaller top, light and quick." },
        ],
        buttons: [
          { label: "Silver", does: "color", value: "#C9CED8" },
          { label: "Red", does: "color", value: "#E5484D" },
          { label: "Stripes", does: "pattern", value: "stripes" },
          { label: "Lightning", does: "sticker", value: "bolt" },
        ],
        ignite: { label: "Power on", does: "sparkle" },
      },
    },
  },
  {
    match: ["bottle", "water bottle", "jar"],
    body: {
      title: "Design a Bottle",
      content: {
        thing: "bottle",
        tryThis: "Stretch your bottle really tall.",
        stage: "sky",
        shape: { base: "bottle", parts: ["lid"], stand: "table", color: "#2F6FED", accent: "#1B2A4A" },
        panelTitle: "STYLE",
        reveal: {
          title: "ICE COLD",
          text: "Press Ignite to chill it. Cold water makes tiny drops appear on the outside of a bottle.",
          after: "Your bottle is frosty and ready for a hot day.",
        },
        fact: "Those drops on a cold bottle come from the air, not from inside the bottle.",
      },
      controls: {
        joystick: { label: "Turn the bottle", does: "spin" },
        knobs: [
          { label: "Height", does: "stretch-tall", low: "Short", high: "Tall", start: 55, up: "Taller bottles hold more water.", down: "Short bottles fit in a lunchbox." },
          { label: "Width", does: "stretch-wide", low: "Slim", high: "Chunky", start: 45, up: "Chunky bottles are easy to grab.", down: "Slim bottles fit in a cup holder." },
          { label: "Grip", does: "wobble", low: "Smooth", high: "Grippy", start: 20, up: "Bumps help your hand hold on when it's wet.", down: "Smooth and simple." },
        ],
        buttons: [
          { label: "Ocean", does: "color", value: "#2F6FED" },
          { label: "Sunset", does: "color", value: "#FF7A1A" },
          { label: "Zigzags", does: "pattern", value: "zigzag" },
          { label: "Flower", does: "sticker", value: "flower" },
        ],
        ignite: { label: "Chill it", does: "freeze" },
      },
    },
  },
];

function capital(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// A fill-in-the-blanks Change It for any topic.
function template(topic) {
  const t = cleanTopic(topic).toLowerCase() || "thing";
  const word = t.split(" ").slice(-1)[0];
  return {
    title: `Design a ${capital(word)}`,
    content: {
      thing: word,
      tryThis: "Turn Height all the way up.",
      stage: "peach",
      shape: { base: "round", parts: ["face"], stand: "pedestal", color: "#FF7A1A", accent: "#1B2A4A" },
      panelTitle: "COLORS",
      reveal: {
        title: "THE BIG REVEAL",
        text: `When your ${word} looks just right, press Ignite to show it off.`,
        after: `Ta-da! Your ${word} is finished.`,
      },
      fact: "",
    },
    controls: {
      joystick: { label: `Spin the ${word}`, does: "spin" },
      knobs: [
        { label: "Height", does: "stretch-tall", low: "Short", high: "Tall", start: 50, up: `Your ${word} got taller.`, down: `Your ${word} got shorter.` },
        { label: "Width", does: "stretch-wide", low: "Thin", high: "Wide", start: 50, up: `Your ${word} got wider.`, down: `Your ${word} got thinner.` },
        { label: "Wiggle", does: "wobble", low: "Smooth", high: "Wiggly", start: 15, up: "The edges got wiggly.", down: "The edges got smooth." },
      ],
      buttons: [
        { label: "Orange", does: "color", value: "#FF7A1A" },
        { label: "Blue", does: "color", value: "#2F6FED" },
        { label: "Dots", does: "pattern", value: "dots" },
        { label: "Star", does: "sticker", value: "star" },
      ],
      ignite: { label: "Show it off", does: "sparkle" },
    },
  };
}

export function offlineDraft(journey, topic) {
  if (journey !== "change-it") throw new Error(`No offline draft for ${journey}`);
  const t = cleanTopic(topic).toLowerCase();
  const starter = STARTERS.find((s) => s.match.some((w) => t.includes(w)));
  return structuredClone(starter ? starter.body : template(t));
}

export const STARTER_TOPICS = ["pottery", "a birthday cake", "robots", "a water bottle"];
