import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mcpOauthClients, mcpAuthorizationCodes } from "@/lib/db/schema";
import { AUTHORIZATION_CODE_LIFETIME_MS } from "@/lib/mcp/tokens";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    action,
    client_id,
    redirect_uri,
    state,
    code_challenge,
    code_challenge_method,
    scope,
  } = body;

  if (!client_id || !redirect_uri || !code_challenge) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const clientRows = await db
    .select()
    .from(mcpOauthClients)
    .where(eq(mcpOauthClients.clientId, client_id))
    .limit(1);

  const client = clientRows[0];
  if (!client || client.revoked) {
    return NextResponse.json({ error: "unauthorized_client" }, { status: 400 });
  }

  if (!client.redirectUris.includes(redirect_uri)) {
    return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
  }

  if (code_challenge_method && code_challenge_method !== "S256") {
    return NextResponse.json({ error: "invalid_request", error_description: "Only S256 PKCE is supported" }, { status: 400 });
  }

  if (action === "deny") {
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("error", "access_denied");
    if (state) redirectUrl.searchParams.set("state", state);
    return NextResponse.json({ redirect_to: redirectUrl.toString() });
  }

  const code = randomBytes(32).toString("hex");
  const userId = session.user.id as string;

  await db.insert(mcpAuthorizationCodes).values({
    code,
    clientId: client_id,
    userId,
    redirectUri: redirect_uri,
    codeChallenge: code_challenge,
    codeChallengeMethod: code_challenge_method || "S256",
    scope: scope || "mcp",
    expiresAt: new Date(Date.now() + AUTHORIZATION_CODE_LIFETIME_MS),
  });

  await db
    .update(mcpOauthClients)
    .set({ lastUsedAt: new Date() })
    .where(eq(mcpOauthClients.clientId, client_id));

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);

  return NextResponse.json({ redirect_to: redirectUrl.toString() });
}
