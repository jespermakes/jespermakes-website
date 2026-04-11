import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { titleLabSessions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [result] = await db
      .select()
      .from(titleLabSessions)
      .where(
        and(
          eq(titleLabSessions.id, params.id),
          eq(titleLabSessions.userId, session.user.id)
        )
      );

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (body.userNotes !== undefined) updateData.userNotes = body.userNotes;
    if (body.chosenTitle !== undefined)
      updateData.chosenTitle = body.chosenTitle;
    if (body.status !== undefined) updateData.status = body.status;

    await db
      .update(titleLabSessions)
      .set(updateData)
      .where(
        and(
          eq(titleLabSessions.id, params.id),
          eq(titleLabSessions.userId, session.user.id)
        )
      );

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db
      .delete(titleLabSessions)
      .where(
        and(
          eq(titleLabSessions.id, params.id),
          eq(titleLabSessions.userId, session.user.id)
        )
      );

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
