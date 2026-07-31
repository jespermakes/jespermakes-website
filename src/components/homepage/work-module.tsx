import type { WorkData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";
import { Kicker } from "./kicker";

// Editorial catalogue: one feature piece, then a staggered pair. Numbered
// like a portfolio, no boxed cards.
export default function WorkModule({ data }: { data: WorkData }) {
  const theme = resolveTheme("work", data.theme);
  if (!data.items?.length) return null;

  const [feature, ...rest] = data.items;

  return (
    <section className={`${theme.bg} bg-cream`}>
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        {data.caps && <Kicker>{data.caps}</Kicker>}
        <h2 className={`mt-5 font-serif text-4xl md:text-5xl max-w-2xl leading-tight ${theme.heading}`}>
          {data.title}
        </h2>

        {/* Feature piece */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-5 gap-10 items-end">
          <a href={feature.href} className="md:col-span-3 group block overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={feature.image}
              alt={feature.title}
              className="w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
            />
          </a>
          <div className="md:col-span-2 pb-2">
            <span className="text-xs font-semibold text-amber">01</span>
            <h3 className="mt-2 font-serif text-3xl text-wood">{feature.title}</h3>
            <p className="mt-3 text-wood-light leading-relaxed">{feature.blurb}</p>
            <a
              href={feature.href}
              className="mt-4 inline-block text-sm font-semibold text-forest hover:text-amber-dark transition-colors"
            >
              {feature.linkLabel || "See the piece"} →
            </a>
          </div>
        </div>

        {/* Staggered pair */}
        {rest.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            {rest.slice(0, 2).map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className={`group block ${i === 1 ? "md:mt-12" : ""}`}
              >
                <div className="overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-xs font-semibold text-amber">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-xl text-wood group-hover:text-amber-dark transition-colors">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-wood-light ml-8">{item.blurb}</p>
              </a>
            ))}
          </div>
        )}

        {data.ctaLabel && data.ctaUrl && (
          <p className="mt-16 text-sm text-wood-light">
            <a
              href={data.ctaUrl}
              className="font-semibold text-forest hover:text-amber-dark transition-colors"
            >
              {data.ctaLabel}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
