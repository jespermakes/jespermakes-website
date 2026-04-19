import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminBlogListPage() {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.hidden, false))
    .orderBy(desc(blogPosts.updatedAt));

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Blog</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {rows.length} {rows.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-wood text-cream rounded-xl py-3 px-5 text-sm font-semibold no-underline"
        >
          + New post
        </Link>
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_140px] gap-4 px-5 py-3 border-b border-wood/[0.06] text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          <div>Title</div>
          <div>Status</div>
          <div className="text-right">Updated</div>
        </div>
        {rows.length === 0 && (
          <div className="p-5 text-sm text-wood-light/50">No posts yet. Create one to start.</div>
        )}
        {rows.map((row, i) => (
          <Link
            key={row.id}
            href={`/admin/blog/${row.id}`}
            className={
              "grid grid-cols-[1fr_120px_140px] gap-4 px-5 py-3 text-sm hover:bg-wood/[0.03] no-underline" +
              (i > 0 ? " border-t border-wood/[0.05]" : "")
            }
          >
            <div>
              <div className="text-wood font-medium truncate">{row.title}</div>
              <div className="text-xs text-wood-light/50 font-mono truncate">/{row.slug}</div>
            </div>
            <div>
              <span
                className={
                  row.status === "published"
                    ? "text-[11px] bg-amber/15 text-amber-dark rounded-md px-2 py-0.5 font-medium"
                    : "text-[11px] bg-wood/8 text-wood-light/60 rounded-md px-2 py-0.5 font-medium"
                }
              >
                {row.status}
              </span>
            </div>
            <div className="text-right text-wood-light/50 text-xs tabular-nums">
              {new Date(row.updatedAt).toISOString().slice(0, 10)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
