"use client";

import { useState } from "react";

const SUGGESTED = [5, 15, 30];

export function SupportButtons({ compact = false }: { compact?: boolean }) {
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState<number | "custom" | null>(null);
  const [error, setError] = useState("");

  async function pay(amountEur: number, key: number | "custom") {
    if (!Number.isFinite(amountEur) || amountEur < 2) {
      setError("Minimum is 2 EUR");
      return;
    }
    setError("");
    setLoading(key);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: "support",
          amountCents: Math.round(amountEur * 100),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Something went wrong");
    } catch {
      setError("Something went wrong");
    }
    setLoading(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {SUGGESTED.map((amount) => (
          <button
            key={amount}
            onClick={() => pay(amount, amount)}
            disabled={loading !== null}
            className="bg-amber/10 border border-amber/25 text-amber-dark hover:bg-amber/20 disabled:opacity-60 px-5 py-3 rounded-lg font-semibold transition-colors"
          >
            {loading === amount ? "…" : `€${amount}`}
          </button>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={2}
            placeholder="Other"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-24 px-3 py-3 rounded-lg border border-wood/15 bg-white/70 text-sm"
          />
          <button
            onClick={() => pay(Number(custom), "custom")}
            disabled={loading !== null || !custom}
            className="bg-wood text-cream hover:bg-wood-light disabled:opacity-60 px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            {loading === "custom" ? "…" : "Give"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
      {!compact && (
        <p className="text-xs text-wood-light/70 mt-3">
          Handled by Stripe. One-time, no account, no strings.
        </p>
      )}
    </div>
  );
}
