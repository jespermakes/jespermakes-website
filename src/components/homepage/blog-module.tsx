import { SmartImage } from "@/components/smart-image";
import { getBlogPostsForFeed } from "@/lib/homepage/fetch";
import type { BlogData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";

export default async function BlogModule({ data }: { data: BlogData }) {
  const posts = await getBlogPostsForFeed(data.mode, data.count, data.ids);
  const theme = resolveTheme("blog", data.theme);

  if (posts.length === 0) return null;

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
          {posts.map((p) => (
            <a
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group block overflow-hidden rounded-2xl bg-white/50 border border-wood/8 hover:border-wood/20 transition-colors"
            >
              {p.image && (
                <div className="aspect-[16/10] overflow-hidden">
                  <SmartImage
                    src={p.image.url}
                    alt={p.image.description || ""}
                    width={p.image.width || 600}
                    height={p.image.height || 375}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                {p.publishedAt && (
                  <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
                    {new Date(p.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </div>
                )}
                <h3 className="mt-2 font-serif text-lg text-wood leading-snug">{p.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
