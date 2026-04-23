import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminApi } from "@/lib/admin/auth";

interface ReorderBody {
  order: string[];
}

export async function POST(request: NextRequest) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = (await request.json().catch(() => null)) as ReorderBody | null;
  if (!body?.order?.length) return NextResponse.json({ error: "Missing order" }, { status: 400 });

  for (let i = 0; i < body.order.length; i++) {
    await db
      .update(pageSections)
      .set({ position: (i + 1) * 10, updatedAt: new Date() })
      .where(eq(pageSections.id, body.order[i]));
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
