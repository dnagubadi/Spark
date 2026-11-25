# Spark: notes for Claude Code

This repo holds Spark, Declan's capstone (ATLS 4519, CU Boulder). Read the project brief below before making changes.

## Repo layout

| Folder | What it is |
| --- | --- |
| `studio/` | Spark Studio, the real build (Vite + plain JS, started Nov 25, 2026). Screens in `studio/src/screens/`, journeys in `studio/src/journeys/`. |
| `shared/` | Used by both the studio and the server: Spark format, journeys list, Change It behavior menu, AI prompts/schemas, offline mode. |
| `functions/api/` | Cloudflare Pages Functions that call Claude (`rank`, `draft`, `health`). `server/claude.js` holds the one Claude call. |
| `tests/` | `npm test` (node:test). |
| `docs/` | The Spark documentation site (moved from `Senior_Projects/spark-site`). Plain HTML/CSS/JS, no build step. Section text lives in `docs/content/docs/*.md`. |
| `prototype/` | The Nov 16 Change It prototype (`window.claude` artifact runtime), kept for reference. |

Run: `npm install`, then `npm run dev` (offline mode without a key; put `ANTHROPIC_API_KEY` in `.dev.vars` for AI drafting).

## Working rules

- Never call Spark an "app". It is a creative toolkit / studio.
- Journeys are coded frameworks. The AI fills in content and presentation and picks behaviors from a coded menu; it never writes game mechanics.
- Build journeys on open source engines (Tone.js/Strudel, Twine, Matter.js, p5.js, Phaser + Tiled, Blockly) rather than from scratch.
- AI calls go through `functions/api/*` (server side). Never put an API key in front-end code. The old prototype in `prototype/` still uses `window.claude`.
- The AI only returns JSON matching schemas built from each journey's menu (`shared/<journey>/menu.js`), and `normalize` re-checks it. New behaviors are added to the menu and the drawing code, never generated.
- Planned hosting: Cloudflare Pages. Planned data: Supabase.
- Never invent what Prof. Aaron Neyer said in graded work.

## Status since the brief

- Nov 16, 2026: working Change It prototype (now `prototype/change-it-v0.html`). Next: test 15 to 20 topics, tune the behavior menu, then deploy to Cloudflare around early December.
- Nov 25, 2026: Spark Studio scaffold in `studio/`: Ask (topic + journey chips), AI ranking of all five journeys, Ranked, Try another topic, Change It end to end (p5.js), Remix form, Today's Sparks, Take it home (share code + QR link), next-explorer handoff with 2-minute idle reset, Spark-Plug gamepad + keyboard input, offline mode. Other four journeys show "coming soon".
- Goal: the digital side running by the end of fall 2026; the Spark-Plug controller next semester.

---

# Spark: project brief

*A self-contained summary of Declan's Spark capstone, written so another project (or another AI assistant) can pick up the context without needing the original conversations. Last updated November 9, 2026.*

---

## 1. At a glance

| | |
|---|---|
| **What it is** | Spark is a creative toolkit for kids: a digital studio where AI drafts a playable "Spark" from anything you're curious about, plus a physical USB controller called the **Spark-Plug**. |
| **Tagline** | "A digital studio for exploring what you love." |
| **Who made it** | Declan (GitHub: `dnagubadi`), senior capstone, Creative Technology & Design |
| **Course** | ATLS 4519, CU Boulder |
| **Faculty adviser / sounding board** | Prof. Aaron Neyer (ATLS) |
| **Audience** | Curious kids first (the design baseline), then teens and families |
| **Final showing** | Spring expo, with a museum-style demo station |
| **Status (Nov 2026)** | Pitch delivered; documentation website live; Sound Lab wireframes and a 3D-modeled controller exist. No working software yet. |

**Words to use:** Spark (the product and also one creation, "a Spark"), Spark Studio (the editor), My Sparks (saved creations), Spark-Plug (the controller), journey (a reusable game template), Ignite (the big button).
**Words to avoid:** don't call Spark an "app". It is a toolkit / studio / creation tool.

---

## 2. The problem and the big question

People often have something they'd love to try (music, art, science) but never start, because:

