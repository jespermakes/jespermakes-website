import { CREATOR_TOOL_REGISTRY } from "@/lib/creator-tools";
import type { CreatorToolsData } from "@/lib/homepage/types";

export default function CreatorToolsModule({ data }: { data: CreatorToolsData }) {
  const tools = data.toolSlugs
    .map((slug) => CREATOR_TOOL_REGISTRY[slug])
    .filter(Boolean);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-20">
      <div className="mx-auto max-w-xl text-center">
        {data.caps && <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">{data.caps}</div>}
        <h2 className="mt-2 font-serif text-3xl md:text-4xl text-wood">{data.title}</h2>
        {data.subtitle && <p className="mt-3 text-wood-light/75">{data.subtitle}</p>}
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <a
            key={tool.slug}
            href={tool.url}
            className="group block rounded-2xl bg-white/50 border border-wood/8 p-6 hover:border-wood/20 transition-colors"
          >
            <div
              className={
                "flex h-10 w-10 items-center justify-center rounded-lg text-lg " +
                (tool.tint === "amber" ? "bg-amber/10 text-amber" : "bg-forest/10 text-forest")
              }
              aria-hidden
            >
              {tool.glyph}
            </div>
            <h3 className="mt-4 font-serif text-lg text-wood">{tool.name}</h3>
            <p className="mt-2 text-sm text-wood-light/75">{tool.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
