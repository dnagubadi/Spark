import { defineConfig } from "vite";
import { pagesFunctions } from "./server/vite-pages-functions.js";

// Spark Studio lives in studio/. `npm run dev` serves it with hot reload and also
// runs the /api functions from functions/api so AI drafting works locally.
export default defineConfig({
  root: "studio",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500, // p5.js is big; fine for a station
  },
  server: {
    port: 5173,
    open: !process.env.CI && !process.env.NO_OPEN,
    fs: { allow: [".."] },
  },
  plugins: [pagesFunctions()],
});
