import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.newsletterSubscribed, true))
    .orderBy(desc(users.createdAt));

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Subscribers</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {rows.length.toLocaleString()} newsletter {rows.length === 1 ? "subscriber" : "subscribers"}
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
        <div className="grid grid-cols-[1fr_1fr_140px] gap-4 px-5 py-3 border-b border-wood/[0.06] text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          <div>Email</div>
          <div>Name</div>
          <div className="text-right">Joined</div>
        </div>
        {rows.length === 0 && (
          <div className="p-5 text-sm text-wood-light/50">No subscribers yet.</div>
        )}
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={
              "grid grid-cols-[1fr_1fr_140px] gap-4 px-5 py-3 text-sm" +
              (i > 0 ? " border-t border-wood/[0.05]" : "")
            }
          >
            <div className="text-wood truncate">{row.email}</div>
            <div className="text-wood-light/60 truncate">{row.name ?? "—"}</div>
            <div className="text-right text-wood-light/50 text-xs tabular-nums">
              {new Date(row.createdAt).toISOString().slice(0, 10)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
