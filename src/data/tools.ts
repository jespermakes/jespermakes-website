export type BuyLink = {
  label: string;
  url: string;
  region?: "us" | "eu" | "global";
  badge?: string;
};

export type Tool = {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  categoryIcon: string;
  image?: string;
  badge?: "Ambassador";
  buyLinks: BuyLink[];
  youtubeVideos?: string[];
};

export const tools: Tool[] = [
  // Power Tools
  {
    slug: "festool-track-saw-ts-55",
    name: "Festool Track Saw TS 55",
    description:
      "My most-used tool. Perfectly straight cuts every time. Worth every penny if you're serious about woodworking.",
    category: "Power Tools",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-cordless-drill-t-18",
    name: "Festool Cordless Drill T 18",
    description:
      "Lightweight, powerful, and the battery system works across all Festool cordless tools.",
    category: "Power Tools",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-random-orbital-sander-ets-150",
    name: "Festool Random Orbital Sander ETS 150",
    description:
      "Dust extraction is unreal. Makes sanding almost enjoyable.",
    category: "Power Tools",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-domino-df-500",
    name: "Festool Domino DF 500",
    description:
      "Game changer for joinery. Fast, accurate, and makes strong joints without complicated setups.",
    category: "Power Tools",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "ap-700-nail-pusher",
    name: "AP 700 Nail Pusher",
    description:
      "Essential for pallet work. Pushes nails out cleanly without destroying the wood.",
    category: "Power Tools",
    categoryIcon: "⚡",
    buyLinks: [],
  },

  // Finishing
  {
    slug: "rubio-monocoat-oil-plus-2c",
    name: "Rubio Monocoat Oil Plus 2C",
    description:
      "One-coat finish that brings out incredible grain. Natural look, food safe, and easy to apply. My go-to for everything.",
    category: "Finishing",
    categoryIcon: "🎨",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "rubio-monocoat-universal-maintenance-oil",
    name: "Rubio Monocoat Universal Maintenance Oil",
    description:
      "For maintaining and refreshing pieces finished with Monocoat. Simple upkeep.",
    category: "Finishing",
    categoryIcon: "🎨",
    badge: "Ambassador",
    buyLinks: [],
  },

  // 3D Printing & Laser
  {
    slug: "bambu-lab-x1-carbon",
    name: "Bambu Lab X1 Carbon",
    description:
      "Fast, reliable, and the multi-material system opens up wild possibilities. Used it for the Cone Lamp project.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    buyLinks: [],
  },
  {
    slug: "xtool-laser-cutter",
    name: "xTool Laser Cutter",
    description:
      "Clean cuts in wood, acrylic, and more. Great for the laser version of the Cone Lamp.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    buyLinks: [],
  },

  // Workshop Essentials
  {
    slug: "clamps",
    name: "Clamps (you never have enough)",
    description:
      "Seriously. Buy more clamps. Then buy more. F-clamps, bar clamps, spring clamps — all of them.",
    category: "Workshop Essentials",
    categoryIcon: "🔧",
    buyLinks: [],
  },
  {
    slug: "tape-measure-and-speed-square",
    name: "Tape Measure & Speed Square",
    description:
      "The two tools I check every single measurement with. Nothing fancy, just reliable.",
    category: "Workshop Essentials",
    categoryIcon: "🔧",
    buyLinks: [],
  },
  {
    slug: "workbench",
    name: "Workbench",
    description:
      "Built my own from construction timber. Doesn't need to be pretty — needs to be solid and flat.",
    category: "Workshop Essentials",
    categoryIcon: "🔧",
    buyLinks: [],
  },

  // Camera & Content
  {
    slug: "camera-and-lenses",
    name: "Camera & Lenses",
    description:
      "Details coming soon — I'll add the full filming setup here.",
    category: "Camera & Content",
    categoryIcon: "📷",
    buyLinks: [],
  },
];

export const categories = [
  {
    title: "Power Tools",
    icon: "⚡",
    description: "The tools I reach for every day in the shop.",
  },
  {
    title: "Finishing",
    icon: "🎨",
    description:
      "What I use to protect and bring out the beauty of the wood.",
  },
  {
    title: "3D Printing & Laser",
    icon: "🖨️",
    description: "My digital fabrication tools for the more creative builds.",
  },
  {
    title: "Workshop Essentials",
    icon: "🔧",
    description: "The unglamorous stuff that makes everything else work.",
  },
  {
    title: "Camera & Content",
    icon: "📷",
    description: "What I use to film the videos.",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.category === category);
}
