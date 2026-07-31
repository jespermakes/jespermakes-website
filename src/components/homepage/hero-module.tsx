import { SmartImage } from "@/components/smart-image";
import { getImageById } from "@/lib/homepage/fetch";
import type { HeroData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";
import { Kicker } from "./kicker";

export default async function HeroModule({ data }: { data: HeroData }) {
  let before = data.title;
  let highlight = "";
  if (data.titleHighlight && data.title.includes(data.titleHighlight)) {
    const idx = data.title.indexOf(data.titleHighlight);
    before = data.title.slice(0, idx);
    highlight = data.titleHighlight;
  }

  // Cinematic full-bleed hero (v3). Renders when a background image is set.
  if (data.backgroundImage) {
    return (
      <>
        <section className="relative min-h-[92vh] flex items-end bg-[#20100A]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#20100A] via-[#20100A]/40 to-[#20100A]/10" />
          <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-40">
            {data.mediaOverlayText && <Kicker dark>{data.mediaOverlayText}</Kicker>}
            <h1 className="mt-5 font-serif text-cream text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.02] max-w-3xl">
              {before}
              {highlight && <em className="not-italic text-amber">{highlight}</em>}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cream/75 leading-relaxed">
              {data.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href={data.primaryCta.url}
                className="rounded-xl bg-cream px-6 py-3.5 text-sm font-semibold text-wood hover:bg-cream/90 transition-colors"
              >
                {data.primaryCta.label}
              </a>
              {data.secondaryCta && (
                <a
                  href={data.secondaryCta.url}
                  className="text-sm font-semibold text-cream/80 hover:text-amber transition-colors"
                >
                  {data.secondaryCta.label} →
                </a>
              )}
            </div>
            {data.statsLine && (
              <p className="mt-10 text-xs tracking-wide text-cream/40">{data.statsLine}</p>
            )}
          </div>
        </section>
        {data.indexLinks && data.indexLinks.length > 0 && (
          <section className="bg-[#20100A] border-t border-cream/10">
            <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3">
              {data.indexLinks.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`group flex items-baseline gap-4 py-8 md:py-10 px-1 ${
                    i > 0 ? "md:border-l md:border-cream/10 md:pl-10" : ""
                  }`}
                >
                  <span className="text-xs text-amber font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-2xl text-cream/85 group-hover:text-amber transition-colors">
                    {item.label}
                  </span>
                  <span className="ml-auto text-cream/50 group-hover:text-amber group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  // Legacy split hero.
  const image = await getImageById(data.mediaImageId);
  const theme = resolveTheme("hero", data.theme);

  return (
    <section className={theme.bg}>
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className={`font-serif text-5xl md:text-6xl leading-[1.05] ${theme.heading}`}>
              {before}
              {highlight && <em className={`not-italic italic ${theme.highlight}`}>{highlight}</em>}
            </h1>
            <p className={`mt-6 text-base md:text-lg max-w-md ${theme.text}`}>{data.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={data.primaryCta.url}
                className="inline-flex items-center rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-forest/90"
              >
                {data.primaryCta.label}
              </a>
              {data.secondaryCta && (
                <a
                  href={data.secondaryCta.url}
                  className={
                    "inline-flex items-center rounded-xl border px-6 py-3 text-sm font-semibold " +
                    (data.theme === "wood" || data.theme === "forest"
                      ? "border-cream/30 text-cream hover:bg-cream/10"
                      : "border-wood/20 text-wood hover:bg-wood/5")
                  }
                >
                  {data.secondaryCta.label}
                </a>
              )}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-wood">
            {image && (
              <SmartImage
                src={image.url}
                alt={image.description || ""}
                width={image.width || 800}
                height={image.height || 600}
                priority
                className="h-full w-full object-cover opacity-70"
              />
            )}
            {data.mediaOverlayText && (
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="font-serif italic text-cream text-3xl md:text-4xl">{data.mediaOverlayText}</h2>
              </div>
            )}
            {data.mediaYoutubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${data.mediaYoutubeId}`}
                className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 hover:bg-cream"
                aria-label="Play video"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#2C1810">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
