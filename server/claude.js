// The one place Spark talks to Claude. Runs on the server only (Cloudflare Pages
// Functions in production, the Vite dev server locally), so the API key never
// reaches the browser.
//
// Set ANTHROPIC_API_KEY in .dev.vars locally, or as a secret in Cloudflare Pages.
// Optional: SPARK_MODEL to try a different model, SPARK_EFFORT (low | medium | high).

import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";

export const DEFAULT_MODEL = "claude-opus-5-5";

export function hasKey(env) {
  return Boolean(env?.ANTHROPIC_API_KEY);
}

export class SparkAIError extends Error {
  constructor(message, { status = 502, kind = "ai_error" } = {}) {
    super(message);
    this.status = status;
    this.kind = kind;
  }
}

// Ask Claude for one JSON object that matches `schema`. Returns the parsed object.
export async function askForJSON(env, { system, user, schema, maxTokens = 8000 }) {
  if (!hasKey(env)) throw new SparkAIError("No ANTHROPIC_API_KEY set", { status: 503, kind: "no_key" });

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 60_000 });
  try {
    const response = await client.beta.messages.parse({
      model: env.SPARK_MODEL || DEFAULT_MODEL,
      max_tokens: maxTokens,
      // If the main model declines, the API retries on a fallback model in the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // Low effort keeps the wait short for a kid standing at the station.
      output_config: {
        effort: env.SPARK_EFFORT || "low",
        format: jsonSchemaOutputFormat(schema),
      },
      system,
      messages: [{ role: "user", content: user }],
    });

    if (response.stop_reason === "refusal") {
      throw new SparkAIError("The AI declined this topic", { status: 422, kind: "refusal" });
    }
    if (!response.parsed_output) {
      throw new SparkAIError(`No JSON came back (stop reason: ${response.stop_reason})`);
    }
    return response.parsed_output;
  } catch (err) {
    if (err instanceof SparkAIError) throw err;
    if (err instanceof Anthropic.AuthenticationError) {
      throw new SparkAIError("The API key was rejected", { status: 503, kind: "bad_key" });
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new SparkAIError("Too many requests, try again in a moment", { status: 429, kind: "rate_limit" });
    }
    if (err instanceof Anthropic.APIError) {
      throw new SparkAIError(`AI request failed (${err.status}): ${err.message}`);
    }
    throw new SparkAIError(`AI request failed: ${err?.message || err}`);
  }
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
