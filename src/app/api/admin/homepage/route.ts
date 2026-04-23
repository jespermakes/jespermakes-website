import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { checkAdminApi } from "@/lib/admin/auth";
import { isValidKind, defaultDataFor, MODULE_KINDS } from "@/lib/homepage/types";

export async function GET() {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const rows = await db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.pageSlug, "home"), eq(pageSections.hidden, false)))
    .orderBy(asc(pageSections.position));

  return NextResponse.json({ sections: rows });
}

export async function POST(request: NextRequest) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await request.json().catch(() => null);
  const kind = body?.kind;
  if (!kind || !isValidKind(kind)) {
    return NextResponse.json({ error: "Invalid kind. Expected one of: " + MODULE_KINDS.join(", ") }, { status: 400 });
  }

  const last = await db
    .select({ position: pageSections.position })
    .from(pageSections)
    .where(and(eq(pageSections.pageSlug, "home"), eq(pageSections.hidden, false)))
    .orderBy(desc(pageSections.position))
    .limit(1);

  const nextPos = (last[0]?.position ?? 0) + 10;

  const [inserted] = await db
    .insert(pageSections)
    .values({
      pageSlug: "home",
      position: nextPos,
      kind,
      visible: true,
      hidden: false,
      data: defaultDataFor(kind) as object,
    })
    .returning();

  revalidatePath("/");
  return NextResponse.json({ section: inserted });
}
