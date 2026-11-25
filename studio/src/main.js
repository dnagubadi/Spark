// Spark Studio: boot, routes, the expo idle reset and the Spark-Plug.
import "@fontsource/bricolage-grotesque/600.css";
import "@fontsource/bricolage-grotesque/800.css";
import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/atkinson-hyperlegible-next/700.css";
import "./styles/tokens.css";
import "./styles/app.css";

import { route, startRouter } from "./lib/router.js";
import { startPlug } from "./lib/plug.js";
import { startIdle } from "./lib/idle.js";
import { nextExplorer } from "./lib/handoff.js";
import { askScreen } from "./screens/ask.js";
import { sortingScreen } from "./screens/sorting.js";
import { rankedScreen } from "./screens/ranked.js";
import { tryAnotherScreen } from "./screens/try-another.js";
import { soonScreen } from "./screens/soon.js";
import { buildScreen } from "./screens/build.js";
import { playScreen } from "./screens/play.js";
import { remixScreen } from "./screens/remix.js";
import { galleryScreen } from "./screens/gallery.js";
import { openScreen, codeScreen } from "./screens/open.js";

route("/ask", () => askScreen());
route("/sorting", sortingScreen);
route("/ranked", rankedScreen);
route("/try-another", tryAnotherScreen);
route("/soon/:journey", soonScreen);
route("/build/:journey", buildScreen);
route("/play/:id", playScreen);
route("/remix/:id", remixScreen);
route("/sparks", () => galleryScreen());
route("/sparks/:id", galleryScreen);
route("/open/:packed", openScreen);
route("/code/:code", codeScreen);

startPlug();
startIdle(nextExplorer);
startRouter();
