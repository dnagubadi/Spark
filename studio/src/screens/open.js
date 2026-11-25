// Take-home links (#/open/<packed Spark>) and share codes (#/code/COMET-CLAY-42).
import { h } from "../lib/dom.js";
import { go } from "../lib/router.js";
import { session } from "../lib/session.js";
import { decodeSpark } from "../lib/share.js";
import { findByCode } from "../lib/store.js";
import { normalizeSpark } from "../../../shared/spark-format.js";
import { studioHeader } from "../ui/header.js";

export async function openScreen({ packed }) {
  try {
    const spark = normalizeSpark(await decodeSpark(packed));
    // A take-home copy is a new Spark on this device: fresh id, no share code yet.
    const now = new Date().toISOString();
    session.working = { ...spark, id: `sp_${Date.now().toString(36)}home`, shareCode: null, source: "shared", createdAt: now, updatedAt: now };
    go("/play/working");
  } catch (err) {
    console.error(err);
    return problem("That link didn't open", "It may have been cut off when it was copied. Try scanning the code again.");
  }
}

export function codeScreen({ code }) {
  const spark = findByCode(code);
  if (spark) {
    session.working = spark;
    return go(`/play/${spark.id}`);
  }
  return problem("We couldn't find that code", "Share codes work at the station where the Spark was made. Scan the QR code to open it anywhere.");
}

function problem(title, lead) {
  return h("div", { class: "screen" },
    studioHeader(),
    h("main", { id: "main", class: "center" },
      h("h1", {}, title),
      h("p", { class: "lead" }, lead),
      h("a", { class: "btn btn-primary btn-lg", href: "#/ask" }, "Make a new Spark"),
    ),
  );
}
