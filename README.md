# Spark

A creative toolkit for kids: a digital studio where AI drafts a playable Spark from anything you're curious about, plus a USB controller called the Spark-Plug. Senior capstone, ATLS 4519, CU Boulder.

| Folder | What it is |
| --- | --- |
| `studio/` | **Spark Studio**, the real build (Vite + plain JavaScript). Ask, Ranked, Play, Remix, Today's Sparks, Take it home. |
| `shared/` | Code the studio and the server both use: the Spark format, the five journeys, the Change It behavior menu, the AI prompts and schemas, offline mode. |
| `functions/api/` | Server functions (Cloudflare Pages Functions) that call Claude. The API key lives here, never in the browser. |
| `server/` | Helpers for those functions, plus the dev-server bridge that runs them locally. |
| `tests/` | `npm test`: checks that a Spark can only ever use moves from the coded menu. |
| `docs/` | The Spark documentation site (plain HTML/CSS, no build step). |
| `prototype/` | The Nov 16 Change It prototype, kept for reference. |

## Run it in VS Code

You need [Node.js](https://nodejs.org) 20 or newer (`node -v` to check).

```bash
git clone https://github.com/dnagubadi/spark.git
cd spark
npm install
npm run dev
```

That opens Spark Studio at http://localhost:5173 with hot reload: save a file and the page updates.

**Without an API key it runs in offline mode.** Ranking uses keyword hints and Change It uses hand-written starter Sparks (pottery, cake, robots, water bottle) or a fill-in-the-blanks template. You'll see an "Offline ideas" / "Offline draft" tag when that happens. It's also the backup for the expo if the Wi-Fi drops.

**To turn on AI drafting:**

1. Get a key at https://console.anthropic.com (Settings > API keys).
2. Copy `.dev.vars.example` to `.dev.vars` and paste the key after `ANTHROPIC_API_KEY=`.
3. Restart `npm run dev`.

`.dev.vars` is git-ignored, so the key never gets committed.

### Other commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Studio + `/api` functions with hot reload (use this day to day) |
| `npm test` | Runs the tests in `tests/` |
| `npm run build` | Builds the studio into `dist/` |
| `npm run preview:cf` | Builds, then runs it exactly the way Cloudflare Pages will (`wrangler pages dev`, port 8788) |

### Trying it without a Spark-Plug

Every control works on screen (tap, drag the knobs, arrow keys). The keyboard can also stand in for the controller:

| Spark-Plug | Keys |
| --- | --- |
| Knob 1 / 2 / 3 | Q W / A S / Z X (down / up) |
| Buttons 1 to 4 | 1 2 3 4 |
| Ignite | Enter |
| Joystick | J L (left / right) |

When the Pico is ready, it should show up as a standard USB gamepad. The axis and button numbers it needs to send are in `GAMEPAD_MAP` in `studio/src/lib/plug.js`.

## How it fits together

```
Ask ─► /api/rank (AI scores the topic for all 5 journeys) ─► Ranked ─► kid picks
     └─ not kid-safe or not a topic ─► Try another topic
Pick ─► /api/draft (AI fills content + picks behaviors from the menu) ─► Play
Play ─► Remix (rename, pick from the same menus) ─► Save ─► Today's Sparks ─► Take it home
"All done, next explorer!" or 2 quiet minutes ─► back to Ask for the next kid
```

- **Journeys are coded frameworks.** The AI never writes mechanics. It returns JSON that must match a schema built from the journey's menu (`shared/change-it/menu.js`), and `normalize.js` checks it again. To teach Change It a new move, add it to the menu, then teach `studio/src/journeys/change-it/scene.js` to draw it.
- **The Spark format** (`shared/spark-format.js`) is the one JSON shape every Spark is saved in: journey, topic, content, controls, plus the AI's first draft so Remix can show "AI drafted this" vs "You changed this".
- **Today's Sparks** is stored in the station's browser for now (one shared station, no kid accounts). Supabase will replace this.
- **Take it home** gives a share code (works at the station) and a QR code that carries the whole Spark inside the link, so it opens on a phone with no server.
- **Station settings** (idle timer, idea chips, whether the AI picks the journey) are in `studio/src/config.js`.

## Deploying to Cloudflare Pages

1. In Cloudflare: Workers & Pages > Create > Pages > Connect to Git, pick this repo.
2. Build command `npm run build`, output directory `dist`. The `functions/` folder is picked up automatically.
3. Settings > Variables and Secrets: add `ANTHROPIC_API_KEY` as a secret.

## Docs site preview

No build step. From the repo root: `python3 -m http.server 8080`, then open http://localhost:8080/docs/.
