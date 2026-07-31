import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";
import { createDownloadToken } from "@/lib/download-token";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { checkAiRateLimit, rateLimitResponse } from "@/lib/ai-rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!checkAiRateLimit(request).ok) return rateLimitResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const { email, sku, consent, firstName } = body as {
      email?: string;
      sku?: string;
      consent?: boolean;
      firstName?: string;
    };

    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail.includes("@") || cleanEmail.length > 320) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const product = sku ? PRODUCTS[sku] : undefined;
    if (!product || product.tier !== "free" || !product.file) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    // Newsletter only with explicit consent (EU). The email itself is used
    // solely to deliver the download link.
    if (consent) {
      try {
        await subscribeToNewsletter({
          email: cleanEmail,
          firstName: firstName || null,
          source: "plan_download",
        });
      } catch (e) {
        console.error("Plan claim newsletter subscribe failed:", e);
      }
    }

    const token = createDownloadToken(product.sku, cleanEmail);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jespermakes.com";
    const downloadUrl = `${siteUrl}/api/downloads/${product.sku}?token=${token}`;

    // Email the link too, so they can come back to it (transactional).
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: cleanEmail,
          from: "Jesper Makes <hello@jespermakes.com>",
          subject: `Your ${product.name} — Download`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
              <p>Hi there,</p>
              <p>Here is your download link for <strong>${product.name}</strong>. It works for 7 days:</p>
              <p style="margin:24px 0"><a href="${downloadUrl}" style="display:inline-block;padding:14px 32px;background:#3F6B4A;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">${product.downloadLabel || "Download"}</a></p>
              <p>These plans are free. If they save you time and you feel like it, you can leave something in the jar: <a href="${siteUrl}/support">jespermakes.com/support</a></p>
              <p>Jesper<br/><span style="color:#888">Jesper Makes</span></p>
            </div>`,
        }),
      });
      if (!res.ok) console.error("Plan claim email error:", await res.text());
    } catch (e) {
      console.error("Plan claim email failed:", e);
    }

    return NextResponse.json({ ok: true, downloadUrl });
  } catch (e) {
    console.error("Plan claim error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
