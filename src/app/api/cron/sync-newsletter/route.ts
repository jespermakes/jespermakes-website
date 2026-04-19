import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { listAllContacts } from "@/lib/resend";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Vercel Cron auth: check the Bearer token Vercel attaches
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contacts = await listAllContacts();
    let updated = 0;

    for (const contact of contacts) {
      const email = contact.email.toLowerCase().trim();
      if (!email.includes("@")) continue;

      await db
        .insert(newsletterSubscribers)
        .values({
          email,
          firstName: contact.first_name ?? null,
          resendContactId: contact.id,
          subscribed: !contact.unsubscribed,
          source: "resend_sync",
          subscribedAt: new Date(contact.created_at),
          unsubscribedAt: contact.unsubscribed ? new Date() : null,
        })
        .onConflictDoUpdate({
          target: newsletterSubscribers.email,
          set: {
            firstName: sql`COALESCE(EXCLUDED.first_name, ${newsletterSubscribers.firstName})`,
            resendContactId: contact.id,
            subscribed: !contact.unsubscribed,
            unsubscribedAt: contact.unsubscribed ? new Date() : null,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      updated++;
    }

    return NextResponse.json({ ok: true, synced: updated });
  } catch (e) {
    console.error("Newsletter sync error:", e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
