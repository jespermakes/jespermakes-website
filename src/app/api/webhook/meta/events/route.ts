import { NextRequest, NextResponse } from "next/server";
import { asc, gt, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { metaWebhookEvents } from "@/lib/db/schema";
import { RETENTION_DAYS, safeEqual } from "@/lib/meta-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Brain's pull of stored Meta webhook events (DR-272). Brain on the Spark is not reachable
// from the internet, so the site keeps the events and Brain fetches them:
//   GET /api/webhook/meta/events?after=<last id>&limit=<1..500>
//   Authorization: Bearer <META_EVENTS_PULL_TOKEN>
// Reads, and deletes rows older than RETENTION_DAYS (the webhook route does the same), so
// message text never sits here longer than that even on a quiet week.

export async function GET(request: NextRequest) {
  const token = process.env.META_EVENTS_PULL_TOKEN;
  if (!token) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const auth = request.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!presented || !safeEqual(presented, token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const after = Math.max(0, parseInt(params.get("after") ?? "0", 10) || 0);
  const limit = Math.min(500, Math.max(1, parseInt(params.get("limit") ?? "200", 10) || 200));

  await db
    .delete(metaWebhookEvents)
    .where(lt(metaWebhookEvents.receivedAt, sql`now() - make_interval(days => ${RETENTION_DAYS})`));

  const rows = await db
    .select()
    .from(metaWebhookEvents)
    .where(gt(metaWebhookEvents.id, after))
    .orderBy(asc(metaWebhookEvents.id))
    .limit(limit);

  return NextResponse.json(
    { events: rows, next_after: rows.length ? rows[rows.length - 1].id : after },
    { headers: { "cache-control": "no-store" } }
  );
}
