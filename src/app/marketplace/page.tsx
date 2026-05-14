import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { workbenchDesigns } from "@/lib/db/schema";
import {
  DesignCard,
  type MarketplaceDesignSummary,
} from "@/components/marketplace/design-card";
import { FilterBar } from "@/components/marketplace/filter-bar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace — Community Designs | Jesper Makes",
  description:
    "Maker plan exchange. Browse community CNC and laser designs, open them in the Studio, remix, and share back.",
};

const PAGE_SIZE = 24;

const VALID_CATEGORIES = new Set([
  "general",
  "furniture",
  "joinery",
  "signs",
  "toys",
  "jigs",
  "decorative",
  "mechanical",
  "laser",
  "cnc",
  "lamp",
]);

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  tag?: string;
  page?: string;
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category =
    sp.category && VALID_CATEGORIES.has(sp.category) ? sp.category : null;
  const search = sp.search?.trim() || null;
  const tag = sp.tag?.trim() || null;
  const sort = sp.sort ?? "recent";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;
  const isFiltered = !!(category || search || tag || sp.sort);

  const filters = [eq(workbenchDesigns.status, "published")];
  if (category) filters.push(eq(workbenchDesigns.category, category));
  if (search) {
    const term = `%${search}%`;
    filters.push(
      or(
        ilike(workbenchDesigns.name, term),
        ilike(workbenchDesigns.description, term),
      )!,
    );
  }
  if (tag) {
    filters.push(
      sql`${workbenchDesigns.tags} @> ${JSON.stringify([tag])}::jsonb`,
    );
  }

  const orderBy =
    sort === "popular"
      ? desc(workbenchDesigns.downloadCount)
      : sort === "most-liked"
        ? desc(workbenchDesigns.likeCount)
        : desc(workbenchDesigns.publishedAt);

  const where = filters.length === 1 ? filters[0] : and(...filters);

  const selectCols = {
    id: workbenchDesigns.id,
    name: workbenchDesigns.name,
    description: workbenchDesigns.description,
    authorName: workbenchDesigns.authorName,
    authorId: workbenchDesigns.authorId,
    thumbnail: workbenchDesigns.thumbnail,
    tags: workbenchDesigns.tags,
    category: workbenchDesigns.category,
    downloadCount: workbenchDesigns.downloadCount,
    likeCount: workbenchDesigns.likeCount,
    remixCount: workbenchDesigns.remixCount,
    publishedAt: workbenchDesigns.publishedAt,
  };

  // Main query + count + featured (top 3 most popular, only on first unfiltered page)
  const showFeatured = page === 1 && !isFiltered;
  const [rows, total, featuredRows] = await Promise.all([
    db
      .select(selectCols)
      .from(workbenchDesigns)
      .where(where)
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(workbenchDesigns)
      .where(where),
    showFeatured
      ? db
          .select(selectCols)
          .from(workbenchDesigns)
          .where(eq(workbenchDesigns.status, "published"))
          .orderBy(desc(workbenchDesigns.downloadCount))
          .limit(3)
      : Promise.resolve([]),
  ]);

  const totalCount = total[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const toSummary = (r: (typeof rows)[0]): MarketplaceDesignSummary => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    authorName: r.authorName,
    authorId: r.authorId,
    thumbnail: r.thumbnail,
    tags: r.tags,
    category: r.category,
    downloadCount: r.downloadCount,
    likeCount: r.likeCount,
    remixCount: r.remixCount,
    publishedAt: r.publishedAt.toISOString(),
  });

  const designs = rows.map(toSummary);
  const featured = featuredRows.map(toSummary);
  const featuredIds = new Set(featured.map((d) => d.id));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <header className="mb-12">
        <h1 className="font-serif text-4xl text-wood sm:text-5xl">
          Marketplace
        </h1>
        <p className="mt-3 text-lg text-wood-light">
          Maker plan exchange. Build, share, remix.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-wood-light/80">
          Community designs for CNC routers and laser cutters. Open any design
          in the Studio, make it yours, and share your version back.
        </p>
        <div className="mt-5">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-xl bg-wood px-5 py-2.5 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-wood-light"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
              <path
                d="M8 2v12M2 8h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Publish your design
          </Link>
        </div>
      </header>

      {/* Featured section - only on unfiltered first page with designs */}
      {featured.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-wood-light/50">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
              <path
                d="M8 1l2.2 4.4L15 6.1l-3.5 3.4.8 4.9L8 12.2 3.7 14.4l.8-4.9L1 6.1l4.8-.7z"
                fill="currentColor"
              />
            </svg>
            Popular designs
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {featured.map((d) => (
              <DesignCard key={d.id} design={d} featured />
            ))}
          </div>
        </section>
      ) : null}

      {/* Filters */}
      <FilterBar />

      {/* Results count */}
      <div className="mt-5 flex items-center justify-between">
        <span className="text-[12px] text-wood-light/60">
          {totalCount} design{totalCount === 1 ? "" : "s"}
          {category ? ` in ${category}` : ""}
          {search ? ` matching "${search}"` : ""}
        </span>
      </div>

      {/* Design grid */}
      {designs.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-cream p-4">
            <svg
              viewBox="0 0 48 48"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-wood-light/40"
              aria-hidden
            >
              <rect x="8" y="8" width="32" height="32" rx="4" />
              <path d="M16 24h16M24 16v16" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm text-wood-light">
            {search || category || tag
              ? "No designs match those filters yet."
              : "No designs published yet. Be the first."}
          </p>
          <Link
            href="/studio"
            className="rounded-xl bg-wood px-4 py-2 text-sm font-medium text-cream hover:bg-wood-light"
          >
            Open the Studio
          </Link>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {designs
            .filter((d) => !featuredIds.has(d.id) || isFiltered)
            .map((d) => (
              <li key={d.id}>
                <DesignCard design={d} />
              </li>
            ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <Pagination page={page} totalPages={totalPages} sp={sp} />
      ) : null}
    </main>
  );
}

function Pagination({
  page,
  totalPages,
  sp,
}: {
  page: number;
  totalPages: number;
  sp: SearchParams;
}) {
  const linkFor = (p: number) => {
    const params = new URLSearchParams();
    if (sp.category) params.set("category", sp.category);
    if (sp.search) params.set("search", sp.search);
    if (sp.sort) params.set("sort", sp.sort);
    if (sp.tag) params.set("tag", sp.tag);
    params.set("page", String(p));
    return `/marketplace?${params.toString()}`;
  };
  return (
    <nav className="mt-10 flex items-center justify-center gap-3 text-sm text-wood-light">
      {page > 1 ? (
        <Link
          href={linkFor(page - 1)}
          className="rounded-lg border border-wood/[0.12] bg-white px-4 py-1.5 transition-colors hover:border-forest/40 hover:text-forest"
        >
          ← Newer
        </Link>
      ) : (
        <span className="px-4 py-1.5 opacity-30">← Newer</span>
      )}
      <span className="text-wood-light/60">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={linkFor(page + 1)}
          className="rounded-lg border border-wood/[0.12] bg-white px-4 py-1.5 transition-colors hover:border-forest/40 hover:text-forest"
        >
          Older →
        </Link>
      ) : (
        <span className="px-4 py-1.5 opacity-30">Older →</span>
      )}
    </nav>
  );
}
