import { getYoutubeVideosForFeed } from "@/lib/homepage/fetch";
import type { YoutubeData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";
import { Kicker } from "./kicker";

export default async function YoutubeModule({ data }: { data: YoutubeData }) {
  const videos = await getYoutubeVideosForFeed(data.mode, data.count, data.ids);
  const theme = resolveTheme("youtube", data.theme);
  if (videos.length === 0) return null;

  const dark = data.theme !== "cream" && data.theme !== "white" && data.theme !== "wood-soft";

  return (
    <section className={`${theme.bg} ${dark ? "border-t border-cream/10" : ""}`}>
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            {data.caps && <Kicker dark={dark}>{data.caps}</Kicker>}
            <h2 className={`mt-5 font-serif text-4xl leading-tight max-w-2xl ${theme.heading}`}>
              {data.title}
            </h2>
          </div>
          {data.ctaLabel && data.ctaUrl && (
            <a href={data.ctaUrl} className={`text-sm font-semibold ${theme.accent}`}>
              {data.ctaLabel}
            </a>
          )}
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {videos.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className={`relative aspect-video overflow-hidden rounded-2xl ${dark ? "ring-1 ring-cream/10" : "bg-wood/10"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumbnail}
                  alt=""
                  className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                {v.duration && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {v.duration}
                  </div>
                )}
              </div>
              <h3 className={`mt-4 font-serif text-lg leading-snug group-hover:text-amber transition-colors ${theme.heading}`}>
                {v.title}
              </h3>
              {(v.viewCount || v.publishedAt) && (
                <div className={`mt-1 text-xs uppercase tracking-wide ${theme.muted}`}>
                  {v.viewCount ? `${formatViewCount(v.viewCount)} views` : ""}
                  {v.viewCount && v.publishedAt ? " · " : ""}
                  {v.publishedAt
                    ? new Date(v.publishedAt).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
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
