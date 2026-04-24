import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mcpOauthClients } from "@/lib/db/schema";
import { AuthorizeForm } from "./authorize-form";

export const dynamic = "force-dynamic";

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    response_type?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
    scope?: string;
  }>;
}) {
  const session = await auth();
  const sp = await searchParams;

  if (!session?.user?.email) {
    const qs = new URLSearchParams(sp as Record<string, string>).toString();
    redirect(`/login?callbackUrl=/mcp/authorize?${encodeURIComponent(qs)}`);
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return (
      <main className="min-h-screen bg-cream px-6 py-16 md:py-24">
        <div className="max-w-xl mx-auto">
          <h1 className="font-serif text-3xl text-wood mb-4">Not authorized</h1>
          <p className="text-wood-light">
            Only the site admin can approve MCP connections.
          </p>
        </div>
      </main>
    );
  }

  const { client_id, redirect_uri, response_type, code_challenge, code_challenge_method, state, scope } = sp;

  if (!client_id || !redirect_uri || !code_challenge) {
    return renderError("Missing required parameters (client_id, redirect_uri, code_challenge).");
  }

  if (response_type !== "code") {
    return renderError(`Unsupported response_type: ${response_type}. Only 'code' is supported.`);
  }

  if (code_challenge_method && code_challenge_method !== "S256") {
    return renderError("Only S256 PKCE is supported.");
  }

  const clientRows = await db
    .select()
    .from(mcpOauthClients)
    .where(eq(mcpOauthClients.clientId, client_id))
    .limit(1);

  const client = clientRows[0];
  if (!client || client.revoked) {
    return renderError("Unknown or revoked client.");
  }

  if (!client.redirectUris.includes(redirect_uri)) {
    return renderError("The redirect_uri does not match the registered URIs for this client.");
  }

  return (
    <main className="min-h-screen bg-cream px-6 py-16 md:py-24">
      <div className="max-w-xl mx-auto">
        <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-3">
          Authorization requested
        </div>
        <h1 className="font-serif text-4xl text-wood mb-6 leading-tight">
          Let {client.clientName} connect to Jesper Makes admin?
        </h1>
        <div className="bg-white/50 border border-wood/6 rounded-2xl p-6 mb-6">
          <p className="text-wood-light mb-4">
            Approving will let this client read and modify data on the Jesper Makes admin
            through the MCP server. You can revoke this connection at any time from
            <span className="text-wood font-medium"> /admin/mcp-tokens</span>.
          </p>
          <div className="text-sm text-wood-light/70 space-y-1">
            <div>
              <span className="font-medium text-wood-light">Client:</span> {client.clientName}
            </div>
            <div>
              <span className="font-medium text-wood-light">Client ID:</span>{" "}
              <code className="text-xs">{client.clientId}</code>
            </div>
            <div>
              <span className="font-medium text-wood-light">Redirect:</span>{" "}
              <code className="text-xs break-all">{redirect_uri}</code>
            </div>
            <div>
              <span className="font-medium text-wood-light">Scope:</span> {scope || "mcp"}
            </div>
          </div>
        </div>

        <AuthorizeForm
          clientId={client_id}
          redirectUri={redirect_uri}
          state={state ?? ""}
          codeChallenge={code_challenge}
          codeChallengeMethod={code_challenge_method || "S256"}
          scope={scope || "mcp"}
        />
      </div>
    </main>
  );
}

function renderError(message: string) {
  return (
    <main className="min-h-screen bg-cream px-6 py-16 md:py-24">
      <div className="max-w-xl mx-auto">
        <h1 className="font-serif text-3xl text-wood mb-4">Can&apos;t process this request</h1>
        <p className="text-wood-light">{message}</p>
      </div>
    </main>
  );
}
