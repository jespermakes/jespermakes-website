import type { BarnData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";

export default function BarnModule({ data }: { data: BarnData }) {
  const theme = resolveTheme("barn", data.theme);

  return (
    <section className={theme.bg}>
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {data.image && (
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.image}
                alt={data.imageAlt || data.title}
                className="h-full w-full object-cover aspect-[4/3]"
              />
            </div>
          )}
          <div>
            {data.caps && (
              <div className={`text-[10px] font-bold tracking-[0.15em] uppercase ${theme.caps}`}>
                {data.caps}
              </div>
            )}
            <h2 className={`mt-2 font-serif text-2xl md:text-3xl ${theme.heading}`}>
              {data.title}
            </h2>
            <p className={`mt-4 leading-relaxed ${theme.text}`}>{data.body}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {data.ctaLabel && data.ctaUrl && (
                <a
                  href={data.ctaUrl}
                  className="inline-block rounded-xl bg-cream/10 border border-cream/25 px-5 py-3 text-sm font-semibold text-cream hover:bg-cream/20 transition-colors"
                >
                  {data.ctaLabel}
                </a>
              )}
              {data.secondaryLabel && data.secondaryUrl && (
                <a
                  href={data.secondaryUrl}
                  className={`text-sm font-semibold ${theme.accent}`}
                  {...(data.secondaryUrl.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {data.secondaryLabel} ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