- trying something new feels scary, and they're afraid of being bad at it,
- it's hard to know where to begin,
- most classes and exhibits begin with facts instead of fun.

**Big question:** *What if chasing a passion felt like play?*

> Note: an earlier version framed the problem around museum exhibits being stuck on one topic. Declan corrected this. The core problem is fear of, or being put off by, pursuing something you're passionate about. Museums are now only a comparison point.

---

## 3. The idea

You pick anything you're curious about, AI builds a first version you can play with on a real controller, and then you change it and share it in Spark Studio.

### The five steps (Ask, Build, Play, Remix, Share)

1. **Pick a topic** (anything you're curious about).
2. **AI makes a first draft**, a playable Spark.
3. **Play it with the Spark-Plug** controller.
4. **Remix it** in Spark Studio.
5. **Save and share it** (it goes to My Sparks).

**Example:** Maya picks volcanoes, heats the magma with a knob, edits her island in Spark Studio, and shares it with her friends.

### User flow

Open Spark → choose a subject → AI builds your Spark → play.
- If you save it, it goes to **My Sparks**, where you can edit it, build a new one from scratch, or share it.
- If not, you just try another subject.

### Where Spark lives

Spark is a creation tool, not a museum installation (it pivoted from an installation concept on Oct 5, 2026). At the spring expo it gets a **museum-style setup**, but the same controller, interface and five steps work **at home on a laptop, in a classroom, or passed around with friends**. Sparks save to My Sparks so you can pick them up anywhere.

### Museum vs. Spark (the comparison Declan keeps)

| | Museum exhibit | Spark |
|---|---|---|
| Who makes the experience | The museum | The kid, with an AI first draft |
| Topic | One fixed topic per exhibit | Any subject |
| Where | Only on site | Expo station, home, classroom, anywhere |
| After the visit | Usually no next step | Your Spark is saved, editable and shareable |

---

## 4. Precedents / inspiration

| Project | What it is | Like Spark | Different |
|---|---|---|---|
| **Project Genie** (Google DeepMind, 2026) | Describe a world, AI generates it, explore it in real time | Any subject, AI-made | Screen only |
| **Dataland** (Refik Anadol, LA, 2026) | AI art museum with immersive generated visuals | AI, immersive | You only watch |
| **Exploratorium** (San Francisco) | Hands-on science exhibits | Physical, hands-on play | Each exhibit sticks to one topic |

Spark takes the best of each: any subject, AI, and real hands-on play. TunePad also appeared in early research screenshots as a possible precedent (unconfirmed).

---

## 5. How a Spark works (frameworks)

- **Journeys:** a journey is a game template that the AI fills in for whatever subject you pick. The plan is 4 to 5 starter journeys. The same journey can become an ocean, a volcano or a band, because the AI supplies the world, characters and goals.
- **The Spark format:** every Spark is saved in one common format so it can be played on the controller, edited in Spark Studio and shared. Designing this format (likely JSON) is an early next step. What exactly a Spark file holds (subject, journey, world, control labels, etc.) is still undecided.
- **Controls that relabel themselves:** the Spark-Plug always has the same physical controls, but the AI gives each one a new job when a new Spark loads.
- **The pattern every Spark follows:** try something, see what changes, then build on it.

### Example framework: the Sound Lab

The most developed Spark so far, with a 7-screen wireframe board (kiosk screens at 1440 × 900):

1. **Welcome, two ways in.**
   - *Guided path:* Record → Add effects → Build a track. "Say something into the mic." Nothing is saved or sent anywhere.
   - *Free playground:* three doors, "See a sound", "Bend a sound", "Stack sounds", plus optional challenges ("Make it spooky", "Make it tiny", "Make it a robot"). "Pick anything. You can't break it."
2. **Pedalboard, guided or playground.**
   - *Guided:* one pedal at a time. "Turn one knob. Watch what happens." A live caption explains the effect ("Your voice now echoes, like you're in a big empty hall"), with a colour-coded waveform and an A/B off-vs-on toggle.
   - *Playground:* build your own pedal chain (Distort, Reverb, Filter). Order of operations becomes the lesson, since the same two pedals sound different when swapped.
3. **See it and stack it:** visualizers and a recorder; stack up to three sounds into a track.

Accessibility choices baked in: always-visible "Bigger text" toggle, captions when there are no headphones, full keyboard equivalents (Tab moves, Space does, Shift+arrows to reorder), "Start over" always available, and only one thing changes on screen at a time so cause and effect is unmissable.

---

## 6. The Spark-Plug controller

A USB controller with a **joystick, 3 knobs, 4 buttons and a big half-dome Ignite button**. Explained to kids by comparison with playground play panels:

| Control | Like on a playground | What it does |
|---|---|---|
| Joystick | The steering wheel | Drive around your world |
| 3 knobs | The spinners | Change speed, size or heat |
| 4 buttons | The push buttons | Make things happen |
| Ignite | The big bell | Create something new |

Earlier example of relabeling per Spark:

| Control | Ocean Spark | Music Spark |
|---|---|---|
| Joystick | Swim around | Move between instruments |
| Knob 1 | Depth | Tempo |
| Knob 2 | Temperature | Mood |
| Ignite | Make a new creature | Write a new riff |

**3D model:** modeled in Blender as a 240 × 140 × 45 mm enclosure (fits a 256 mm printer bed), with hole sizes for standard arcade parts. STL files (enclosure, knob cap, Ignite cap, full assembly) and the parametric script `sparkplug.py` live in Declan's `capstone research/sparkplug-model/` folder. Real parts still need measuring before printing.

**Planned electronics:** Raspberry Pi Pico running CircuitPython, appearing over USB as a standard gamepad so the browser reads it through the Gamepad API with no driver.

---

## 7. Faculty feedback (Aaron Neyer, Sounding Board meeting, Mon Oct 5, 2026)

What Aaron said, as Declan reported it:

- The idea is really cool and not outside Declan's scope, given the tools he has.
- Work on the **learning frameworks and generative (AI) features now**, before building the controller.
- **Get good at JSON and SQL.**

They also discussed implementation, tools, design choices, user research, testing, and the future of AI and ethics, but no specific feedback from Aaron on testing or AI ethics was recorded. **Do not invent or paraphrase anything else as Aaron's words.**

This sets the build order: frameworks + AI generation first, controller hardware after.

---

## 8. Technical direction (recommendations, not yet built)

These came from research threads. They are suggestions Declan hasn't committed to.

**Studio / playable side**
- **Phaser:** runs each Spark as a small 2D browser game.
- **Tone.js:** powers the Sound Lab (recording, chainable effects, layering).
- **Blockly:** the "remix" step, so kids change the AI's draft by snapping blocks instead of reading code.
- **Supabase:** accounts, My Sparks, and sharing (Postgres, which lines up with "get good at SQL").

**AI**
- Recommended hosted model: Claude (a Sonnet-class model) for generating working game configs. Offline backup: an open Qwen coder model through Ollama so the expo station works without Wi-Fi.
- Key design choice: **don't have the AI write whole games from scratch.** Give it a template per journey (Sound Lab, volcano world, etc.) and have it fill in settings, art prompts and small bits of logic, returned as **JSON** that Phaser renders.
- The API key can't live in the static site. The AI call should go through a small server function (Vercel or Netlify) with the key stored as a secret.
- Kids should never need their own accounts or OAuth. If accounts come later, a parent or teacher signs in (keeps clear of child-privacy rules).

**First feature suggested (Week 7 APIs class):** a kid types "a cat dodging raindrops", a serverless function asks the AI for a small game config in JSON, and Phaser plays it. Warm-up alternative: Open-Meteo weather on the home page (no key needed).

**Fabrication:** FreeCAD/OpenSCAD or Blender for the enclosure, PrusaSlicer/Cura to print, KiCad if a custom circuit board is needed later.

---

## 9. Learning frameworks Declan is researching

- **Resnick's 4 Ps of Creative Learning** (Projects, Passion, Peers, Play), MIT Learning Creative Learning. Recommended lead framework.
- **Computational Thinking framework** (Brennan & Resnick, Harvard/Scratch): "remixing and reusing" is a named core practice.
- **Exploratorium Learning Dimensions of Making and Tinkering**: bridges the museum origin and the creation tool. Recommended lead framework.
- **Agency by Design** and **Project Zero Thinking Routines** (Harvard): maker-centered learning, reflection prompts for the share step.
- **AI4K12 Five Big Ideas** and **MIT RAISE**: for the AI literacy angle. Recommended third framework.
- **LEGO Foundation Learning Through Play** (joyful, actively engaging, meaningful, iterative, socially interactive): a checklist for evaluating Spark.
- **Self-Determination Theory** (autonomy, competence, relatedness): why kids keep creating.
- **CAST UDL Guidelines 3.0**: justifies two ways to create (screen and controller).
- **Falk & Dierking's Contextual Model of Learning**: the standard museum-learning framework, for the museum comparison.

---

## 10. Deliverables for the spring expo

1. The **Spark-Plug** controller
2. The **Spark web platform** (Spark Studio, My Sparks, sharing)
3. **4 to 5 starter journeys** (Sound Lab is the first worked example)
4. A **museum-style demo station**, with the same setup working at home

### Next steps (from the pitch, reordered after Aaron's feedback)

1. Design the learning framework and the first journey.
2. Build a first Spark with AI (generative features), practicing JSON and SQL along the way.
3. Prototype the controller.
4. Test with real kids.

**Help wanted:** fabrication, art and sound, and playtesting. Declan leads the design.

---

## 11. Visual identity

- **Core motif:** an orange-and-blue hemisphere (orange half over blue half) with a yellow spark.
- **Palette:** orange and blue, plus navy, cream, peach, sky and a yellow accent. Bright orange and blue never sit behind text.
- **Fonts:** Bricolage Grotesque for headings, Atkinson Hyperlegible Next for body text.
- **Tone:** lighthearted, friendly and clear, without feeling childish or cluttered.
- **Kid-first design rules:** body text 18px+ on the web (16pt+ on slides), 48px-tall buttons, large tap targets, obvious navigation, visible focus states, never relying on color alone, accessible contrast.

---

## 12. Existing artifacts

| Artifact | Where |
|---|---|
| Documentation website (8 sections: General Idea, Idea, Precedence, Frameworks, Sparkplug, Research, Materials, Timeline; plus Sound Lab journey page and Sparkplug page) | Repo `github.com/dnagubadi/Senior-Projects`, folder `spark-site/`; published at `dnagubadi.github.io/Senior-Projects/spark-site/`. Plain HTML/CSS; doc copy is Markdown in `spark-site/content/docs/`. A parked home page (`home.html`) and design kit (`design.html`) are kept for later. |
| Pitch deck (12 slides, ~4 min, with speaker notes) | Google Slides: https://docs.google.com/presentation/d/1tq50Hjrrbg7V8NIKErXaxeLTfMtHBwi5cemwVucJ1rU/edit |
| Sounding Board reflection | Google Doc: https://docs.google.com/document/d/1yyHaPK-fdxMe-6qt_Sc3-DLN16nLIDwI4rETqiumptU/edit |
| Speaker notes, controller render, Sound Lab wireframes, site screenshots | Spark project files: `Spark speaker notes*.md`, `sparkplug-preview.png`, `sparkplug-enclosure.stl`, `sound-lab-page.png`, `spark-home.png`, `spark-docs.png`, `spark-museum-compare.png` |
| Controller STLs and Blender script; original slide text backup | `~/Desktop/capstone research/sparkplug-model/` and `spark-slides-backup/` |

---

## 13. Open questions (not yet decided)

- What exactly a Spark file holds (the JSON schema).
- Which 4 to 5 journeys to build beyond the Sound Lab.
- The final AI model and hosting choice.
- Real component sizes and costs for the Spark-Plug.
- User research findings and playtest plans with kids.
- Target months for each next step.

---

## 14. Ground rules for anyone continuing this work

- Don't call Spark an "app".
- Keep the museum comparison, but the problem is fear of pursuing a passion, not museums.
- Never invent what Aaron Neyer said, especially in graded work.
- Design for kids as the baseline: plain language, big targets, accessible.
- Priority order per faculty feedback: frameworks and AI generation before controller hardware.
