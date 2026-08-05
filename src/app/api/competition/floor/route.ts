import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { competitionEntries } from "@/lib/db/schema";
import { subscribeToNewsletter } from "@/lib/newsletter";

export const runtime = "nodejs";

/**
 * The Floor Rescue (Rubio Monocoat competition, Aug-Sep 2026).
 * POST multipart form: name, email, country, floorStory?, photo (image, <=8MB),
 * consent (required), newsletter (optional). Stores the entry (photo in Vercel
 * Blob), sends the confirmation email (carries the Rubio discount code when
 * RUBIO_DISCOUNT_CODE is set), optionally subscribes to the newsletter (which
 * triggers the Starter Kit welcome via the normal signup path).
 * Mechanics agreed with Rubio on the "Code" thread: three winners, worst floor
 * wins, real wood only, entries close end of August, winners early September.
 * Duplicate emails are allowed and deduped at judging time.
 */

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim().slice(0, 120);
    const email = String(form.get("email") ??"").trim().toLowerCase().slice(0, 320);
    const country = String(form.get("country") ?? "").trim().slice(0, 60);
    const floorStory = String(form.get("floorStory") ?? "").trim().slice(0, 2000);
    const consent = form.get("consent") === "on" || form.get("consent") === "true";
    const newsletter = form.get("newsletter") === "on" || form.get("newsletter") === "true";
    const photo = form.get("photo");

    if (!name || !email.includes("@") || !country) {
      return NextResponse.json({ error: "Name, email and country are required." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json(
        { error: "The consent box is required; without it we cannot share your entry with Rubio." },
        { status: 400 },
      );
    }
    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json({ error: "A photo of the floor is required." }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "Photo too large (max 8MB)." }, { status: 400 });
    }
    if (!PHOTO_TYPES.has(photo.type)) {
      return NextResponse.json({ error: "Photo must be JPEG, PNG, WebP or HEIC." }, { status: 400 });
    }

    const blob = await put(
      `floor-rescue/${crypto.randomUUID()}.${EXT[photo.type] ?? "jpg"}`,
      photo,
      { access: "public", contentType: photo.type },
    );

    await db.insert(competitionEntries).values({
      name,
      email,
      country,
      floorStory,
      photoUrl: blob.url,
      consentShare: true,
      newsletterOptIn: newsletter,
    });

    if (newsletter) {
      // Normal signup path; fires the Starter Kit welcome for new subscribers.
      subscribeToNewsletter({ email, firstName: name.split(" ")[0] ?? null, source: "competition" }).catch(
        (e) => console.error("floor-rescue newsletter opt-in failed:", e),
      );
    }

    const code = process.env.RUBIO_DISCOUNT_CODE;
    const codeBlock = code
      ? `<p>As promised, here is your Rubio Monocoat discount code: <strong>${code}</strong>. It is valid until the end of August.</p>`
      : `<p>Your Rubio Monocoat discount code follows in a separate email once the campaign officially opens.</p>`;
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          from: "Jesper Makes <hello@jespermakes.com>",
          subject: "Your floor is in the running",
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222;line-height:1.6">
              <p>Hi ${name.split(" ")[0] ?? ""},</p>
              <p>Your floor is officially entered in The Floor Rescue. The worst floor wins, so in this one competition, do not fix anything yet.</p>
              <p>How it works from here: entries close at the end of August. Three winners, ideally from three different countries, get 1.3L of Rubio Monocoat Oil Plus 2C in the colour of their choice, roughly a floor's worth. Winners are picked in early September on need and story, and agree to share before and after photos.</p>
              ${codeBlock}
              <p>Not sure what your floor actually needs? I built a guide: <a href="https://jespermakes.com/rubio" style="color:#C17F3C">the Rubio guide</a>.</p>
              <p>Good luck. I mean it: may the worst floor win.</p>
              <p>Jesper</p>
            </div>
          `,
        }),
      });
    } catch (e) {
      console.error("floor-rescue confirmation email failed:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("floor-rescue entry error:", e);
    return NextResponse.json({ error: "Something broke on our end. Try again." }, { status: 500 });
  }
}
