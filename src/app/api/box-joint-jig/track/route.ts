import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { boxJointJigEvents } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const country = request.headers.get("x-vercel-ip-country") || null;
    const body = await request.json();

    await db.insert(boxJointJigEvents).values({
      eventType: body.eventType,
      unit: body.unit ?? null,
      thickness: body.thickness ?? null,
      fingers: body.fingers ?? null,
      hasCustomTitle: body.hasCustomTitle ?? null,
      hasCustomLabel: body.hasCustomLabel ?? null,
      country,
      userId,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Box joint jig tracking error:", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
