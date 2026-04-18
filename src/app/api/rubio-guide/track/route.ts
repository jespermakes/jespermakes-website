import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rubioGuideEvents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await auth();
    const country = request.headers.get("x-vercel-ip-country") || null;

    await db.insert(rubioGuideEvents).values({
      eventType: String(body.eventType || "unknown"),
      product: body.product ?? null,
      species: body.species ?? null,
      colorId: body.colorId ?? null,
      colorLabel: body.colorLabel ?? null,
      surfaceArea: typeof body.surfaceArea === "number" ? body.surfaceArea : null,
      unit: body.unit ?? null,
      country,
      userId: session?.user?.id ?? null,
    });
  } catch (err) {
    console.error("rubio-guide/track error:", err);
  }
  return NextResponse.json({ ok: true });
}
