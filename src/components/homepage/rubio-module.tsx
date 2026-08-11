import Link from "next/link";
import type { RubioData } from "@/lib/homepage/types";

/**
 * The Rubio band on the homepage.
 *
 * Deliberately breaks out of the cream/wood palette and uses Rubio's own brand
 * colours, the same set /rubio and /floor-rescue run on. It should read as a
 * partner block rather than another Jesper Makes section, because the story is
 * that a brand handed him a colour with his name on it.
 */
export default function RubioModule({ data }: { data: RubioData }) {
  return (
    <section className="bg-[#183029] text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          {data.caps && (
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fcc52c]">
              {data.caps}
            </p>
          )}
          <h2 className="font-serif text-3xl font-medium leading-[1.1] md:text-5xl">{data.title}</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">{data.body}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {data.ctaLabel && data.ctaUrl && (
              <Link
                href={data.ctaUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-[#fcc52c] px-6 py-3.5 text-sm font-bold text-[#183029] transition-colors hover:bg-[#ffd457]"
              >
                {data.ctaLabel} <span aria-hidden>→</span>
              </Link>
            )}
            {data.secondaryLabel && data.secondaryUrl && (
              <Link
                href={data.secondaryUrl}
                className="text-sm font-semibold text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
              >
                {data.secondaryLabel}
              </Link>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/25">
          {data.videoEmbedUrl ? (
            <iframe
              src={data.videoEmbedUrl}
              title={data.title}
              loading="lazy"
              scrolling="no"
              allowFullScreen
              className="aspect-[4/5] w-full"
            />
          ) : data.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.image}
              alt={data.imageAlt ?? data.title}
              loading="lazy"
              className="w-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
