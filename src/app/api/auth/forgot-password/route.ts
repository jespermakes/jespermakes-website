import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expires,
    });

    // Send reset email via Resend
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jespermakes.com";
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;
    const firstName = user.name?.split(" ")[0] || "";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: user.email,
        from: "Jesper Makes <hello@jespermakes.com>",
        subject: "Reset your password — Jesper Makes",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
            <p>${firstName ? `Hi ${firstName},` : "Hi there,"}</p>
            <p>You requested a password reset. Click the button below to choose a new password:</p>
            <p style="margin:28px 0">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#3F6B4A;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Reset Password</a>
            </p>
            <p style="color:#666;font-size:14px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            <p style="margin-top:24px">Jesper<br/><span style="color:#888">Jesper Makes</span></p>
          </div>`,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
