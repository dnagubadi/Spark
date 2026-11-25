// 2 · BUILD (AI): draft the Spark. The AI fills in looks and words and picks
// behaviors from the journey's coded menu.
import { go, currentPath } from "../lib/router.js";
import { session } from "../lib/session.js";
import { draftSpark } from "../lib/api.js";
import { journeyById } from "../../../shared/journeys.js";
import { createSpark } from "../../../shared/spark-format.js";
import { toast } from "../lib/dom.js";
import { loadingView } from "./sorting.js";

export function buildScreen({ journey }) {
  const j = journeyById(journey);
  if (!j || !session.topic) return go("/ask");
  if (!j.built) return go(`/soon/${journey}`);
  const here = currentPath();
  const idea = session.rank?.ideas.find((i) => i.journey === journey);
  (async () => {
    try {
      const { body, source } = await draftSpark({
        topic: session.topic,
        journey,
        idea: idea ? `${idea.title}: ${idea.pitch}` : undefined,
      });
      if (currentPath() !== here) return;
      session.working = createSpark({ topic: session.topic, journey, body, source });
      go("/play/working");
    } catch (err) {
      console.error(err);
      if (currentPath() !== here) return;
      toast("Spark couldn't draft that one. Try another topic?");
      go("/try-another");
    }
  })();
  return loadingView(`Drafting your ${j.name} Spark…`, `Spark is picking the shapes, words and controls for ${session.topic}.`);
}
