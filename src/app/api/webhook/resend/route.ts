import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { newsletterSubscribers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

function verifySvixSignature(
  payload: string,
  headers: Headers,
  secret: string
): unknown {
  const id = headers.get("svix-id") ?? headers.get("webhook-id");
  const timestamp = headers.get("svix-timestamp") ?? headers.get("webhook-timestamp");
  const signatureHeader = headers.get("svix-signature") ?? headers.get("webhook-signature");

  if (!id || !timestamp || !signatureHeader) {
    throw new Error("Missing svix headers");
  }

  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) throw new Error("Invalid timestamp");
  if (Math.abs(now - ts) > 300) throw new Error("Timestamp outside 5-minute window");

  const parts = secret.split("_");
  if (parts[0] !== "whsec" || !parts[1]) throw new Error("Invalid secret format");
  const secretBytes = Buffer.from(parts[1], "base64");

  const signedContent = `${id}.${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  const received = signatureHeader.split(" ");
  const ok = received.some((sig) => {
    const [version, value] = sig.split(",");
    if (version !== "v1" || !value) return false;
    if (value.length !== expectedSignature.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  });

  if (!ok) throw new Error("Signature mismatch");
  return JSON.parse(payload);
}

interface ResendWebhookEvent {
  type: string;
  data: {
    id?: string;
    email?: string;
    first_name?: string | null;
    unsubscribed?: boolean;
    created_at?: string;
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RESEND_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Config missing" }, { status: 500 });
  }

  const rawPayload = await request.text();

  let event: ResendWebhookEvent;
  try {
    event = verifySvixSignature(rawPayload, request.headers, secret) as ResendWebhookEvent;
  } catch (e) {
    console.error("Webhook verify failed:", (e as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const email = event.data.email?.toLowerCase().trim();
  if (!email) {
    // Not a contact event we care about; return 200 so Resend doesn't retry
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    if (event.type === "contact.created" || event.type === "contact.updated") {
      const subscribed = !event.data.unsubscribed;

      await db
        .insert(newsletterSubscribers)
        .values({
          email,
          firstName: event.data.first_name ?? null,
          resendContactId: event.data.id ?? null,
          subscribed,
          source: "resend_webhook",
          unsubscribedAt: subscribed ? null : new Date(),
        })
        .onConflictDoUpdate({
          target: newsletterSubscribers.email,
          set: {
            firstName: event.data.first_name ?? null,
            resendContactId: event.data.id ?? null,
            subscribed,
            unsubscribedAt: subscribed ? null : new Date(),
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          },
        });

      // Keep the legacy users flag in sync for account holders
      await db
        .update(users)
        .set({ newsletterSubscribed: subscribed, updatedAt: new Date() })
        .where(eq(users.email, email));
    } else if (event.type === "contact.deleted") {
      // Treat delete-from-Resend as unsubscribe on our side (hard deletion is too destructive)
      await db
        .update(newsletterSubscribers)
        .set({
          subscribed: false,
          unsubscribedAt: new Date(),
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(newsletterSubscribers.email, email));

      await db
        .update(users)
        .set({ newsletterSubscribed: false, updatedAt: new Date() })
        .where(eq(users.email, email));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Webhook handler error:", e);
    // Return 500 so Resend retries — webhook handlers should be resilient to transient DB issues
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
