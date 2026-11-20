/**
 * Media kit figures, generated. DO NOT EDIT THE NUMBERS BY HAND.
 *
 * src/data/mediakit-stats.json is rewritten by the Brain job
 * (brain-server scripts/mediakit_refresh.py, daily) straight from the YouTube
 * Data API and the Meta Graph API, then committed and pushed, which deploys.
 *
 * Hand-editing was tried and failed twice in three days: Facebook moved 25x in
 * a week and the page understated it by that much while carrying a "verified"
 * badge. Numbers that move belong in a generated file, not in JSX.
 *
 * The JSON holds RAW integers only. All presentation lives here, so the
 * generator never has to know how a number is displayed.
 */
import raw from "@/data/mediakit-stats.json";

export const stats = raw;

/** 44143835 -> "44.1M", 246049 -> "246K", 10828 -> "10.8K", 44000 -> "44K".
 *
 *  One decimal below 100K, none above. 10,828 rendered as "11K" throws away
 *  the precision on a number that only just crossed 10K, and on a media kit
 *  the crossing is the point. Trailing ".0" is stripped so 44,000 reads "44K"
 *  rather than "44.0K". */
export function compact(n: number): string {
  const trim = (x: string) => x.replace(/\.0$/, "");
  if (n >= 1_000_000) return `${trim((n / 1_000_000).toFixed(1))}M`;
  if (n >= 100_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${trim((n / 1000).toFixed(1))}K`;
  return n.toLocaleString("en-US");
}

/** Exact, thousands-separated. For figures a sponsor may want to check. */
export function exact(n: number): string {
  return n.toLocaleString("en-US");
}

/** Followers across all five channels, rounded DOWN to the nearest 1K.
 *  Rounding down keeps the headline true between refreshes: the number only
 *  ever understates, never overstates. */
export function followerHeadline(): string {
  const t =
    raw.youtube.subscribers +
    raw.in_the_rough.subscribers +
    raw.instagram.followers +
    raw.tiktok.followers +
    raw.facebook.followers;
  return `${Math.floor(t / 1000)}K+`;
}

/** Lifetime views where a lifetime figure exists (YouTube x2, Instagram).
 *  TikTok has no public lifetime total and Facebook publishes none at all, so
 *  both are excluded and the "+" carries them. Rounded down for the same
 *  reason as above. */
export function viewsHeadline(): string {
  const t = raw.youtube.views + raw.in_the_rough.views + raw.instagram.lifetime_views;
  return `${Math.floor(t / 1_000_000)}M+`;
}

/** "November 2026", for "Updated ..." lines. */
export function measuredMonth(): string {
  return new Date(raw.measured_at + "T00:00:00Z").toLocaleDateString("en-GB", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
}

/** "12 August 2026" */
export function measuredOn(): string {
  return new Date(raw.measured_at + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

/* ------------------------------------------------------------------ */
/*  YouTube windows: where the watching happens                         */
/* ------------------------------------------------------------------ */

/* The geography leads on share of WATCH TIME, never views, and every window
 * says which days it covers. Views by country follow whichever Short is
 * travelling: on 9 Sept 2026 the 90-day window by views read Denmark 42.1
 * percent, by watch time 3.3 percent. A sponsor landing on that would see a
 * Danish channel. Watch time is also untouched by YouTube's 24 Aug 2026 change
 * to what counts as a view, so the three windows compare honestly.
 *
 * The share is of ALL watch time in the window, including the few percent
 * YouTube cannot place in a country, so it never overstates a country. Raw
 * minutes come from the Brain job (YouTube Analytics API, daily); Brain keeps
 * every country, the JSON carries the top ten. */

export type WindowKey = "28d" | "12mo" | "all";

export interface CountryShare {
  code: string;
  pct: number;
}

export interface YouTubeWindow {
  key: WindowKey;
  /** Tab text. */
  tab: string;
  /** Which days, as it reads after "Share of watch time":
   *  "over the last 28 days (21 Oct to 17 Nov 2026)". */
  range: string;
  /** "46.9K" */
  hoursWatched: string;
  countries: CountryShare[];
}

const TABS: Record<WindowKey, string> = {
  "28d": "28 days",
  "12mo": "12 months",
  all: "All time",
};

function day(iso: string, withYear: boolean): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", timeZone: "UTC",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

function rangeLabel(key: WindowKey, start: string, end: string): string {
  if (key === "all") return `since the channel started, up to ${day(end, true)}`;
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const span = key === "28d" ? "the last 28 days" : "the last 12 months";
  return `over ${span} (${day(start, !sameYear)} to ${day(end, true)})`;
}

/** The three windows, ready to render: 28 days, 12 months, all time. */
export function youtubeWindows(): YouTubeWindow[] {
  return raw.youtube_windows.map((w) => {
    const key = w.key as WindowKey;
    return {
      key,
      tab: TABS[key],
      range: rangeLabel(key, w.start, w.end),
      hoursWatched: compact(Math.round(w.watch_minutes / 60)),
      countries: w.countries.map((c) => ({
        code: c.code,
        pct: Math.round((c.watch_minutes / w.watch_minutes) * 1000) / 10,
      })),
    };
  });
}
