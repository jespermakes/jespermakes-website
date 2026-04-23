export type ModuleTheme =
  | "default"
  | "cream"
  | "white"
  | "wood-soft"
  | "forest-soft"
  | "wood"
  | "forest";

export const THEME_OPTIONS: Array<{ value: ModuleTheme; label: string; swatch: string }> = [
  { value: "default", label: "Default", swatch: "default" },
  { value: "cream", label: "Cream", swatch: "#FAF7F2" },
  { value: "white", label: "White", swatch: "#FFFFFF" },
  { value: "wood-soft", label: "Soft wood", swatch: "#F0EAE1" },
  { value: "forest-soft", label: "Soft forest", swatch: "#EEF2EC" },
  { value: "wood", label: "Wood", swatch: "#2C1810" },
  { value: "forest", label: "Forest", swatch: "#5A7A5A" },
];

export interface ThemeStyle {
  /** Outer section bg class */
  bg: string;
  /** Heading color class (h2, h1) */
  heading: string;
  /** Body text color class (non-card prose: hero subtitle, about body) */
  text: string;
  /** Small caps label color class */
  caps: string;
  /** CTA link color class, e.g. "All posts →" */
  accent: string;
  /** Accent phrase color (italic highlight inside a heading) */
  highlight: string;
  /** Subtle prose color for bylines, dates, etc. */
  muted: string;
}

/** Full theme definitions. Every key in ModuleTheme except "default" needs one. */
const LIGHT: ThemeStyle = {
  bg: "",
  heading: "text-wood",
  text: "text-wood-light/80",
  caps: "text-wood-light/40",
  accent: "text-forest hover:text-forest/80",
  highlight: "text-forest",
  muted: "text-wood-light/60",
};

export const THEMES: Record<Exclude<ModuleTheme, "default">, ThemeStyle> = {
  cream: {
    ...LIGHT,
    bg: "bg-cream",
  },
  white: {
    ...LIGHT,
    bg: "bg-white",
  },
  "wood-soft": {
    ...LIGHT,
    bg: "bg-wood/[0.03]",
  },
  "forest-soft": {
    ...LIGHT,
    bg: "bg-forest/[0.08]",
  },
  wood: {
    bg: "bg-wood",
    heading: "text-cream",
    text: "text-cream/75",
    caps: "text-cream/40",
    accent: "text-forest-light hover:text-cream",
    highlight: "text-amber",
    muted: "text-cream/50",
  },
  forest: {
    bg: "bg-forest",
    heading: "text-cream",
    text: "text-cream/85",
    caps: "text-cream/50",
    accent: "text-cream hover:text-cream/80",
    highlight: "text-amber",
    muted: "text-cream/60",
  },
};

/** Each module's designed default. Keep in sync with what shipped. */
export const DEFAULT_THEMES: Record<string, Exclude<ModuleTheme, "default">> = {
  hero: "cream",
  about: "wood",
  creator_tools: "cream",
  blog: "wood-soft",
  shop: "cream",
  youtube: "wood-soft",
  newsletter: "forest-soft",
};

/** Resolve a possibly-"default" theme for a given module kind. */
export function resolveTheme(kind: string, theme?: ModuleTheme): ThemeStyle {
  const key = !theme || theme === "default" ? DEFAULT_THEMES[kind] ?? "cream" : theme;
  return THEMES[key as Exclude<ModuleTheme, "default">] ?? THEMES.cream;
}
