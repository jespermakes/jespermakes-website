import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.select().from(images).where(eq(images.id, params.id)).limit(1);
  const image = rows[0];
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fullUrl = image.source === "public"
    ? `https://jespermakes.com${image.url}`
    : image.url;

  const upstream = await fetch(fullUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Failed to fetch upstream" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || image.mimeType || "application/octet-stream";
  const safeName = image.filename.replace(/[^a-zA-Z0-9._-]/g, "-");

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
