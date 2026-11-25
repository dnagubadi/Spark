// Station settings. Change these to try the open design questions.

export const CONFIG = {
  // Open question: should the AI pick the journey for a brand-new kid?
  // false = show the Ranked screen (kid picks; matches the Nov 24 decision).
  // true  = skip straight to the best-fit journey that's built (kid can still Remix).
  autoPickJourney: false,

  // Expo handoff: after this many quiet seconds, ask "Still exploring?"
  idleSeconds: 120,
  // ...then reset to the Ask screen after this many more.
  idleCountdownSeconds: 20,

  // Ideas on the Ask screen.
  ideas: ["volcanoes", "pottery", "a water bottle", "sea turtles", "rollercoasters", "thunderstorms"],
  tryAnotherIdeas: ["pizza", "the moon", "skateboards", "dinosaurs", "drums"],
};
