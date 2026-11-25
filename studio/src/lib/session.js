// The current kid's visit. Cleared when the next explorer walks up.
// Saved Sparks live in Today's Sparks (store.js), not here.

export const session = {
  topic: "",
  lockedJourney: null, // a journey chip picked on the Ask screen
  rank: null,          // last ranking result
  working: null,       // the Spark being played or remixed, maybe not saved yet
  pickedIdea: null,
  remixHistory: [],
};

export function resetSession() {
  session.topic = "";
  session.lockedJourney = null;
  session.rank = null;
  session.working = null;
  session.pickedIdea = null;
  session.remixHistory = [];
  document.documentElement.dataset.big = "false";
}
