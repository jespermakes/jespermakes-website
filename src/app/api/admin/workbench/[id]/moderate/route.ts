import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, workbenchDesigns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

const VALID_ACTIONS = new Set(["approve", "remove", "ban_author"]);

async function isAdmin(userId: string): Promise<boolean> {
  const [u] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return u?.isAdmin === true;
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const action =
    typeof obj.action === "string" && VALID_ACTIONS.has(obj.action)
      ? obj.action
      : null;
  if (!action) {
    return NextResponse.json({ error: "action required" }, { status: 400 });
  }

  const [design] = await db
    .select({ id: workbenchDesigns.id, authorId: workbenchDesigns.authorId })
    .from(workbenchDesigns)
    .where(eq(workbenchDesigns.id, id))
    .limit(1);
  if (!design) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "approve") {
    await db
      .update(workbenchDesigns)
      .set({ status: "published" })
      .where(eq(workbenchDesigns.id, id));
  } else if (action === "remove") {
    await db
      .update(workbenchDesigns)
      .set({ status: "removed" })
      .where(eq(workbenchDesigns.id, id));
  } else if (action === "ban_author") {
    await db
      .update(workbenchDesigns)
      .set({ status: "removed" })
      .where(eq(workbenchDesigns.authorId, design.authorId));
  }
  return NextResponse.json({ ok: true });
}
