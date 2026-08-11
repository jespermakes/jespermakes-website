"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, REGION_ORDER, REGION_COOKIE, type RegionKey } from "@/lib/rubio-shop";

/**
 * Store picker. Writes a cookie and refreshes so the server rebuilds every
 * price and buy link for the chosen store.
 *
 * Deliberately always visible rather than auto-redirecting. Matcha Green only
 * exists on the US store, and an EU visitor who wants it must be able to get
 * there.
 */
export default function RegionSwitcher({ current }: { current: RegionKey }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function choose(key: RegionKey) {
    document.cookie = `${REGION_COOKIE}=${key}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setOpen(false);
    startTransition(() => router.refresh());
  }

  const region = REGIONS[current];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        <span aria-hidden>{region.flag}</span>
        <span>Shipping to {region.label}</span>
        <span aria-hidden className={"transition-transform " + (open ? "rotate-180" : "")}>
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-xl"
        >
          {REGION_ORDER.map((key) => {
            const r = REGIONS[key];
            const active = key === current;
            return (
              <li key={key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(key)}
                  disabled={pending}
                  className={
                    "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors " +
                    (active ? "bg-black/[0.04] font-semibold text-[#183029]" : "text-[#2C1810] hover:bg-black/[0.03]")
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden>{r.flag}</span>
                    {r.label}
                  </span>
                  <span className="text-xs text-black/40">{r.currency}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
