import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/newsletter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const firstName = typeof body.firstName === "string" ? body.firstName : null;

    if (!email.includes("@") || email.length > 320) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await subscribeToNewsletter({
      email,
      firstName,
      source: "public_form",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Newsletter subscribe error:", e);
    return NextResponse.json({ error: "Subscribe failed" }, { status: 500 });
  }
}
