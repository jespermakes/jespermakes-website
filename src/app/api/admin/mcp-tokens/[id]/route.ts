import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpTokens } from "@/lib/db/schema";
import { checkMcpAdmin } from "@/lib/mcp/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await checkMcpAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await params;

  const [accessToken] = await db
    .update(mcpTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(mcpTokens.id, id), isNull(mcpTokens.revokedAt)))
    .returning();

  if (accessToken) {
    await db
      .update(mcpTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(mcpTokens.parentTokenId, accessToken.id), isNull(mcpTokens.revokedAt)));
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await checkMcpAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await params;
  const body = await request.json();
  const patch: Partial<typeof mcpTokens.$inferInsert> = {};
  if (typeof body.verboseLogging === "boolean") {
    patch.verboseLogging = body.verboseLogging;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  await db.update(mcpTokens).set(patch).where(eq(mcpTokens.id, id));

  return NextResponse.json({ ok: true });
}
