"use client";

import { useState } from "react";
import { SupportButtons } from "./support-buttons";

export function FreePlanClaim({
  sku,
  downloadLabel,
  suggested,
}: {
  sku: string;
  downloadLabel: string;
  suggested?: number[];
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/plans/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sku, consent }),
      });
      const data = await res.json();
      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  if (downloadUrl) {
    return (
      <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6">
        <p className="font-semibold text-wood mb-3">
          Ready. We also emailed you the link.
        </p>
        <a
          href={downloadUrl}
          className="inline-block bg-forest hover:bg-forest-dark text-cream px-8 py-4 rounded-lg font-medium text-lg transition-colors"
        >
          {downloadLabel}
        </a>
        <div className="mt-6 pt-5 border-t border-wood/[0.08]">
          <p className="text-sm text-wood-light mb-3">
            These plans are free and stay free. If they save you time, you can
            leave something in the jar:
          </p>
          <SupportButtons compact suggested={suggested} />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={claim}
      className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6"
    >
      <p className="font-semibold text-wood mb-1">Free download</p>
      <p className="text-sm text-wood-light mb-4">
        Tell us where to send it and the link appears right here too.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-wood/15 bg-white/80 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-forest hover:bg-forest-dark disabled:opacity-60 text-cream px-8 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? "One second…" : "Get the plans"}
        </button>
      </div>
      <label className="flex items-start gap-2 mt-3 text-xs text-wood-light cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Also send me The Workshop Letter (about once a month, unsubscribe
          anytime). The download works either way.
        </span>
      </label>
      {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
    </form>
  );
}
