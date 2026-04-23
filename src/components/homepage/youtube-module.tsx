import { getYoutubeVideosForFeed } from "@/lib/homepage/fetch";
import type { YoutubeData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";

export default async function YoutubeModule({ data }: { data: YoutubeData }) {
  const videos = await getYoutubeVideosForFeed(data.mode, data.count, data.ids);
  const theme = resolveTheme("youtube", data.theme);
  if (videos.length === 0) return null;

  return (
    <section className={theme.bg}>
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            {data.caps && <div className={`text-[10px] font-bold tracking-[0.15em] uppercase ${theme.caps}`}>{data.caps}</div>}
            <h2 className={`mt-2 font-serif text-3xl md:text-4xl ${theme.heading}`}>{data.title}</h2>
          </div>
          {data.ctaLabel && data.ctaUrl && (
            <a href={data.ctaUrl} className={`text-sm font-semibold ${theme.accent}`}>
              {data.ctaLabel}
            </a>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {videos.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl bg-wood/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
                {v.duration && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {v.duration}
                  </div>
                )}
              </div>
              <h3 className={`mt-3 font-sans text-sm font-medium leading-snug ${theme.heading}`}>{v.title}</h3>
              {(v.viewCount || v.publishedAt) && (
                <div className={`mt-1 text-xs ${theme.muted}`}>
                  {v.viewCount ? `${formatViewCount(v.viewCount)} views` : ""}
                  {v.viewCount && v.publishedAt ? " \u00B7 " : ""}
                  {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : ""}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatViewCount(c: string): string {
  const n = parseInt(c, 10);
  if (!Number.isFinite(n)) return c;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}
