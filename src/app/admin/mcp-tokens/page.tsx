import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mcpTokens, mcpOauthClients } from "@/lib/db/schema";
import { TokenList } from "./token-list";

export const dynamic = "force-dynamic";

export default async function McpTokensPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  const rows = await db
    .select({
      id: mcpTokens.id,
      tokenType: mcpTokens.tokenType,
      clientId: mcpTokens.clientId,
      clientName: mcpOauthClients.clientName,
      scope: mcpTokens.scope,
      expiresAt: mcpTokens.expiresAt,
      revokedAt: mcpTokens.revokedAt,
      lastUsedAt: mcpTokens.lastUsedAt,
      verboseLogging: mcpTokens.verboseLogging,
      createdAt: mcpTokens.createdAt,
    })
    .from(mcpTokens)
    .leftJoin(mcpOauthClients, eq(mcpTokens.clientId, mcpOauthClients.clientId))
    .where(eq(mcpTokens.tokenType, "access"))
    .orderBy(desc(mcpTokens.createdAt))
    .limit(100);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-3">
        Admin / MCP
      </div>
      <h1 className="font-serif text-4xl text-wood mb-6 leading-tight">MCP access tokens</h1>
      <p className="text-wood-light mb-8 max-w-2xl">
        Every active Claude connection has an access token listed here. Revoke any token to disconnect that session immediately. Revoking an access token also revokes the refresh token paired with it.
      </p>
      <TokenList tokens={rows} />
    </main>
  );
}
