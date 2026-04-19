import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const rows = await db
    .select({
      id: newsletterSubscribers.id,
      email: newsletterSubscribers.email,
      firstName: newsletterSubscribers.firstName,
      source: newsletterSubscribers.source,
      subscribedAt: newsletterSubscribers.subscribedAt,
    })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.subscribed, true))
    .orderBy(desc(newsletterSubscribers.subscribedAt));

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Subscribers</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {rows.length.toLocaleString()} active newsletter subscribers
          </p>
        </div>
        <a
          href="/api/admin/subscribers/export"
          className="bg-wood text-cream rounded-xl py-3 px-5 text-sm font-semibold no-underline"
        >
          Download CSV
        </a>
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_120px_140px] gap-4 px-5 py-3 border-b border-wood/[0.06] text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          <div>Email</div>
          <div>Name</div>
          <div>Source</div>
          <div className="text-right">Joined</div>
        </div>
        {rows.length === 0 && (
          <div className="p-5 text-sm text-wood-light/50">No subscribers yet.</div>
        )}
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={
              "grid grid-cols-[1fr_1fr_120px_140px] gap-4 px-5 py-3 text-sm" +
              (i > 0 ? " border-t border-wood/[0.05]" : "")
            }
          >
            <div className="text-wood truncate">{row.email}</div>
            <div className="text-wood-light/60 truncate">{row.firstName ?? "—"}</div>
            <div className="text-[11px] text-wood-light/50">{row.source}</div>
            <div className="text-right text-wood-light/50 text-xs tabular-nums">
              {new Date(row.subscribedAt).toISOString().slice(0, 10)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
