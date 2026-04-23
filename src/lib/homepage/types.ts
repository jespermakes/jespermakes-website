export type ModuleKind =
  | "hero"
  | "about"
  | "creator_tools"
  | "blog"
  | "shop"
  | "youtube"
  | "newsletter";

export const MODULE_KINDS: ModuleKind[] = [
  "hero",
  "about",
  "creator_tools",
  "blog",
  "shop",
  "youtube",
  "newsletter",
];

export const MODULE_LABELS: Record<ModuleKind, string> = {
  hero: "Hero",
  about: "About strip",
  creator_tools: "Creator tools",
  blog: "Blog posts",
  shop: "Shop products",
  youtube: "YouTube videos",
  newsletter: "Newsletter",
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
}

export interface AboutData {
  title: string;
  body: string;
  imageId?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  direction?: "image-left" | "image-right";
}

export interface CreatorToolsData {
  caps?: string;
  title: string;
  subtitle?: string;
  toolSlugs: string[];
}

export interface FeedData {
  caps?: string;
  title: string;
  subtitle?: string;
  mode: "auto" | "manual";
  count?: number;
  ids?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
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
}

export type ModuleData =
  | HeroData
  | AboutData
  | CreatorToolsData
  | BlogData
  | ShopData
  | YoutubeData
  | NewsletterData;

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
  }
}
