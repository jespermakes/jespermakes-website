import { createHash, randomBytes } from "node:crypto";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpTokens } from "@/lib/db/schema";

function getPepper(): string {
  const pepper = process.env.MCP_TOKEN_PEPPER;
  if (!pepper) throw new Error("MCP_TOKEN_PEPPER env var is required");
  return pepper;
}

export function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(getPepper() + raw).digest("hex");
  return { raw, hash };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(getPepper() + raw).digest("hex");
}

export async function validateAccessToken(raw: string) {
  const hash = hashToken(raw);
  const rows = await db
    .select()
    .from(mcpTokens)
    .where(
      and(
        eq(mcpTokens.tokenHash, hash),
        eq(mcpTokens.tokenType, "access"),
        isNull(mcpTokens.revokedAt),
        gt(mcpTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function validateRefreshToken(raw: string) {
  const hash = hashToken(raw);
  const rows = await db
    .select()
    .from(mcpTokens)
    .where(
      and(
        eq(mcpTokens.tokenHash, hash),
        eq(mcpTokens.tokenType, "refresh"),
        isNull(mcpTokens.revokedAt),
        gt(mcpTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export const ACCESS_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;
export const AUTHORIZATION_CODE_LIFETIME_MS = 10 * 60 * 1000;
