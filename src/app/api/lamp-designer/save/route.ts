import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lampDesigns } from "@/lib/db/schema";

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

  const parameters = obj.parameters;
  if (!parameters || typeof parameters !== "object") {
    return NextResponse.json(
      { error: "Missing 'parameters' design payload." },
      { status: 400 },
    );
  }

  const name = typeof obj.name === "string" ? obj.name : "Untitled";
  const thumbnail = typeof obj.thumbnail === "string" ? obj.thumbnail : null;
  const context = typeof obj.context === "string" ? obj.context : null;
  const templateId =
    typeof obj.templateId === "string" ? obj.templateId : null;
  const id = typeof obj.id === "string" ? obj.id : null;

  // Update existing design
  if (id) {
    const [row] = await db
      .update(lampDesigns)
      .set({
        name,
        parameters,
        thumbnail,
        context,
        templateId,
        updatedAt: new Date(),
      })
      .where(
        and(eq(lampDesigns.id, id), eq(lampDesigns.userId, session.user.id)),
      )
      .returning({
        id: lampDesigns.id,
        name: lampDesigns.name,
        updatedAt: lampDesigns.updatedAt,
      });

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ design: row });
  }

  // Create new design
  const [row] = await db
    .insert(lampDesigns)
    .values({
      userId: session.user.id,
      name,
      parameters,
      thumbnail,
      context,
      templateId,
    })
    .returning({
      id: lampDesigns.id,
      name: lampDesigns.name,
      updatedAt: lampDesigns.updatedAt,
    });

  return NextResponse.json({ design: row }, { status: 201 });
}
