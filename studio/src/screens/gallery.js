// 5 · Today's Sparks: the station's shared gallery, plus Take it home.
import { h } from "../lib/dom.js";
import { go } from "../lib/router.js";
import { listSparks, getSpark } from "../lib/store.js";
import { shareLink, drawQR } from "../lib/share.js";
import { nextExplorer } from "../lib/handoff.js";
import { journeyById } from "../../../shared/journeys.js";
import { studioHeader, navLink } from "../ui/header.js";
import { journeyIcon, plusIcon } from "../ui/icons.js";

const ART_BG = { "change-it": "#FFD9C2", "hear-it": "#D6EBFF", "catch-it": "#FFF0B3", "explore-it": "#DCE3F0", "build-it": "#FFF6EA" };

function time(iso) {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d) / 60000);
  return mins < 2 ? "just now" : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function card(spark, selected) {
  const j = journeyById(spark.journey);
  const remixed = JSON.stringify(spark.draft?.controls) !== JSON.stringify(spark.controls) || spark.draft?.title !== spark.title;
  const art = h("div", { class: "card-art", style: { background: ART_BG[j.id] }, "aria-hidden": "true" },
    h("div", { style: { width: "4.5rem", height: "4.5rem", borderRadius: "50%", background: spark.content?.shape?.color || "#FFFFFF", border: "3px solid #1B2A4A", display: "grid", placeItems: "center", color: "#1B2A4A" }, html: journeyIcon(j.id, 34) }),
  );
  return h("article", { class: `card${selected ? " is-selected" : ""}` },
    art,
    h("div", { class: "card-body" },
      h("h2", {}, spark.title),
      h("span", { class: "card-meta" }, [j.name, remixed && "remixed", time(spark.updatedAt)].filter(Boolean).join(" · ")),
      h("div", { class: "card-actions" },
        h("a", { class: "btn btn-primary", href: `#/play/${spark.id}` }, "Play"),
        h("a", { class: "btn", href: `#/remix/${spark.id}` }, "Edit"),
        h("a", { class: "btn", href: `#/sparks/${spark.id}`, "aria-current": selected ? "true" : null }, "Share"),
      ),
    ),
  );
}

function sharePanel(spark) {
  const canvas = h("canvas", { width: "352", height: "352", "aria-hidden": "true" });
  const linkNote = h("p", { class: "muted", style: { fontSize: "1rem" } });
  shareLink(spark)
    .then((url) => drawQR(canvas, url))
    .catch((err) => {
      console.error(err);
      linkNote.textContent = "The QR code didn't fit this Spark. Use the share code at this station.";
    });
  return h("aside", { class: "share", "aria-labelledby": "share-title" },
    h("h2", { id: "share-title" }, `Take ${spark.title} home`),
    h("p", {}, "Scan with a grown-up's phone, or write down the code. Anyone with it can play and remix their own copy."),
    h("div", { class: "code-box" },
      h("span", { class: "eyebrow" }, "Share code"),
      h("span", { class: "code" }, spark.shareCode),
    ),
    h("div", { class: "qr" }, canvas),
    linkNote,
    h("div", { style: { display: "flex", flexDirection: "column", gap: "0.625rem", marginTop: "auto" } },
      h("button", { class: "btn btn-primary btn-lg", type: "button", onclick: nextExplorer }, "All done, next explorer!"),
      h("span", { class: "muted", style: { fontSize: "1rem", textAlign: "center" } }, "The screen also resets by itself after 2 quiet minutes."),
    ),
  );
}

function codeForm() {
  const input = h("input", { id: "code", class: "input", type: "text", placeholder: "COMET-CLAY-42", autocomplete: "off", style: { textTransform: "uppercase" } });
  return h("form", { class: "panel", onsubmit: (e) => { e.preventDefault(); if (input.value.trim()) go(`/code/${input.value.trim().toUpperCase()}`); } },
    h("label", { for: "code", class: "eyebrow" }, "Have a share code?"),
    h("div", { style: { display: "flex", gap: "0.5rem" } }, input, h("button", { class: "btn btn-primary", type: "submit" }, "Open")),
  );
}

export function galleryScreen({ id } = {}) {
  const sparks = listSparks();
  const selected = id ? getSpark(id) : null;
  return h("div", { class: "screen" },
    studioHeader([navLink("#/ask", "New Spark")]),
    h("main", { id: "main", class: "gallery" },
      h("div", { style: { display: "flex", flexDirection: "column", gap: "1.25rem" } },
        h("div", {},
          h("h1", { style: { fontSize: "2.75rem" } }, "Today's Sparks at this station"),
          h("p", { class: "muted" }, "Everyone who visits today can play and remix these. Find yours by its name and picture."),
        ),
        h("div", { class: "gallery-grid" },
          h("a", { class: "card-new", href: "#/ask", html: `${plusIcon()}<span>Make a new Spark</span>` }),
          sparks.map((s) => card(s, s.id === selected?.id)),
        ),
        sparks.length === 0 && h("p", { class: "empty" }, "No Sparks saved yet today. Make one and press Save to see it here."),
      ),
      selected ? sharePanel(selected) : codeForm(),
    ),
  );
}
