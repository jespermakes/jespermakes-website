import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { titleLabSessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await db
      .select({
        id: titleLabSessions.id,
        sessionType: titleLabSessions.sessionType,
        inputUrl: titleLabSessions.inputUrl,
        inputVideoTitle: titleLabSessions.inputVideoTitle,
        inputVideoThumbnail: titleLabSessions.inputVideoThumbnail,
        inputVideoViews: titleLabSessions.inputVideoViews,
        inputVideoChannel: titleLabSessions.inputVideoChannel,
        inputDescription: titleLabSessions.inputDescription,
        chosenTitle: titleLabSessions.chosenTitle,
        userNotes: titleLabSessions.userNotes,
        status: titleLabSessions.status,
        createdAt: titleLabSessions.createdAt,
      })
      .from(titleLabSessions)
      .where(eq(titleLabSessions.userId, session.user.id))
      .orderBy(desc(titleLabSessions.createdAt))
      .limit(50);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("List sessions error:", error);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const [saved] = await db
      .insert(titleLabSessions)
      .values({
        userId: session.user.id,
        sessionType: body.sessionType,
        inputUrl: body.inputUrl,
        inputVideoTitle: body.inputVideoTitle,
        inputVideoThumbnail: body.inputVideoThumbnail,
        inputVideoViews: body.inputVideoViews,
        inputVideoChannel: body.inputVideoChannel,
        inputDescription: body.inputDescription,
        inputPromise: body.inputPromise,
        inputStory: body.inputStory,
        inputHook: body.inputHook,
        aiResults: body.aiResults,
        chosenTitle: body.chosenTitle,
      })
      .returning({ id: titleLabSessions.id });

    return NextResponse.json({ id: saved.id, saved: true });
  } catch (error) {
    console.error("Save session error:", error);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}
