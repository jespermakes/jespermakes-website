/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
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

function toNodeRequest(webRequest: NextRequest, bodyBuffer: Buffer): IncomingMessage {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  req.method = webRequest.method;
  req.url = new URL(webRequest.url).pathname + new URL(webRequest.url).search;

  const headers: Record<string, string> = {};
  webRequest.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  req.headers = headers;

  req.push(bodyBuffer);
  req.push(null);

  return req;
}

class BufferedResponse extends ServerResponse {
  private chunks: Buffer[] = [];
  public done: Promise<void>;
  private resolveDone!: () => void;

  constructor(req: IncomingMessage) {
    super(req);
    this.done = new Promise((resolve) => {
      this.resolveDone = resolve;
    });

    const originalWrite = this.write.bind(this);
    const originalEnd = this.end.bind(this);

    this.write = ((chunk: any, ...args: any[]) => {
      if (chunk) {
        this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      return originalWrite(chunk, ...args);
    }) as any;

    this.end = ((chunk?: any, ...args: any[]) => {
      if (chunk) {
        this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      const result = originalEnd(chunk, ...args);
      this.resolveDone();
      return result;
    }) as any;
  }

  getBuffered(): { status: number; headers: Record<string, string>; body: Buffer } {
    const headers: Record<string, string> = {};
    for (const [name, value] of Object.entries(this.getHeaders())) {
      if (typeof value === "string") {
        headers[name] = value;
      } else if (Array.isArray(value)) {
        headers[name] = value.join(", ");
      } else if (value != null) {
        headers[name] = String(value);
      }
    }
    return {
      status: this.statusCode || 200,
      headers,
      body: Buffer.concat(this.chunks),
    };
  }
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

  db.update(mcpTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(mcpTokens.id, token.id))
    .catch(() => {});

  const startTime = Date.now();
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  const bodyText = await request.text();
  const bodyBuffer = Buffer.from(bodyText, "utf8");
  let parsedBody: any = null;
  try {
    parsedBody = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    // Not JSON - let the transport handle it
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

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  const nodeReq = toNodeRequest(request, bodyBuffer);
  const nodeRes = new BufferedResponse(nodeReq);

  try {
    await transport.handleRequest(nodeReq, nodeRes, parsedBody);
    await nodeRes.done;
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

  const { status, headers, body } = nodeRes.getBuffered();
  const durationMs = Date.now() - startTime;
  const method = parsedBody?.method ?? null;
  const toolName = method === "tools/call" ? parsedBody?.params?.name ?? null : null;

  // ============================================================
  // DIAGNOSTIC LOGGING - TEMPORARY, REMOVE IN NEXT PATCH
  // ============================================================
  const bodyAsString = body.toString("utf8");
  console.log("[MCP DIAG] === Transport response for method:", method);
  console.log("[MCP DIAG] Client Accept header:", request.headers.get("accept"));
  console.log("[MCP DIAG] Response status:", status);
  console.log("[MCP DIAG] Response headers (from transport):", JSON.stringify(headers, null, 2));
  console.log("[MCP DIAG] Response body length (bytes):", body.length);
  console.log("[MCP DIAG] Response body (raw utf8):", JSON.stringify(bodyAsString));
  console.log("[MCP DIAG] First 10 byte values:", Array.from(body.slice(0, 10)));
  console.log("[MCP DIAG] ===");
  // ============================================================

  let responseBody: any = null;
  try {
    if (bodyAsString) responseBody = JSON.parse(bodyAsString);
  } catch {
    // Body isn't JSON (likely SSE). Store raw for diagnostics.
    responseBody = {
      _raw: bodyAsString.slice(0, 2000),
      _contentType: headers["content-type"] || "unknown",
      _status: status,
      _bodyLength: body.length,
      _acceptHeader: request.headers.get("accept"),
      _allResponseHeaders: headers,
    };
  }

  const success = status < 400 && !(typeof responseBody === "object" && responseBody?.error);

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
    verbose: true, // force verbose for diagnostics
    ipAddress,
  });

  const responseHeaders = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (["connection", "transfer-encoding", "keep-alive"].includes(name.toLowerCase())) continue;
    responseHeaders.set(name, value);
  }
  if (!responseHeaders.has("content-type")) {
    responseHeaders.set("content-type", "application/json");
  }

  // ============================================================
  // DIAGNOSTIC LOGGING - TEMPORARY, REMOVE IN NEXT PATCH
  // ============================================================
  const finalHeaders: Record<string, string> = {};
  responseHeaders.forEach((value, key) => { finalHeaders[key] = value; });
  console.log("[MCP DIAG] === Final response we're sending to Claude");
  console.log("[MCP DIAG] Final status:", status);
  console.log("[MCP DIAG] Final headers:", JSON.stringify(finalHeaders, null, 2));
  console.log("[MCP DIAG] Final body (utf8):", JSON.stringify(bodyAsString));
  console.log("[MCP DIAG] ===");
  // ============================================================

  return new NextResponse(new Uint8Array(body), {
    status,
    headers: responseHeaders,
  });
}

export { handler as GET, handler as POST };
