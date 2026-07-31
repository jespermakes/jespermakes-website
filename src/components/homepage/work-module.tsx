import type { WorkData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";

export default function WorkModule({ data }: { data: WorkData }) {
  const theme = resolveTheme("work", data.theme);
  if (!data.items?.length) return null;

  return (
    <section className={theme.bg}>
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            {data.caps && (
              <div className={`text-[10px] font-bold tracking-[0.15em] uppercase ${theme.caps}`}>
                {data.caps}
              </div>
            )}
            <h2 className={`mt-2 font-serif text-2xl md:text-3xl max-w-xl ${theme.heading}`}>
              {data.title}
            </h2>
            {data.subtitle && (
              <p className={`mt-2 max-w-xl text-sm ${theme.text}`}>{data.subtitle}</p>
            )}
          </div>
          {data.ctaLabel && data.ctaUrl && (
            <a href={data.ctaUrl} className={`text-sm font-semibold shrink-0 ${theme.accent}`}>
              {data.ctaLabel}
            </a>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group block overflow-hidden rounded-2xl bg-white/50 border border-wood/8 hover:border-wood/20 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-base text-wood">{item.title}</h3>
                <p className="mt-1 text-sm text-wood-light/80">{item.blurb}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
