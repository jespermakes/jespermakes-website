import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/newsletter";

export const runtime = "nodejs";

// ohavsladen.dk shares the newsletter audience (one list, tagged by source).
const ALLOWED_ORIGINS = new Set([
  "https://ohavsladen.dk",
  "https://www.ohavsladen.dk",
]);

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  if (!ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const cors = corsHeaders(request);
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const firstName = typeof body.firstName === "string" ? body.firstName : null;
    const source = body.source === "ohavsladen" ? "ohavsladen" : "public_form";

    if (!email.includes("@") || email.length > 320) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400, headers: cors });
    }

    await subscribeToNewsletter({
      email,
      firstName,
      source,
    });

    return NextResponse.json({ ok: true }, { headers: cors });
  } catch (e) {
    console.error("Newsletter subscribe error:", e);
    return NextResponse.json({ error: "Subscribe failed" }, { status: 500, headers: cors });
  }
}
