"use client";

import { useState } from "react";
import type { WindowKey, YouTubeWindow } from "@/lib/mediakit-stats";

/* Top countries by share of watch time, with a switch between the windows.
 * Every window prints the days it covers under the bars, so a number never
 * sits on the page without its window. See youtubeWindows() for why it is
 * watch time and not views. */
export function WatchTimeGeography({
  windows,
  initial = "28d",
  rows = 8,
}: {
  windows: YouTubeWindow[];
  initial?: WindowKey;
  rows?: number;
}) {
  const [key, setKey] = useState<WindowKey>(initial);
  const w = windows.find((x) => x.key === key) ?? windows[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Time window"
        className="inline-flex flex-wrap gap-1 p-1 mb-5 rounded-full bg-white/5"
      >
        {windows.map((x) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={x.key === w.key}
            onClick={() => setKey(x.key)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              x.key === w.key
                ? "bg-[#E8604C] text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="space-y-3">
        {w.countries.slice(0, rows).map((c) => (
          <div key={c.code} className="flex items-center gap-3 text-sm">
            <span className="w-14 text-white/60 shrink-0">{c.code}</span>
            <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E8604C] rounded-full transition-[width] duration-300"
                style={{ width: `${c.pct}%` }}
              />
            </div>
            <span className="w-12 text-right text-white/60 tabular-nums">{c.pct}%</span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-white/40 text-xs leading-relaxed">
        Share of watch time {w.range}. {w.hoursWatched} hours watched.
      </p>
    </div>
  );
}
