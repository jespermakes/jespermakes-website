import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lampDesigns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: lampDesigns.id,
      name: lampDesigns.name,
      thumbnail: lampDesigns.thumbnail,
      context: lampDesigns.context,
      templateId: lampDesigns.templateId,
      createdAt: lampDesigns.createdAt,
      updatedAt: lampDesigns.updatedAt,
    })
    .from(lampDesigns)
    .where(eq(lampDesigns.userId, session.user.id))
    .orderBy(desc(lampDesigns.updatedAt));

  return NextResponse.json({ designs: rows });
}
