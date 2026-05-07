import { NextRequest, NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { follows, notifications, users } from "@/lib/db/schema";
import { publicDisplayName } from "@/lib/profile";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ userId: string }>;
}

/** Toggle follow on the given userId. Returns { following, followerCount }. */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId } = await ctx.params;
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "You can't follow yourself." },
      { status: 400 },
    );
  }

  // Confirm the target exists.
  const [target] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const followerId = session.user.id;
  const [existing] = await db
    .select({ id: follows.id })
    .from(follows)
    .where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, userId)),
    )
    .limit(1);

  let following: boolean;
  if (existing) {
    await db.delete(follows).where(eq(follows.id, existing.id));
    following = false;
  } else {
    await db.insert(follows).values({ followerId, followingId: userId });
    following = true;
    // Notify the followed user.
    const [actor] = await db
      .select({
        displayName: users.displayName,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, followerId))
      .limit(1);
    const actorName = publicDisplayName(actor ?? null);
    await db
      .insert(notifications)
      .values({
        userId,
        type: "follow",
        actorId: followerId,
        actorName,
        message: `${actorName} started following you`,
      })
      .catch(() => {
        /* noop */
      });
  }

  const followerRow = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followingId, userId));
  const followerCount = Number(followerRow[0]?.count ?? 0);
  return NextResponse.json({ following, followerCount });
}
