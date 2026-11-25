// Change It: the coded behavior menu.
//
// Everything the AI (or a kid in Remix) can choose for a Change It Spark is listed
// here. The drawing code in studio/src/journeys/change-it/scene.js knows how to do
// every item. If something isn't on this menu, it can't happen, so a Spark can't break.
//
// To add a new move: add it here, then teach scene.js how to draw it.

// What the thing is built from: the main body outline.
export const BASES = {
  vase: "a vase or pot with a curvy belly",
  bowl: "a wide, low bowl",
  round: "a round ball or blob",
  box: "a box or block with straight sides",
  cone: "a cone, wide at the bottom, pointy at the top",
  tower: "a tall tower or tube",
  bottle: "a bottle with a narrow neck",
};

// Extra bits stuck onto the body. A Spark can use up to 3.
export const PARTS = {
  handles: "two handles on the sides",
  lid: "a lid with a knob on top",
  spout: "a spout on one side",
  face: "two eyes and a smile",
  legs: "little legs underneath",
  antenna: "an antenna on top",
  candles: "candles on top",
  leaf: "a stem and a leaf on top",
  wings: "a wing on each side",
  wheels: "two wheels at the bottom",
};
export const MAX_PARTS = 3;

// What the thing sits on.
export const STANDS = {
  wheel: "a spinning potter's wheel",
  plate: "a plate",
  pedestal: "a museum pedestal",
  table: "a tabletop",
  none: "nothing, it floats",
};

// What a knob can do. Each Spark gives its 3 knobs 3 different moves.
export const KNOB_MOVES = {
  "stretch-tall": "makes it taller or shorter",
  "stretch-wide": "makes it wider or thinner",
  "bend-sides": "bends the sides from straight to round",
  wobble: "adds wiggly bumps to the outline",
  taper: "makes the top narrower or wider than the bottom",
  "puff-top": "puffs the top part out",
};

// What a button can do.
export const BUTTON_MOVES = {
  color: "paints the whole thing one color",
  pattern: "adds a pattern on top",
  sticker: "sticks a sticker on the front",
};
export const PATTERNS = ["speckles", "stripes", "zigzag", "dots"];
export const STICKERS = ["star", "heart", "spark", "flower", "bolt"];

// What the joystick does.
export const JOYSTICK_MOVES = {
  spin: "spins it around",
  tilt: "tilts it side to side",
};

// What Ignite does: the big reveal at the end.
export const REVEALS = {
  fire: "fires it in a kiln: colors deepen and it turns shiny",
  bake: "bakes it: it rises a little, turns golden and steams",
  sparkle: "magic sparkles swirl around it and it glows",
  freeze: "freezes it: frost and icy blue shimmer",
};

// The stage behind the thing. Named Spark palette colors only.
export const STAGES = {
  peach: "#FFE9DA",
  sky: "#E3F0FF",
  cream: "#FFF6EA",
  sun: "#FFF0B3",
};

export const KNOB_IDS = Object.keys(KNOB_MOVES);
export const BUTTON_IDS = Object.keys(BUTTON_MOVES);
