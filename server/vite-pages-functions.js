// Dev-only helper: lets `npm run dev` answer /api/* with the same files Cloudflare
// Pages runs in production (functions/api/<name>.js). Reads secrets from .dev.vars,
// the same file `wrangler pages dev` uses.

import fs from "node:fs";
import path from "node:path";

function readDevVars(root) {
  const file = path.join(root, ".dev.vars");
  const vars = {};
  if (!fs.existsSync(file)) return vars;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return vars;
}

export function pagesFunctions() {
  let root;
  return {
    name: "spark-pages-functions",
    configureServer(server) {
      root = path.resolve(server.config.root, "..");
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        const m = url.pathname.match(/^\/api\/([a-z0-9-]+)$/);
        if (!m) return next();
        const file = path.join(root, "functions", "api", `${m[1]}.js`);
        if (!fs.existsSync(file)) return next();

        try {
          const mod = await server.ssrLoadModule(file);
          const method = req.method.charAt(0) + req.method.slice(1).toLowerCase();
          const handler = mod[`onRequest${method}`] || mod.onRequest;
          if (!handler) {
            res.statusCode = 405;
            return res.end("Method not allowed");
          }
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = chunks.length ? Buffer.concat(chunks) : undefined;
          const request = new Request(url, {
            method: req.method,
            headers: req.headers,
            body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
          });
          const env = { ...process.env, ...readDevVars(root) };
          const response = await handler({ request, env, params: {} });
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.config.logger.error(`[api/${m[1]}] ${err.stack || err}`);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: String(err.message || err), kind: "server_error" }));
        }
      });
    },
  };
}
