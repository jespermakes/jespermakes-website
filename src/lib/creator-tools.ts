export interface CreatorToolEntry {
  slug: string;
  name: string;
  description: string;
  url: string;
  glyph: string;
  tint: "amber" | "green";
}

export const CREATOR_TOOL_REGISTRY: Record<string, CreatorToolEntry> = {
  "title-lab": {
    slug: "title-lab",
    name: "Title Lab",
    description: "AI YouTube title analysis trained on what actually works.",
    url: "/title-lab",
    glyph: "\u2726",
    tint: "amber",
  },
  "storyteller": {
    slug: "storyteller",
    name: "Storyteller",
    description: "Find the story hiding in your next build.",
    url: "/storyteller",
    glyph: "\u25C8",
    tint: "green",
  },
  "box-joint-jig": {
    slug: "box-joint-jig",
    name: "Box Joint Jig",
    description: "Generate a cut-ready SVG template for any wood thickness.",
    url: "/box-joint-jig",
    glyph: "\u25C7",
    tint: "amber",
  },
  "cone-lamp": {
    slug: "cone-lamp",
    name: "Cone Lamp",
    description: "Plans and assembly for the laser-cut pendant lamp.",
    url: "/cone-lamp",
    glyph: "\u25D0",
    tint: "green",
  },
};

export const CREATOR_TOOL_SLUGS = Object.keys(CREATOR_TOOL_REGISTRY);
