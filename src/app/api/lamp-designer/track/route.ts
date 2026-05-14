import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { lampDesignerEvents } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

const VALID_EVENTS = new Set([
  "page_view",
  "step_completed",
  "design_exported",
  "design_published",
]);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const country = request.headers.get("x-vercel-ip-country") || null;
    const body = await request.json();

    if (!body.eventType || !VALID_EVENTS.has(body.eventType)) {
      return NextResponse.json({ ok: false, error: "Invalid event type" }, { status: 400 });
    }

    await db.insert(lampDesignerEvents).values({
      eventType: body.eventType,
      designId: body.designId ?? null,
      templateId: body.templateId ?? null,
      country,
      userId,
      metadata: body.metadata ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Lamp designer tracking error:", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
