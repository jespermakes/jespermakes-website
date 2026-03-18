"use client";

import { useState } from "react";

export function BuyButton() {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="w-full sm:w-auto bg-amber hover:bg-amber-dark disabled:opacity-60 text-cream px-8 py-4 rounded-lg font-medium text-lg transition-colors"
    >
      {loading ? "Redirecting…" : "Buy now — €35"}
    </button>
  );
}
