import { db } from "../lib/db";
import { newsletterSubscribers } from "../lib/db/schema";
import { listAllContacts } from "../lib/resend";
import { sql } from "drizzle-orm";

async function run() {
  console.log("=== Importing contacts from Resend ===");

  const contacts = await listAllContacts();
  console.log(`Fetched ${contacts.length} contacts from Resend\n`);

  if (contacts.length === 0) {
    console.log("No contacts to import. Double-check RESEND_NEWSLETTER_AUDIENCE_ID.");
    process.exit(1);
  }

  let inserted = 0;
  let updated = 0;

  for (const contact of contacts) {
    const email = contact.email.toLowerCase().trim();
    if (!email.includes("@")) {
      console.warn(`Skipping invalid email: "${contact.email}"`);
      continue;
    }

    const result = await db
      .insert(newsletterSubscribers)
      .values({
        email,
        firstName: contact.first_name ?? null,
        resendContactId: contact.id,
        subscribed: !contact.unsubscribed,
        source: "resend_import",
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
      })
      .returning({
        inserted: sql<boolean>`(xmax = 0)`,
      });

    if (result[0]?.inserted) inserted++;
    else updated++;
  }

  const [countRow] = await db.select({ c: sql<number>`count(*)::int` }).from(newsletterSubscribers);
  const [subscribedRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(newsletterSubscribers)
    .where(sql`subscribed = true`);

  console.log(`Imported: ${inserted} new, ${updated} updated`);
  console.log(`Total in DB:   ${countRow.c}`);
  console.log(`Subscribed:    ${subscribedRow.c}`);
  console.log(`Unsubscribed:  ${countRow.c - subscribedRow.c}`);

  if (countRow.c < contacts.length) {
    console.error(`\n!!! DB count (${countRow.c}) < Resend count (${contacts.length}). Some imports failed silently.`);
    process.exit(1);
  }

  console.log("\nImport complete.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});
