"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BAMBU_STORE_COOKIE, type BambuStoreKey } from "@/lib/bambu-links";

/**
 * EU or US store. Writes a cookie and refreshes so every price and buy link on
 * the page is rebuilt on the server for that store. Always visible, the same
 * reason as the Rubio switcher: a guess from an IP address is sometimes wrong.
 */
export default function StoreSwitcher({ current }: { current: BambuStoreKey }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(key: BambuStoreKey) {
    if (key === current) return;
    document.cookie = `${BAMBU_STORE_COOKIE}=${key}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    start(() => router.refresh());
  }

  const opt = (key: BambuStoreKey, label: string) => (
    <button
      type="button"
      onClick={() => choose(key)}
      disabled={pending}
      aria-pressed={current === key}
      className={
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors " +
        (current === key ? "bg-[#00AE42] text-white" : "text-white/60 hover:text-white")
      }
    >
      {label}
    </button>
  );

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] p-1" role="group" aria-label="Which Bambu Lab store">
      <span className="px-2 text-xs text-white/45">Store</span>
      {opt("eu", "Europe, EUR")}
      {opt("us", "US, USD")}
    </div>
  );
}
