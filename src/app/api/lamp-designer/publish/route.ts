import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { follows, users, workbenchDesigns } from "@/lib/db/schema";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const obj = (body ?? {}) as Record<string, unknown>;

  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const description =
    typeof obj.description === "string" ? obj.description : "";
  const tags =
    Array.isArray(obj.tags)
      ? (obj.tags as unknown[])
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
          .slice(0, 12)
      : [];

  const parameters = obj.parameters;
  if (!parameters || typeof parameters !== "object") {
    return NextResponse.json(
      { error: "Missing 'parameters' lamp design payload." },
      { status: 400 },
    );
  }

  const thumbnail =
    typeof obj.thumbnail === "string" ? obj.thumbnail : null;
  const templateId =
    typeof obj.templateId === "string" ? obj.templateId : null;

  // Package lamp data for the marketplace entry
  const data = {
    type: "lamp",
    templateId,
    parameters,
  };

  // Resolve author display name
  const [authorRow] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const authorName =
    authorRow?.name?.trim() ||
    authorRow?.email?.split("@")[0] ||
    "Maker";

  const [row] = await db
    .insert(workbenchDesigns)
    .values({
      sourceDesignId: null,
      authorId: session.user.id,
      authorName,
      name,
      description,
      tags,
      data,
      thumbnail,
      category: "lamp",
    })
    .returning({
      id: workbenchDesigns.id,
      name: workbenchDesigns.name,
      publishedAt: workbenchDesigns.publishedAt,
    });

  // Notify followers
  const followers = await db
    .select({ followerId: follows.followerId })
    .from(follows)
    .where(eq(follows.followingId, session.user.id));
  for (const f of followers) {
    await createNotification({
      userId: f.followerId,
      actorId: session.user.id,
      actorName: authorName,
      type: "new_design",
      designId: row.id,
      message: `${authorName} published "${row.name}"`,
    });
  }

  return NextResponse.json({ design: row }, { status: 201 });
}
