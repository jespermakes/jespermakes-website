"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Token {
  id: string;
  tokenType: string;
  clientId: string;
  clientName: string | null;
  scope: string;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  verboseLogging: boolean;
  createdAt: Date;
}

export function TokenList({ tokens }: { tokens: Token[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function revoke(id: string) {
    if (!confirm("Revoke this token? The associated Claude session will disconnect.")) return;
    setPending(id);
    try {
      const res = await fetch(`/api/admin/mcp-tokens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      alert("Failed to revoke. Check the console.");
      console.error(e);
    } finally {
      setPending(null);
    }
  }

  async function toggleVerbose(id: string, current: boolean) {
    setPending(id);
    try {
      const res = await fetch(`/api/admin/mcp-tokens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verboseLogging: !current }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      alert("Failed to toggle verbose logging.");
      console.error(e);
    } finally {
      setPending(null);
    }
  }

  if (tokens.length === 0) {
    return (
      <div className="bg-white/50 border border-wood/6 rounded-2xl p-8 text-center text-wood-light">
        No access tokens yet. When you connect Claude as a custom connector, a token will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tokens.map((t) => {
        const isRevoked = t.revokedAt !== null;
        const isExpired = t.expiresAt < new Date();
        const isActive = !isRevoked && !isExpired;
        return (
          <div
            key={t.id}
            className={`bg-white/50 border rounded-2xl p-5 ${
              isActive ? "border-wood/8" : "border-wood/4 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-wood">
                    {t.clientName || t.clientId}
                  </span>
                  {isRevoked && (
                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
                      Revoked
                    </span>
                  )}
                  {!isRevoked && isExpired && (
                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-wood/10 text-wood-light px-2 py-0.5 rounded">
                      Expired
                    </span>
                  )}
                  {isActive && (
                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-wood-light/70 space-y-0.5">
                  <div>Client ID: <code>{t.clientId}</code></div>
                  <div>Scope: {t.scope}</div>
                  <div>Created: {new Date(t.createdAt).toLocaleString()}</div>
                  <div>Last used: {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString() : "never"}</div>
                  <div>Expires: {new Date(t.expiresAt).toLocaleString()}</div>
                  <div>Verbose logging: {t.verboseLogging ? "on" : "off"}</div>
                </div>
              </div>
              {isActive && (
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleVerbose(t.id, t.verboseLogging)}
                    disabled={pending === t.id}
                    className="text-xs border border-wood/15 text-wood-light hover:border-wood/30 rounded-lg px-3 py-1.5 disabled:opacity-50"
                  >
                    {t.verboseLogging ? "Disable verbose" : "Enable verbose"}
                  </button>
                  <button
                    type="button"
                    onClick={() => revoke(t.id)}
                    disabled={pending === t.id}
                    className="text-xs bg-red-50 border border-red-200 text-red-800 hover:bg-red-100 rounded-lg px-3 py-1.5 disabled:opacity-50"
                  >
                    {pending === t.id ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
