// "All done, next explorer!" (or the idle timer): clear this kid's visit and go
// back to Ask. Today's Sparks stay for everyone.
import { resetSession } from "./session.js";
import { go } from "./router.js";

export function nextExplorer() {
  resetSession();
  document.getElementById("overlay-root")?.replaceChildren();
  go("/ask");
}
