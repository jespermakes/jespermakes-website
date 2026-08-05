import { db } from "@/lib/db";
import { newsletterSubscribers, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createContact, updateContactBy, ResendError } from "@/lib/resend";
import { sendWelcomeEmail } from "@/lib/email/welcome";

export type SubscribeSource =
  | "public_form"
  | "account_toggle"
  | "plan_download"
  | "ohavsladen"
  | "newsletter_page"
  | "homepage"
  | "site_footer"
  | "blog_post"
  | "tools_page"
  | "competition";

export interface SubscribeInput {
  email: string;
  firstName?: string | null;
  source: SubscribeSource;
  userId?: string;
}

export async function subscribeToNewsletter(input: SubscribeInput) {
  const email = input.email.toLowerCase().trim();
  if (!email.includes("@")) throw new Error("Invalid email");

  // Welcome-email rule: send only to a NEW subscriber or a resubscribe after
  // an unsubscribe, never on repeat toggles of an already-subscribed contact.
  const existing = await db
    .select({ subscribed: newsletterSubscribers.subscribed, firstName: newsletterSubscribers.firstName })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email));
  const shouldWelcome = !existing[0] || !existing[0].subscribed;

  // Resend first — Resend is source of truth
  let resendContact;
  try {
    resendContact = await createContact({
      email,
      firstName: input.firstName ?? null,
      unsubscribed: false,
    });
  } catch (e) {
    // If the contact already exists in Resend, that's fine — re-activate it
    if (e instanceof ResendError && (e.status === 400 || e.status === 409)) {
      resendContact = await updateContactBy({ email }, { unsubscribed: false, firstName: input.firstName ?? null });
    } else {
      throw e;
    }
  }

  // Postgres second — mirror Resend's state
  await db
    .insert(newsletterSubscribers)
    .values({
      email,
      firstName: input.firstName ?? null,
      resendContactId: resendContact.id,
      subscribed: true,
      source: input.source,
    })
    .onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: {
        firstName: sql`COALESCE(EXCLUDED.first_name, ${newsletterSubscribers.firstName})`,
        resendContactId: resendContact.id,
        subscribed: true,
        unsubscribedAt: null,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      },
    });

  // If this is an account-holder flow, keep the legacy flag in sync too
  if (input.userId) {
    await db
      .update(users)
      .set({ newsletterSubscribed: true, updatedAt: new Date() })
      .where(eq(users.id, input.userId));
  }

  // Fire-and-forget: a signup must never fail because the welcome could not send.
  if (shouldWelcome) {
    void sendWelcomeEmail(email, input.firstName ?? existing[0]?.firstName ?? null).catch((e) =>
      console.error("welcome email error:", e)
    );
  }

  return { email, subscribed: true };
}

export async function unsubscribeFromNewsletter(input: { email: string; userId?: string }) {
  const email = input.email.toLowerCase().trim();

  await updateContactBy({ email }, { unsubscribed: true });

  await db
    .update(newsletterSubscribers)
    .set({
      subscribed: false,
      unsubscribedAt: new Date(),
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(newsletterSubscribers.email, email));

  if (input.userId) {
    await db
      .update(users)
      .set({ newsletterSubscribed: false, updatedAt: new Date() })
      .where(eq(users.id, input.userId));
  }

  return { email, subscribed: false };
}
