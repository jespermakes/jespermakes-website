/**
 * Title helpers.
 *
 * Two rules here, and the first one is Jesper's:
 *
 * 1. No em dashes. Anywhere. A separator inside a title template is worth
 *    hundreds of pages, and joining with " — " put an em dash on 116 of the
 *    site's 137 titles, two of them on every tool category page. The separator
 *    is a pipe.
 *
 * 2. Titles should read like a person wrote them. A title is the one line of
 *    the site most people ever see, so "Festool tools I actually use" beats
 *    "Festool | Tools" even though both fit. The stock pattern of stacking
 *    breadcrumbs into a title is the thing that makes a site look generated.
 *
 * Google shows roughly 60 characters before truncating, so `pageTitle` keeps
 * the subject and drops the brand rather than letting the end of a real
 * sentence get cut.
 */

export const TITLE_LIMIT = 60;

/** The one separator used across the site. Never an em dash. */
export const TITLE_SEPARATOR = " | ";

export const BRAND = "Jesper Makes";

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

/**
 * Next.js does not deep-merge `openGraph`: a page that sets its own replaces
 * the root object entirely, images included. Any page that overrides it and
 * might not have its own picture should fall back to this.
 */
export function ogImages(
  url: string | null | undefined,
  alt: string,
): OgImage[] {
  return url ? [{ url, alt }] : [{ ...DEFAULT_OG_IMAGE }];
}

/**
 * Build a page title from a subject plus optional suffix segments, ordered
 * least-important-last. Segments are dropped from the right while the result
 * is over the limit; an over-long subject is returned intact, because Google
 * truncating a real sentence beats us cutting it mid-word.
 *
 *   pageTitle("Festool DOMINO XL DF 700 EQ Joining Machine", BRAND)
 *     -> "Festool DOMINO XL DF 700 EQ Joining Machine"
 *   pageTitle("Get in touch", BRAND)
 *     -> "Get in touch | Jesper Makes"
 */
export function pageTitle(subject: string, ...suffixes: string[]): string {
  const base = subject.trim();
  for (let keep = suffixes.length; keep > 0; keep--) {
    const candidate = [base, ...suffixes.slice(0, keep)].join(TITLE_SEPARATOR);
    if (candidate.length <= TITLE_LIMIT) return candidate;
  }
  return base;
}

/**
 * Titles for the tool category pages, written out rather than assembled from
 * the category name. "Festool | Tools | Jesper Makes" is three nouns and no
 * information; "Festool tools I actually use" tells you whose opinion you are
 * about to read, which is the whole reason anyone lands there.
 */
export const CATEGORY_TITLES: Record<string, string> = {
  festool: "Festool tools I actually use",
  "power-tools": "Power tools that earn their space",
  "hand-tools": "Hand tools for joinery and timber framing",
  finishing: "Wood finishes I keep on the shelf",
  plywood: "Birch and spruce plywood I build with",
  "3d-printing-laser": "3D printers and lasers in the workshop",
  "workshop-essentials": "Clamps, squares and workshop basics",
  "office-youtube-gear": "Camera and studio gear I film with",
  "gardening-outdoors": "Outdoor gear around the workshop",
};
