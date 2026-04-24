import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { mcpOauthClients } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const clientName = typeof body.client_name === "string" ? body.client_name : "Unknown Client";
  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((u: unknown) => typeof u === "string") : [];

  if (redirectUris.length === 0) {
    return NextResponse.json(
      { error: "invalid_redirect_uri", error_description: "At least one redirect_uri is required" },
      { status: 400 },
    );
  }

  const grantTypes = Array.isArray(body.grant_types)
    ? body.grant_types.filter((g: unknown) => typeof g === "string")
    : ["authorization_code", "refresh_token"];

  const tokenEndpointAuthMethod = typeof body.token_endpoint_auth_method === "string"
    ? body.token_endpoint_auth_method
    : "none";

  if (tokenEndpointAuthMethod !== "none") {
    return NextResponse.json(
      { error: "invalid_client_metadata", error_description: "Only public clients (token_endpoint_auth_method=none with PKCE) are supported" },
      { status: 400 },
    );
  }

  const clientId = `mcp_${randomBytes(16).toString("hex")}`;

  await db.insert(mcpOauthClients).values({
    clientId,
    clientName,
    redirectUris,
    grantTypes,
    tokenEndpointAuthMethod,
  });

  return NextResponse.json({
    client_id: clientId,
    client_name: clientName,
    redirect_uris: redirectUris,
    grant_types: grantTypes,
    token_endpoint_auth_method: tokenEndpointAuthMethod,
    response_types: ["code"],
  }, { status: 201 });
}
