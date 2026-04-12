import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { coneLampEvents } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const country = request.headers.get("x-vercel-ip-country") || null;
    const body = await request.json();

    await db.insert(coneLampEvents).values({
      eventType: body.eventType,
      thickness: body.thickness ?? null,
      country,
      userId,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Cone lamp tracking error:", e);
    // return 200 so the client never sees an error and the UI never breaks
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
