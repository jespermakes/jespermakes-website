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
  "studio": {
    slug: "studio",
    name: "Design Studio",
    description: "Full 2D design app for laser and CNC. Draw, nest, export.",
    url: "/studio",
    glyph: "\u25A3",
    tint: "amber",
  },
  "marketplace": {
    slug: "marketplace",
    name: "Workbench",
    description: "Community gallery of designs made in the Studio.",
    url: "/marketplace",
    glyph: "\u25C9",
    tint: "green",
  },
  "rubio": {
    slug: "rubio",
    name: "Rubio Finish Guide",
    description: "Find the right finish and color for your wood.",
    // /rubio is the shop now; the wizard lives one level down.
    url: "/rubio/guide",
    glyph: "\u25CD",
    tint: "amber",
  },
  "lamp-designer": {
    slug: "lamp-designer",
    name: "Lamp Designer",
    description: "Design your own printable lamp in 3D. Beta.",
    url: "/lamp-designer",
    glyph: "\u25CB",
    tint: "green",
  },
};

export const CREATOR_TOOL_SLUGS = Object.keys(CREATOR_TOOL_REGISTRY);
