import Link from "next/link";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminToolsListPage() {
  const rows = await db
    .select()
    .from(toolItems)
    .where(eq(toolItems.hidden, false))
    .orderBy(asc(toolItems.category), asc(toolItems.sortOrder), asc(toolItems.name));

  const byCategory = new Map<string, typeof rows>();
  for (const row of rows) {
    const arr = byCategory.get(row.category) ?? [];
    arr.push(row);
    byCategory.set(row.category, arr);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Tools</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {rows.length} visible · {byCategory.size} categories
          </p>
        </div>
      </div>

      {Array.from(byCategory.entries()).map(([category, tools]) => (
        <div key={category} className="mb-8">
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2">
            {category}
          </div>
          <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
            {tools.map((row, i) => (
              <Link
                key={row.id}
                href={`/admin/tools/${row.id}`}
                className={
                  "flex items-center gap-4 px-5 py-3 text-sm hover:bg-wood/[0.03] no-underline" +
                  (i > 0 ? " border-t border-wood/[0.05]" : "")
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="text-wood font-medium truncate">{row.name}</div>
                  <div className="text-xs text-wood-light/50 font-mono truncate">/{row.slug}</div>
                </div>
                {row.ambassadorBadge && (
                  <span className="text-[11px] bg-amber/15 text-amber-dark rounded-md px-2 py-0.5 font-medium">
                    Ambassador
                  </span>
                )}
                {row.featured && (
                  <span className="text-[11px] bg-wood/10 text-wood-light/70 rounded-md px-2 py-0.5 font-medium">
                    Featured
                  </span>
                )}
                <div className="text-wood-light/40 text-xs tabular-nums w-10 text-right">
                  {row.sortOrder}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 text-sm text-wood-light/50">
          No tools yet.
        </div>
      )}
    </div>
  );
}
