"use client";

import { useState } from "react";
import { SupportButtons } from "./support-buttons";

// The beacons pattern: a normal-looking product with an editable price
// field prefilled to 0. Keep the 0 and it is a free download; replace the
// 0 and the same button runs a Stripe payment for that amount. The files
// are delivered by email in both cases, before any payment starts.
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
  const [amount, setAmount] = useState("0");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const parsedAmount = (() => {
    const n = parseFloat(amount.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (parsedAmount > 0 && parsedAmount < 2) {
      setError("Smallest paid amount is €2. Or keep it at 0, that is fine too.");
      return;
    }

    setLoading(true);
    try {
      // Files first, always. The download link also goes out by email.
      const res = await fetch("/api/plans/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sku, consent }),
      });
      const data = await res.json();
      if (!data.downloadUrl) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      if (parsedAmount >= 2) {
        // Then the payment they chose. Files are already on their way.
        const pay = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: "support",
            amountCents: Math.round(parsedAmount * 100),
            forSku: sku,
          }),
        });
        const payData = await pay.json();
        if (payData.url) {
          window.location.href = payData.url;
          return;
        }
        setNotice(
          "The payment step did not start, but your files are on the way to your inbox."
        );
      }

      setDownloadUrl(data.downloadUrl);
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
        {notice && <p className="text-sm text-wood-light mb-3">{notice}</p>}
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
      <div className="flex items-end gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-wood-light mb-1">
            Price
          </label>
          <div className="flex items-center rounded-lg border border-wood/15 bg-white/80 px-3">
            <span className="text-wood-light text-lg">€</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-20 px-2 py-3 bg-transparent text-lg font-serif text-wood outline-none"
              aria-label="Price, editable, zero means free"
            />
          </div>
        </div>
        <p className="text-xs text-wood-light/70 pb-2">
          Name your price. 0 is a real option, the files are yours either way.
        </p>
      </div>

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
          {loading
            ? "One second…"
            : parsedAmount >= 2
              ? `Get the files — €${parsedAmount % 1 === 0 ? parsedAmount : parsedAmount.toFixed(2)}`
              : "Get the files"}
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
