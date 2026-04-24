import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mcpActivity } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function McpActivityPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  const rows = await db
    .select()
    .from(mcpActivity)
    .orderBy(desc(mcpActivity.createdAt))
    .limit(100);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-3">
        Admin / MCP
      </div>
      <h1 className="font-serif text-4xl text-wood mb-6 leading-tight">MCP activity log</h1>
      <p className="text-wood-light mb-8 max-w-2xl">
        The last 100 MCP tool calls. Expand a row to see full request and response bodies (only populated when verbose logging is on for the token).
      </p>

      {rows.length === 0 ? (
        <div className="bg-white/50 border border-wood/6 rounded-2xl p-8 text-center text-wood-light">
          No activity yet. Connect Claude and call a tool to populate this log.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <details key={r.id} className="bg-white/50 border border-wood/6 rounded-2xl p-4 text-sm">
              <summary className="cursor-pointer flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded ${
                    r.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {r.success ? "ok" : "err"}
                  </span>
                  <code className="text-xs text-wood-light/70 shrink-0">{r.method ?? "?"}</code>
                  {r.toolName && (
                    <code className="text-xs font-medium text-wood truncate">{r.toolName}</code>
                  )}
                  {r.errorMessage && (
                    <span className="text-xs text-red-700 truncate">{r.errorMessage}</span>
                  )}
                </div>
                <div className="text-xs text-wood-light/50 shrink-0">
                  {r.durationMs ?? "?"}ms &middot; {new Date(r.createdAt).toLocaleTimeString()}
                </div>
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-wood-light/40 mb-1">Request</div>
                  <pre className="bg-wood/5 rounded p-2 text-xs overflow-auto max-h-60">
                    {r.requestBody ? JSON.stringify(r.requestBody, null, 2) : "(verbose logging off)"}
                  </pre>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-wood-light/40 mb-1">Response</div>
                  <pre className="bg-wood/5 rounded p-2 text-xs overflow-auto max-h-60">
                    {r.responseBody ? JSON.stringify(r.responseBody, null, 2) : "(verbose logging off)"}
                  </pre>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </main>
  );
}
