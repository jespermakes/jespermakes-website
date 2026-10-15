import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminApi } from "@/lib/admin/auth";
import { adminVoiceGate } from "@/lib/voice/gate-log";
import { leafInputs, readOverride } from "@/lib/voice/gate";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  let voice: Awaited<ReturnType<typeof adminVoiceGate>> = {};
  if (body.data !== undefined) {
    const currentRows = await db.select().from(pageSections).where(eq(pageSections.id, params.id)).limit(1);
    if (!currentRows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // every copy string in the section, judged on what this edit adds
    voice = await adminVoiceGate(
      "admin.homepage.update",
      (gate.session.user as { id?: string } | undefined)?.id ?? null,
      leafInputs(body.data, currentRows[0].data, "data"),
      readOverride(body.voiceOverride),
    );
    if (voice.response) return voice.response;
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (body.data !== undefined) update.data = body.data;
  if (body.visible !== undefined) update.visible = Boolean(body.visible);
  if (typeof body.position === "number") update.position = body.position;

  const [row] = await db
    .update(pageSections)
    .set(update)
    .where(eq(pageSections.id, params.id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePath("/");
  return NextResponse.json({ section: row, voice: voice.voice });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const [row] = await db
    .update(pageSections)
    .set({ hidden: true, updatedAt: new Date() })
    .where(eq(pageSections.id, params.id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
