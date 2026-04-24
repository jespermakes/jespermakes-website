import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { db } from "@/lib/db";
import { mcpTokens } from "@/lib/db/schema";
import { validateAccessToken } from "@/lib/mcp/tokens";
import { checkRateLimit } from "@/lib/mcp/rate-limit";
import { logActivity } from "@/lib/mcp/logging";
import { registerTools, type ToolContext } from "./tools";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  const body = await request.json().catch(() => null);

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

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  const response = await new Promise<{ status: number; body: unknown }>((resolve) => {
    let resolved = false;
    const mockRes = {
      statusCode: 200,
      setHeader: () => {},
      getHeader: () => undefined,
      writeHead: function (code: number) { this.statusCode = code; return this; },
      write: (chunk: any) => {
        if (!resolved) {
          resolved = true;
          try {
            const text = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
            const parsed = JSON.parse(text);
            resolve({ status: mockRes.statusCode, body: parsed });
          } catch {
            resolve({ status: mockRes.statusCode, body: null });
          }
        }
      },
      end: (chunk?: any) => {
        if (!resolved) {
          if (chunk) {
            resolved = true;
            try {
              const text = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
              const parsed = JSON.parse(text);
              resolve({ status: mockRes.statusCode, body: parsed });
            } catch {
              resolve({ status: mockRes.statusCode, body: null });
            }
          } else {
            resolved = true;
            resolve({ status: mockRes.statusCode, body: null });
          }
        }
      },
      on: () => mockRes,
      once: () => mockRes,
      emit: () => false,
    };

    const mockReq = {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      on: () => mockReq,
      once: () => mockReq,
    };

    // @ts-expect-error - we're feeding the transport a minimal mock req/res
    transport.handleRequest(mockReq, mockRes, body).catch((err: unknown) => {
      if (!resolved) {
        resolved = true;
        resolve({
          status: 500,
          body: {
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: err instanceof Error ? err.message : "Internal error",
            },
            id: (body as any)?.id ?? null,
          },
        });
      }
    });
  });

  const durationMs = Date.now() - startTime;
  const method = (body as any)?.method ?? null;
  const toolName = method === "tools/call" ? (body as any)?.params?.name ?? null : null;
  const success = response.status < 400 && !(response.body as any)?.error;

  logActivity({
    tokenId: token.id,
    clientId: token.clientId,
    userId: token.userId,
    method,
    toolName,
    durationMs,
    success,
    errorMessage: success ? null : JSON.stringify((response.body as any)?.error ?? null),
    requestBody: body,
    responseBody: response.body,
    verbose: token.verboseLogging,
    ipAddress,
  });

  return new NextResponse(JSON.stringify(response.body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

export { handler as GET, handler as POST };
