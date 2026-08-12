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

/** 44143835 -> "44.1M", 232636 -> "233K", 8842 -> "8,842". */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
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

/** "12 August 2026" */
export function measuredOn(): string {
  return new Date(raw.measured_at + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}
