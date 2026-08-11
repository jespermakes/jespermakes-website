import type { ModuleTheme } from "./themes";

export type ModuleKind =
  | "hero"
  | "about"
  | "work"
  | "barn"
  | "creator_tools"
  | "blog"
  | "shop"
  | "youtube"
  | "newsletter"
  | "rubio";

export const MODULE_KINDS: ModuleKind[] = [
  "hero",
  "about",
  "work",
  "barn",
  "creator_tools",
  "blog",
  "shop",
  "youtube",
  "newsletter",
  "rubio",
];

export const MODULE_LABELS: Record<ModuleKind, string> = {
  hero: "Hero",
  about: "About strip",
  work: "Selected work",
  barn: "The barn",
  creator_tools: "Creator tools",
  blog: "Blog posts",
  shop: "Shop products",
  youtube: "YouTube videos",
  newsletter: "Newsletter",
  rubio: "Rubio Monocoat",
};

export interface Cta {
  label: string;
  url: string;
}

export interface HeroData {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  mediaImageId?: string;
  mediaOverlayText?: string;
  mediaYoutubeId?: string;
  /** Full-bleed background image path. When set, the hero renders the
   * cinematic dark layout (v3) instead of the split layout. */
  backgroundImage?: string;
  /** Small stat line under the CTAs, e.g. subscriber counts. */
  statsLine?: string;
  /** Identity index band rendered under the hero (01 Furniture, ...). */
  indexLinks?: Array<{ label: string; href: string }>;
  theme?: ModuleTheme;
}

export interface AboutData {
  title: string;
  body: string;
  imageId?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  direction?: "image-left" | "image-right";
  theme?: ModuleTheme;
}

export interface WorkItem {
  title: string;
  blurb: string;
  image: string;
  href: string;
  linkLabel?: string;
}

export interface WorkData {
  caps?: string;
  title: string;
  subtitle?: string;
  items: WorkItem[];
  ctaLabel?: string;
  ctaUrl?: string;
  theme?: ModuleTheme;
}

export interface BarnData {
  caps?: string;
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  theme?: ModuleTheme;
}

export interface CreatorToolsData {
  caps?: string;
  title: string;
  subtitle?: string;
  toolSlugs: string[];
  theme?: ModuleTheme;
}

export interface FeedData {
  caps?: string;
  title: string;
  /** Substring of title rendered in the amber accent color. */
  titleHighlight?: string;
  subtitle?: string;
  mode: "auto" | "manual";
  count?: number;
  ids?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  theme?: ModuleTheme;
}

export type BlogData = FeedData;
export type ShopData = FeedData;
export type YoutubeData = FeedData;

export interface NewsletterData {
  caps?: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  placeholder: string;
  showSubscriberCount: boolean;
  /** Small round portrait + name rendered as a sign-off under the form. */
  signatureImage?: string;
  signatureName?: string;
  theme?: ModuleTheme;
}

/** Rubio Monocoat band on the homepage. Leads on Matcha Green, the limited
 * edition colour Rubio developed with Jesper, and sends people into the shop.
 * Rendered in Rubio's own brand palette so it reads as a partner block. */
export interface RubioData {
  caps?: string;
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  videoEmbedUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
}

export type ModuleData =
  | HeroData
  | AboutData
  | WorkData
  | BarnData
  | CreatorToolsData
  | BlogData
  | ShopData
  | YoutubeData
  | NewsletterData
  | RubioData;

export interface PageSection {
  id: string;
  pageSlug: string;
  position: number;
  kind: ModuleKind;
  visible: boolean;
  hidden: boolean;
  data: ModuleData;
  createdAt: Date;
  updatedAt: Date;
}

export function isValidKind(kind: string): kind is ModuleKind {
  return MODULE_KINDS.includes(kind as ModuleKind);
}

export function defaultDataFor(kind: ModuleKind): ModuleData {
  switch (kind) {
    case "hero":
      return {
        title: "Build something real.",
        titleHighlight: "real.",
        subtitle: "Write something about what you do.",
        primaryCta: { label: "Watch on YouTube", url: "https://youtube.com/@JesperMakes" },
        secondaryCta: { label: "Browse the shop", url: "/shop" },
      };
    case "about":
      return {
        title: "About heading",
        body: "Your story in two short paragraphs.",
        direction: "image-left",
      };
    case "work":
      return {
        caps: "Selected work",
        title: "Furniture with a story in it",
        items: [],
        ctaLabel: "See the work →",
        ctaUrl: "/work",
      };
    case "barn":
      return {
        caps: "The barn",
        title: "Raising a barn the old way",
        body: "On South Fyn we are rebuilding an 1850s barn as a hand-cut timber frame workshop.",
        ctaLabel: "Follow the build",
        ctaUrl: "/barn",
      };
    case "creator_tools":
      return {
        caps: "Creator tools",
        title: "Free tools for makers",
        subtitle: "I build small tools when I need them. You can use them too.",
        toolSlugs: ["title-lab", "storyteller", "box-joint-jig"],
      };
    case "blog":
      return {
        caps: "From the workshop",
        title: "Latest writing",
        mode: "auto",
        count: 3,
        ctaLabel: "All posts \u2192",
        ctaUrl: "/blog",
      };
    case "shop":
      return {
        caps: "In the shop",
        title: "Plans, printables, and the occasional piece of merch",
        mode: "auto",
        count: 3,
        ctaLabel: "Full shop \u2192",
        ctaUrl: "/shop",
      };
    case "youtube":
      return {
        caps: "On YouTube",
        title: "Latest videos",
        mode: "auto",
        count: 3,
        ctaLabel: "Subscribe \u2192",
        ctaUrl: "https://youtube.com/@JesperMakes",
      };
    case "newsletter":
      return {
        caps: "The workshop letter",
        title: "A letter from the workshop",
        subtitle: "New videos, new tools, and the occasional long read. Once a week. Never boring.",
        buttonLabel: "Subscribe",
        placeholder: "your@email.com",
        showSubscriberCount: true,
      };
    case "rubio":
      return {
        caps: "Rubio Monocoat",
        title: "They let me make a colour",
        body: "Matcha Green is a limited edition Oil Plus 2C that Rubio and I made together.",
        ctaLabel: "See the colour",
        ctaUrl: "/rubio/matcha-green",
        secondaryLabel: "The whole Rubio shelf",
        secondaryUrl: "/rubio",
      };
  }
}
