import { SmartImage } from "@/components/smart-image";
import { getImageById } from "@/lib/homepage/fetch";
import type { HeroData } from "@/lib/homepage/types";

export default async function HeroModule({ data }: { data: HeroData }) {
  const image = await getImageById(data.mediaImageId);

  let before = data.title;
  let highlight = "";
  if (data.titleHighlight && data.title.includes(data.titleHighlight)) {
    const idx = data.title.indexOf(data.titleHighlight);
    before = data.title.slice(0, idx);
    highlight = data.titleHighlight;
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-wood">
            {before}
            {highlight && <em className="not-italic text-forest italic">{highlight}</em>}
          </h1>
          <p className="mt-6 text-wood-light/80 text-base md:text-lg max-w-md">{data.subtitle}</p>
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
                className="inline-flex items-center rounded-xl border border-wood/20 px-6 py-3 text-sm font-semibold text-wood hover:bg-wood/5"
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
    </section>
  );
}
