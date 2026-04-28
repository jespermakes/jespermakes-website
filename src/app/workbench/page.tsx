import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { workbenchDesigns } from "@/lib/db/schema";
import { DesignCard, type WorkbenchDesignSummary } from "@/components/workbench/design-card";
import { FilterBar } from "@/components/workbench/filter-bar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Workbench — Community Designs | Jesper Makes",
  description:
    "Free designs from makers, for makers. Browse community CNC and laser designs and open them directly in the Studio.",
};

const PAGE_SIZE = 20;

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
]);

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  tag?: string;
  page?: string;
}

export default async function WorkbenchPage({
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

  const [rows, total] = await Promise.all([
    db
      .select({
        id: workbenchDesigns.id,
        name: workbenchDesigns.name,
        description: workbenchDesigns.description,
        authorName: workbenchDesigns.authorName,
        thumbnail: workbenchDesigns.thumbnail,
        tags: workbenchDesigns.tags,
        category: workbenchDesigns.category,
        downloadCount: workbenchDesigns.downloadCount,
        likeCount: workbenchDesigns.likeCount,
        remixCount: workbenchDesigns.remixCount,
        publishedAt: workbenchDesigns.publishedAt,
      })
      .from(workbenchDesigns)
      .where(where)
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(workbenchDesigns)
      .where(where),
  ]);

  const totalCount = total[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const designs: WorkbenchDesignSummary[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    authorName: r.authorName,
    thumbnail: r.thumbnail,
    tags: r.tags,
    category: r.category,
    downloadCount: r.downloadCount,
    likeCount: r.likeCount,
    remixCount: r.remixCount,
    publishedAt: r.publishedAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-4xl text-wood">The Workbench</h1>
        <p className="mt-2 text-lg text-wood-light">
          Free designs from makers, for makers.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-wood-light/80">
          Browse community designs for CNC routers and laser cutters. Open
          any design directly in the Studio, modify it, and make it yours.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/studio"
            className="rounded-xl border border-wood/[0.12] bg-white px-4 py-2 text-sm text-wood hover:border-forest/40"
          >
            Browse designs
          </Link>
          <Link
            href="/studio"
            className="rounded-xl bg-wood px-4 py-2 text-sm font-medium text-cream hover:bg-wood-light"
          >
            Publish yours
          </Link>
        </div>
      </header>

      <FilterBar />

      <div className="mt-6 text-[12px] text-wood-light/60">
        {totalCount} design{totalCount === 1 ? "" : "s"}
      </div>

      {designs.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-wood-light">
            {search || category || tag
              ? "No designs match those filters yet."
              : "No designs yet. Be the first to publish."}
          </p>
          <Link
            href="/studio"
            className="rounded-xl bg-wood px-4 py-2 text-sm font-medium text-cream hover:bg-wood-light"
          >
            Open the Studio
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((d) => (
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
    return `/workbench?${params.toString()}`;
  };
  return (
    <nav className="mt-8 flex items-center justify-center gap-3 text-sm text-wood-light">
      {page > 1 ? (
        <Link
          href={linkFor(page - 1)}
          className="rounded-md border border-wood/[0.12] bg-white px-3 py-1 hover:border-forest/40"
        >
          ← Newer
        </Link>
      ) : (
        <span className="px-3 py-1 opacity-30">← Newer</span>
      )}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={linkFor(page + 1)}
          className="rounded-md border border-wood/[0.12] bg-white px-3 py-1 hover:border-forest/40"
        >
          Older →
        </Link>
      ) : (
        <span className="px-3 py-1 opacity-30">Older →</span>
      )}
    </nav>
  );
}
