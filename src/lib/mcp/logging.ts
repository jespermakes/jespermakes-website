import { db } from "@/lib/db";
import { mcpActivity } from "@/lib/db/schema";

interface LogArgs {
  tokenId?: string | null;
  clientId?: string | null;
  userId?: string | null;
  method?: string | null;
  toolName?: string | null;
  durationMs?: number;
  success: boolean;
  errorMessage?: string | null;
  requestBody?: unknown;
  responseBody?: unknown;
  verbose: boolean;
  ipAddress?: string | null;
}

export function logActivity(args: LogArgs): void {
  const row = {
    tokenId: args.tokenId ?? null,
    clientId: args.clientId ?? null,
    userId: args.userId ?? null,
    method: args.method ?? null,
    toolName: args.toolName ?? null,
    durationMs: args.durationMs ?? null,
    success: args.success,
    errorMessage: args.errorMessage ?? null,
    requestBody: args.verbose ? (args.requestBody ?? null) : null,
    responseBody: args.verbose ? (args.responseBody ?? null) : null,
    ipAddress: args.ipAddress ?? null,
  };

  db.insert(mcpActivity)
    .values(row)
    .catch((err) => {
      console.error("[MCP] Failed to log activity:", err);
    });
}
