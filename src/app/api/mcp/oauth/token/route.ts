import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpAuthorizationCodes, mcpTokens } from "@/lib/db/schema";
import {
  generateToken,
  validateRefreshToken,
  ACCESS_TOKEN_LIFETIME_MS,
  REFRESH_TOKEN_LIFETIME_MS,
} from "@/lib/mcp/tokens";
import { verifyPkce } from "@/lib/mcp/pkce";

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

  const grantType = params.get("grant_type");

  if (grantType === "authorization_code") {
    return handleAuthorizationCodeGrant(params);
  }

  if (grantType === "refresh_token") {
    return handleRefreshTokenGrant(params);
  }

  return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
}

async function handleAuthorizationCodeGrant(params: URLSearchParams) {
  const code = params.get("code");
  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");
  const codeVerifier = params.get("code_verifier");

  if (!code || !clientId || !redirectUri || !codeVerifier) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const codeRows = await db
    .select()
    .from(mcpAuthorizationCodes)
    .where(eq(mcpAuthorizationCodes.code, code))
    .limit(1);

  const authCode = codeRows[0];
  if (!authCode || authCode.consumed || authCode.expiresAt < new Date()) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  if (authCode.clientId !== clientId || authCode.redirectUri !== redirectUri) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  if (!verifyPkce(codeVerifier, authCode.codeChallenge)) {
    return NextResponse.json({ error: "invalid_grant", error_description: "PKCE verification failed" }, { status: 400 });
  }

  await db
    .update(mcpAuthorizationCodes)
    .set({ consumed: true })
    .where(eq(mcpAuthorizationCodes.code, code));

  const accessToken = generateToken();
  const refreshToken = generateToken();

  const [accessRow] = await db
    .insert(mcpTokens)
    .values({
      tokenHash: accessToken.hash,
      tokenType: "access",
      clientId: authCode.clientId,
      userId: authCode.userId,
      scope: authCode.scope,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_LIFETIME_MS),
    })
    .returning();

  await db.insert(mcpTokens).values({
    tokenHash: refreshToken.hash,
    tokenType: "refresh",
    clientId: authCode.clientId,
    userId: authCode.userId,
    scope: authCode.scope,
    parentTokenId: accessRow.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS),
  });

  return NextResponse.json({
    access_token: accessToken.raw,
    token_type: "Bearer",
    expires_in: Math.floor(ACCESS_TOKEN_LIFETIME_MS / 1000),
    refresh_token: refreshToken.raw,
    scope: authCode.scope,
  });
}

async function handleRefreshTokenGrant(params: URLSearchParams) {
  const refreshTokenRaw = params.get("refresh_token");
  const clientId = params.get("client_id");

  if (!refreshTokenRaw || !clientId) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const oldRefresh = await validateRefreshToken(refreshTokenRaw);
  if (!oldRefresh || oldRefresh.clientId !== clientId) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  await db
    .update(mcpTokens)
    .set({ revokedAt: new Date() })
    .where(eq(mcpTokens.id, oldRefresh.id));

  if (oldRefresh.parentTokenId) {
    await db
      .update(mcpTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(mcpTokens.id, oldRefresh.parentTokenId), isNull(mcpTokens.revokedAt)));
  }

  const newAccess = generateToken();
  const newRefresh = generateToken();

  const [accessRow] = await db
    .insert(mcpTokens)
    .values({
      tokenHash: newAccess.hash,
      tokenType: "access",
      clientId: oldRefresh.clientId,
      userId: oldRefresh.userId,
      scope: oldRefresh.scope,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_LIFETIME_MS),
      verboseLogging: oldRefresh.verboseLogging,
    })
    .returning();

  await db.insert(mcpTokens).values({
    tokenHash: newRefresh.hash,
    tokenType: "refresh",
    clientId: oldRefresh.clientId,
    userId: oldRefresh.userId,
    scope: oldRefresh.scope,
    parentTokenId: accessRow.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS),
    verboseLogging: oldRefresh.verboseLogging,
  });

  return NextResponse.json({
    access_token: newAccess.raw,
    token_type: "Bearer",
    expires_in: Math.floor(ACCESS_TOKEN_LIFETIME_MS / 1000),
    refresh_token: newRefresh.raw,
    scope: oldRefresh.scope,
  });
}
