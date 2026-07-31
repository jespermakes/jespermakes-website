"use client";

import { useState } from "react";

const TIERS = [
  { eur: 12, label: "Standard" },
  { eur: 19, label: "Supporter" },
  { eur: 30, label: "Patron" },
];

export function TieredBuyButton({ sku }: { sku: string }) {
  const [tier, setTier] = useState(TIERS[0].eur);
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, amountCents: tier * 100 }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {TIERS.map((t) => (
          <button
            key={t.eur}
            onClick={() => setTier(t.eur)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              tier === t.eur
                ? "bg-forest text-cream border-forest"
                : "bg-white/60 text-wood-light border-wood/15 hover:border-forest/40"
            }`}
          >
            €{t.eur}
            <span className="block text-[10px] font-normal opacity-80">
              {t.label}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full sm:w-auto bg-forest hover:bg-forest-dark disabled:opacity-60 text-cream px-8 py-4 rounded-lg font-medium text-lg transition-colors"
      >
        {loading ? "Redirecting…" : `Buy now — €${tier}`}
      </button>
      <p className="text-xs text-wood-light/70 mt-2">
        Same files at every tier. The higher tiers are just a thank you.
      </p>
    </div>
  );
}
