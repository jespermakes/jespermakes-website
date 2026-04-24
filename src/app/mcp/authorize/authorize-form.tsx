"use client";

import { useState } from "react";

interface Props {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
}

export function AuthorizeForm({
  clientId,
  redirectUri,
  state,
  codeChallenge,
  codeChallengeMethod,
  scope,
}: Props) {
  const [loading, setLoading] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: "approve" | "deny") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/mcp/oauth/authorize-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          scope,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error_description || data.error || "Something went wrong.");
        setLoading(null);
        return;
      }
      if (data.redirect_to) {
        window.location.href = data.redirect_to;
      }
    } catch {
      setError("Network error. Try again.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => submit("approve")}
        disabled={loading !== null}
        className="w-full bg-wood text-cream rounded-xl py-3 font-semibold disabled:opacity-50"
      >
        {loading === "approve" ? "Approving..." : "Approve and connect"}
      </button>
      <button
        type="button"
        onClick={() => submit("deny")}
        disabled={loading !== null}
        className="w-full border border-wood/15 text-wood-light rounded-xl py-3 font-medium disabled:opacity-50"
      >
        {loading === "deny" ? "Denying..." : "Deny"}
      </button>
      {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
    </div>
  );
}
