import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpTokens } from "@/lib/db/schema";
import { hashToken } from "@/lib/mcp/tokens";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let params: URLSearchParams;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    params = new URLSearchParams(text);
  } else if (contentType.includes("application/json")) {
    const json = await request.json();
    params = new URLSearchParams(Object.entries(json).map(([k, v]) => [k, String(v)]));
  } else {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const token = params.get("token");
  if (!token) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const hash = hashToken(token);
  await db
    .update(mcpTokens)
    .set({ revokedAt: new Date() })
    .where(eq(mcpTokens.tokenHash, hash));

  return new NextResponse(null, { status: 200 });
}
