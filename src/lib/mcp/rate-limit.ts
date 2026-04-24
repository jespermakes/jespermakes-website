import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpActivity } from "@/lib/db/schema";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

export async function checkRateLimit(tokenId: string): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MS);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mcpActivity)
    .where(
      and(
        eq(mcpActivity.tokenId, tokenId),
        gt(mcpActivity.createdAt, windowStart),
      ),
    );

  if (count >= MAX_REQUESTS_PER_WINDOW) {
    return { ok: false, retryAfterMs: WINDOW_MS };
  }
  return { ok: true };
}
