// Lightweight abuse brake for the public AI endpoints (Title Lab, Storyteller).
// In-memory per serverless instance: not a hard quota, but raises the cost of
// naive abuse loops from "unlimited" to "a trickle". Real per-user quotas can
// come with accounts if usage ever justifies it.

const IP_WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_IP = 10;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const MAX_GLOBAL = 120;

const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];

export function checkAiRateLimit(request: Request): { ok: boolean } {
  const now = Date.now();
  const ip = (request.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim();

  const hits = (ipHits.get(ip) || []).filter((t) => now - t < IP_WINDOW_MS);
  globalHits = globalHits.filter((t) => now - t < GLOBAL_WINDOW_MS);

  if (hits.length >= MAX_PER_IP || globalHits.length >= MAX_GLOBAL) {
    return { ok: false };
  }

  hits.push(now);
  ipHits.set(ip, hits);
  globalHits.push(now);
  if (ipHits.size > 5000) ipHits.clear();
  return { ok: true };
}

export function rateLimitResponse(): Response {
  return Response.json(
    { error: "Too many requests. Give it a few minutes and try again." },
    { status: 429 },
  );
}
