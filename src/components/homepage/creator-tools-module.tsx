import { CREATOR_TOOL_REGISTRY } from "@/lib/creator-tools";
import type { CreatorToolsData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";
import { Kicker } from "./kicker";

// The apps as an index: heading column left, numbered list right.
export default function CreatorToolsModule({ data }: { data: CreatorToolsData }) {
  const tools = data.toolSlugs
    .map((slug) => CREATOR_TOOL_REGISTRY[slug])
    .filter(Boolean);
  const theme = resolveTheme("creator_tools", data.theme);
  if (tools.length === 0) return null;

  const dark = data.theme !== "cream" && data.theme !== "white" && data.theme !== "wood-soft";

  return (
    <section className={`${theme.bg} ${dark ? "border-t border-cream/10" : ""}`}>
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            {data.caps && <Kicker dark={dark}>{data.caps}</Kicker>}
            <h2 className={`mt-5 font-serif text-4xl leading-tight ${theme.heading}`}>
              {data.title}
            </h2>
            {data.subtitle && (
              <p className={`mt-5 leading-relaxed max-w-sm ${theme.text}`}>{data.subtitle}</p>
            )}
          </div>
          <div className="md:col-span-3">
            {tools.map((tool, i) => (
              <a
                key={tool.slug}
                href={tool.url}
                className={`group flex items-baseline gap-5 py-5 border-t ${
                  dark ? "border-cream/10" : "border-wood/10"
                } last:border-b`}
              >
                <span className="text-sm font-semibold text-amber">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className={`font-serif text-xl group-hover:text-amber transition-colors ${theme.heading}`}>
                    {tool.name}
                  </span>
                  <p className={`mt-0.5 text-sm ${theme.muted}`}>{tool.description}</p>
                </div>
                <span
                  className={`ml-auto group-hover:text-amber group-hover:translate-x-1 transition-all ${
                    dark ? "text-cream/50" : "text-wood/30"
                  }`}
                >
                  →
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
