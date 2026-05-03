import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/** Mark all of the current user's notifications as read. */
export async function PATCH(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, session.user.id));
  return NextResponse.json({ ok: true });
}
