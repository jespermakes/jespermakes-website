/**
 * Title helpers.
 *
 * Google shows roughly 60 characters of a title before it truncates. Titles
 * here are assembled as `<thing> — <context> — Jesper Makes`, which pushed a
 * dozen blog posts and tool pages past that: the brand suffix survived and the
 * end of the actual title got cut.
 *
 * `pageTitle` keeps the most specific part and drops decoration from the right
 * until the whole thing fits. If the bare subject is itself over the limit it
 * is returned intact — Google truncating a real sentence reads better than us
 * cutting it mid-word, and the fix for those is a shorter post title.
 */

export const TITLE_LIMIT = 60;

/**
 * The site-wide share image.
 *
 * Next.js does not deep-merge `openGraph`: a page that sets its own replaces
 * the root object entirely, images included. So a blog post with no hero, or
 * one of the 45 tools with no product shot, silently lost the default card
 * even once the root layout had one. Any page that overrides `openGraph` and
 * might not have its own picture should fall back to this.
 */
export interface OgImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export const DEFAULT_OG_IMAGE: OgImage = {
  url: "/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "Jesper marking out a board in his workshop",
};

/** The page's own image if it has one, otherwise the site default. */
export function ogImages(
  url: string | null | undefined,
  alt: string,
): OgImage[] {
  return url ? [{ url, alt }] : [{ ...DEFAULT_OG_IMAGE }];
}

/**
 * Build a page title from a subject plus optional suffix segments, ordered
 * least-important-last. Segments are dropped from the right while the result
 * is over the limit.
 *
 *   pageTitle("Festool DOMINO XL DF 700 EQ Joining Machine", "Tools", "Jesper Makes")
 *     -> "Festool DOMINO XL DF 700 EQ Joining Machine" (both suffixes dropped)
 *   pageTitle("Blog", "Jesper Makes")
 *     -> "Blog — Jesper Makes"
 */
export function pageTitle(subject: string, ...suffixes: string[]): string {
  const base = subject.trim();
  for (let keep = suffixes.length; keep > 0; keep--) {
    const candidate = [base, ...suffixes.slice(0, keep)].join(" — ");
    if (candidate.length <= TITLE_LIMIT) return candidate;
  }
  return base;
}
