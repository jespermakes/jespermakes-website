import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools & Links — Jesper Makes",
  description:
    "The tools, materials and products I actually use in my workshop. Honest recommendations from years of building.",
};

type Tool = {
  name: string;
  description: string;
  link?: string;
  badge?: string;
};

type ToolCategory = {
  title: string;
  description: string;
  icon: string;
  tools: Tool[];
};

const categories: ToolCategory[] = [
  {
    title: "Power Tools",
    description: "The tools I reach for every day in the shop.",
    icon: "⚡",
    tools: [
      {
        name: "Festool Track Saw TS 55",
        description:
          "My most-used tool. Perfectly straight cuts every time. Worth every penny if you're serious about woodworking.",
        badge: "Ambassador",
      },
      {
        name: "Festool Cordless Drill T 18",
        description:
          "Lightweight, powerful, and the battery system works across all Festool cordless tools.",
        badge: "Ambassador",
      },
      {
        name: "Festool Random Orbital Sander ETS 150",
        description:
          "Dust extraction is unreal. Makes sanding almost enjoyable.",
        badge: "Ambassador",
      },
      {
        name: "Festool Domino DF 500",
        description:
          "Game changer for joinery. Fast, accurate, and makes strong joints without complicated setups.",
        badge: "Ambassador",
      },
      {
        name: "AP 700 Nail Pusher",
        description:
          "Essential for pallet work. Pushes nails out cleanly without destroying the wood.",
      },
    ],
  },
  {
    title: "Finishing",
    description: "What I use to protect and bring out the beauty of the wood.",
    icon: "🎨",
    tools: [
      {
        name: "Rubio Monocoat Oil Plus 2C",
        description:
          "One-coat finish that brings out incredible grain. Natural look, food safe, and easy to apply. My go-to for everything.",
        badge: "Ambassador",
      },
      {
        name: "Rubio Monocoat Universal Maintenance Oil",
        description:
          "For maintaining and refreshing pieces finished with Monocoat. Simple upkeep.",
        badge: "Ambassador",
      },
    ],
  },
  {
    title: "3D Printing & Laser",
    description: "My digital fabrication tools for the more creative builds.",
    icon: "🖨️",
    tools: [
      {
        name: "Bambu Lab X1 Carbon",
        description:
          "Fast, reliable, and the multi-material system opens up wild possibilities. Used it for the Cone Lamp project.",
      },
      {
        name: "xTool Laser Cutter",
        description:
          "Clean cuts in wood, acrylic, and more. Great for the laser version of the Cone Lamp.",
      },
    ],
  },
  {
    title: "Workshop Essentials",
    description: "The unglamorous stuff that makes everything else work.",
    icon: "🔧",
    tools: [
      {
        name: "Clamps (you never have enough)",
        description:
          "Seriously. Buy more clamps. Then buy more. F-clamps, bar clamps, spring clamps — all of them.",
      },
      {
        name: "Tape Measure & Speed Square",
        description:
          "The two tools I check every single measurement with. Nothing fancy, just reliable.",
      },
      {
        name: "Workbench",
        description:
          "Built my own from construction timber. Doesn't need to be pretty — needs to be solid and flat.",
      },
    ],
  },
  {
    title: "Camera & Content",
    description: "What I use to film the videos.",
    icon: "📷",
    tools: [
      {
        name: "Camera & Lenses",
        description:
          "Details coming soon — I'll add the full filming setup here.",
      },
    ],
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="max-w-2xl mb-16">
        <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4">
          Tools & Links
        </h1>
        <p className="text-wood-light/80 text-lg">
          Everything I actually use in my workshop. No filler, no paid
          placements disguised as recommendations — just the tools I reach for
          every day.
        </p>
        <p className="text-wood-light/60 text-sm mt-3">
          Some links are affiliate links — they cost you nothing extra but help
          support the channel. Items marked{" "}
          <span className="text-amber font-medium">Ambassador</span> are from
          brands I officially work with.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((category) => (
          <section key={category.title}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h2 className="font-serif text-2xl text-wood">
                  {category.title}
                </h2>
                <p className="text-wood-light/60 text-sm">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {category.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="bg-white/60 rounded-xl p-5 border border-wood/5 hover:border-amber/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-lg text-wood">
                          {tool.name}
                        </h3>
                        {tool.badge && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-wood-light/70 text-sm">
                        {tool.description}
                      </p>
                    </div>
                    {tool.link && (
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-amber hover:text-amber/80 transition-colors mt-1"
                      >
                        View
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-20 bg-wood/5 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="font-serif text-2xl text-wood mb-3">
          Missing something?
        </h2>
        <p className="text-wood-light/70 max-w-lg mx-auto mb-6">
          If there&apos;s a tool you saw in one of my videos and want to know
          more about, just ask in the comments. I&apos;ll add it here.
        </p>
        <a
          href="https://youtube.com/@jespermakes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-wood text-cream px-6 py-3 rounded-full font-medium hover:bg-wood/90 transition-colors"
        >
          Visit the channel
        </a>
      </div>
    </div>
  );
}
