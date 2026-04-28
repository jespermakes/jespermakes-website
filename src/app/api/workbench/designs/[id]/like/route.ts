import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workbenchDesigns, workbenchLikes } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * Toggle the current user's like on a Workbench design. Returns the new
 * like count and whether the user is now liking the design.
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const userId = session.user.id;

  // Confirm the design exists.
  const [design] = await db
    .select({ id: workbenchDesigns.id })
    .from(workbenchDesigns)
    .where(eq(workbenchDesigns.id, id))
    .limit(1);
  if (!design) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [existing] = await db
    .select({ id: workbenchLikes.id })
    .from(workbenchLikes)
    .where(
      and(eq(workbenchLikes.userId, userId), eq(workbenchLikes.designId, id)),
    )
    .limit(1);

  let liked: boolean;
  if (existing) {
    await db.delete(workbenchLikes).where(eq(workbenchLikes.id, existing.id));
    await db
      .update(workbenchDesigns)
      .set({
        likeCount: sql`GREATEST(${workbenchDesigns.likeCount} - 1, 0)`,
      })
      .where(eq(workbenchDesigns.id, id));
    liked = false;
  } else {
    await db.insert(workbenchLikes).values({ userId, designId: id });
    await db
      .update(workbenchDesigns)
      .set({ likeCount: sql`${workbenchDesigns.likeCount} + 1` })
      .where(eq(workbenchDesigns.id, id));
    liked = true;
  }

  const [updated] = await db
    .select({ likeCount: workbenchDesigns.likeCount })
    .from(workbenchDesigns)
    .where(eq(workbenchDesigns.id, id))
    .limit(1);

  return NextResponse.json({
    liked,
    likeCount: updated?.likeCount ?? 0,
  });
}
