import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { studioEvents } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "page_view",
  "design_created",
  "design_saved",
  "svg_export",
  "shaper_export",
  "laser_export",
  "cnc_export",
  "ai_request",
  "workbench_publish",
  "workbench_download",
  "workbench_like",
  "workbench_comment",
]);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventType =
      typeof body.eventType === "string" && ALLOWED.has(body.eventType)
        ? body.eventType
        : null;
    if (!eventType) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }
    const session = await auth();
    const country = request.headers.get("x-vercel-ip-country") || null;
    const designId =
      typeof body.designId === "string" ? body.designId : null;
    const metadata =
      body.metadata && typeof body.metadata === "object"
        ? (body.metadata as Record<string, unknown>)
        : null;
    await db.insert(studioEvents).values({
      eventType,
      designId,
      country,
      userId: session?.user?.id ?? null,
      metadata,
    });
  } catch (err) {
    console.error("studio/track error:", err);
  }
  return NextResponse.json({ ok: true });
}
