import type { BarnData } from "@/lib/homepage/types";
import { Kicker } from "./kicker";

// Full-bleed film still: image with a dark grade and the story bottom-left.
export default function BarnModule({ data }: { data: BarnData }) {
  return (
    <section className="relative min-h-[75vh] flex items-end bg-[#20100A]">
      {data.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.image}
          alt={data.imageAlt || data.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#20100A] via-transparent to-transparent" />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-32">
        {data.caps && <Kicker dark>{data.caps}</Kicker>}
        <h2 className="mt-4 font-serif text-4xl md:text-5xl text-cream max-w-2xl leading-tight">
          {data.title}
        </h2>
        <p className="mt-4 max-w-xl text-cream/75 leading-relaxed">{data.body}</p>
        <div className="mt-7 flex flex-wrap items-center gap-5">
          {data.ctaLabel && data.ctaUrl && (
            <a
              href={data.ctaUrl}
              className="inline-block rounded-xl border border-cream/30 bg-cream/10 px-6 py-3.5 text-sm font-semibold text-cream hover:bg-cream/20 transition-colors"
            >
              {data.ctaLabel}
            </a>
          )}
          {data.secondaryLabel && data.secondaryUrl && (
            <a
              href={data.secondaryUrl}
              className="text-sm font-semibold text-cream/70 hover:text-amber transition-colors"
              {...(data.secondaryUrl.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {data.secondaryLabel} ↗
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
