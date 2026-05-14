import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workbenchDesigns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

const VALID_REASONS = new Set([
  "spam",
  "inappropriate",
  "copyright",
  "other",
]);

/**
 * Flag a Workbench design for admin review. Auth-gated to keep auto-spam
 * out, but no per-user dedup — multiple flags from one account just keep
 * the design in the queue.
 */
export async function POST(request: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const reason =
    typeof obj.reason === "string" && VALID_REASONS.has(obj.reason)
      ? obj.reason
      : "other";
  void reason; // future: store reason on a moderation table

  await db
    .update(workbenchDesigns)
    .set({ status: "flagged" })
    .where(eq(workbenchDesigns.id, id));
  return NextResponse.json({ ok: true });
}
