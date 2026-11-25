// The five Spark journeys. A journey is a coded game framework (Declan's code).
// The AI only fills in content and presentation, and picks behaviors from each
// journey's coded menu. It never writes mechanics.
//
// This file is shared by the browser (studio/) and the server functions (functions/).

export const JOURNEYS = [
  {
    id: "change-it",
    name: "Change It",
    verb: "Shape and style a thing, then reveal it",
    engine: "p5.js",
    built: true,
  },
  {
    id: "hear-it",
    name: "Hear It",
    verb: "Record, bend and stack sounds into a song",
    engine: "Tone.js",
    built: false,
  },
  {
    id: "catch-it",
    name: "Catch It",
    verb: "Catch the good things, dodge the rest",
    engine: "Phaser",
    built: false,
  },
  {
    id: "explore-it",
    name: "Explore It",
    verb: "Travel through a world and find things out",
    engine: "Phaser + Tiled",
    built: false,
  },
  {
    id: "build-it",
    name: "Build It",
    verb: "Build a machine and watch the physics play out",
    engine: "Matter.js",
    built: false,
  },
];

export const JOURNEY_IDS = JOURNEYS.map((j) => j.id);

export function journeyById(id) {
  return JOURNEYS.find((j) => j.id === id) || null;
}

// Fit words shown on the Ranked screen, from 1 (could work) to 5 (great fit).
export function fitWord(fit) {
  if (fit >= 5) return "Great fit";
  if (fit >= 4) return "Good fit";
  if (fit >= 2) return "Could work";
  return "A stretch";
}
