/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { db } from "@/lib/db";
import { mcpTokens } from "@/lib/db/schema";
import { validateAccessToken } from "@/lib/mcp/tokens";
import { checkRateLimit } from "@/lib/mcp/rate-limit";
import { logActivity } from "@/lib/mcp/logging";
import { registerTools, type ToolContext } from "./tools";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function unauthorized() {
  const issuer = process.env.MCP_ISSUER_URL || "https://jespermakes.com";
  return new NextResponse(
    JSON.stringify({ error: "unauthorized", error_description: "Bearer token required" }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": `Bearer realm="MCP", resource_metadata="${issuer}/.well-known/oauth-protected-resource"`,
      },
    },
  );
}

async function handler(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorized();
  }
  const rawToken = authHeader.slice(7);

  const token = await validateAccessToken(rawToken);
  if (!token) {
    return unauthorized();
  }

  const rateLimit = await checkRateLimit(token.id);
  if (!rateLimit.ok) {
    return new NextResponse(
      JSON.stringify({ error: "rate_limit_exceeded" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  // Bump lastUsedAt (fire and forget)
  db.update(mcpTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(mcpTokens.id, token.id))
    .catch(() => {});

  const startTime = Date.now();
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  // Parse body for logging (the transport will read it from the cloned request)
  let parsedBody: any = null;
  try {
    const text = await request.clone().text();
    if (text) parsedBody = JSON.parse(text);
  } catch {
    // Not JSON
  }

  const context: ToolContext = {
    userId: token.userId,
    tokenId: token.id,
    clientId: token.clientId,
  };

  const server = new McpServer(
    { name: "jespermakes-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  registerTools(server, context);

  // Use the Web Standard transport directly - no Node.js shim needed.
  // Next.js App Router gives us Web Request/Response natively.
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    const response = await transport.handleRequest(request);

    const durationMs = Date.now() - startTime;
    const method = parsedBody?.method ?? null;
    const toolName = method === "tools/call" ? parsedBody?.params?.name ?? null : null;

    // Try to read the response body for logging (clone so we can still return it)
    let responseBody: any = null;
    try {
      const cloned = response.clone();
      const text = await cloned.text();
      if (text) responseBody = JSON.parse(text);
    } catch {
      responseBody = null;
    }

    const success = response.status < 400 && !(responseBody?.error);

    logActivity({
      tokenId: token.id,
      clientId: token.clientId,
      userId: token.userId,
      method,
      toolName,
      durationMs,
      success,
      errorMessage: success ? null : JSON.stringify(responseBody?.error ?? null),
      requestBody: parsedBody,
      responseBody,
      verbose: token.verboseLogging,
      ipAddress,
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const errorBody = {
      jsonrpc: "2.0",
      error: { code: -32603, message },
      id: parsedBody?.id ?? null,
    };

    logActivity({
      tokenId: token.id,
      clientId: token.clientId,
      userId: token.userId,
      method: parsedBody?.method ?? null,
      toolName: parsedBody?.method === "tools/call" ? parsedBody?.params?.name ?? null : null,
      durationMs: Date.now() - startTime,
      success: false,
      errorMessage: message,
      requestBody: parsedBody,
      responseBody: errorBody,
      verbose: token.verboseLogging,
      ipAddress,
    });

    return new NextResponse(JSON.stringify(errorBody), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export { handler as GET, handler as POST, handler as DELETE };
