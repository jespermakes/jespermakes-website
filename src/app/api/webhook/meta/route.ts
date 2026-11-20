import { NextRequest, NextResponse } from "next/server";
import { lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { metaWebhookEvents } from "@/lib/db/schema";
import {
  MAX_BODY_BYTES,
  RETENTION_DAYS,
  flattenEvents,
  handshake,
  verifyMetaSignature,
} from "@/lib/meta-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Meta webhook for Instagram and Facebook Page messages (Brain DR-272).
//
// GET  the subscription handshake (hub.verify_token must equal META_WEBHOOK_VERIFY_TOKEN).
// POST an event batch. Refused unless X-Hub-Signature-256 is the HMAC of the raw body under
//      META_APP_SECRET. Each messaging item or change becomes one meta_webhook_events row;
//      Brain pulls them through /api/webhook/meta/events. No call back to Meta exists here.
//
// Fails closed: with either secret unset the route answers 503 and stores nothing.

export async function GET(request: NextRequest) {
  const { status, body } = handshake(
    request.nextUrl.searchParams,
    process.env.META_WEBHOOK_VERIFY_TOKEN
  );
  return new NextResponse(body, { status, headers: { "content-type": "text/plain" } });
}

export async function POST(request: NextRequest) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) {
    console.error("meta webhook: META_APP_SECRET not set");
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "too large" }, { status: 413 });
  }
  if (!verifyMetaSignature(raw, request.headers.get("x-hub-signature-256"), secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const rows = flattenEvents(body);
  try {
    if (rows.length) {
      await db.insert(metaWebhookEvents).values(rows).onConflictDoNothing({
        target: metaWebhookEvents.dedupeKey,
      });
    }
    // Message text should not sit here longer than Brain needs to pull it.
    await db
      .delete(metaWebhookEvents)
      .where(lt(metaWebhookEvents.receivedAt, sql`now() - make_interval(days => ${RETENTION_DAYS})`));
  } catch (e) {
    console.error("meta webhook: store failed", (e as Error).message);
    // 500 makes Meta retry the batch; the dedupe key keeps a retry from doubling rows.
    return NextResponse.json({ error: "store failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: rows.length });
}
