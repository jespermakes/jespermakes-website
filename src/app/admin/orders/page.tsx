import { db } from "@/lib/db";
import { purchases, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = await db
    .select({
      id: purchases.id,
      sku: purchases.sku,
      amount: purchases.amount,
      purchasedAt: purchases.purchasedAt,
      userId: purchases.userId,
      email: users.email,
    })
    .from(purchases)
    .leftJoin(users, eq(purchases.userId, users.id))
    .orderBy(desc(purchases.purchasedAt))
    .limit(100);

  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Orders</h1>
          <p className="text-sm text-wood-light/60 m-0">
            Last {rows.length} purchases · ${(totalRevenue / 100).toFixed(2)} shown ·{" "}
            <a
              href="https://dashboard.stripe.com"
              className="text-forest hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Full history in Stripe ↗
            </a>
          </p>
        </div>
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_120px_140px] gap-4 px-5 py-3 border-b border-wood/[0.06] text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          <div>SKU</div>
          <div>Customer</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Date</div>
        </div>
        {rows.length === 0 && <div className="p-5 text-sm text-wood-light/50">No orders yet.</div>}
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={
              "grid grid-cols-[1fr_1fr_120px_140px] gap-4 px-5 py-3 text-sm" +
              (i > 0 ? " border-t border-wood/[0.05]" : "")
            }
          >
            <div className="text-wood truncate font-mono text-xs">{row.sku ?? "—"}</div>
            <div className="text-wood-light/70 truncate">
              {row.email ?? <span className="text-wood-light/40">guest</span>}
            </div>
            <div className="text-right text-wood font-semibold tabular-nums">
              ${(Number(row.amount ?? 0) / 100).toFixed(2)}
            </div>
            <div className="text-right text-wood-light/50 text-xs tabular-nums">
              {new Date(row.purchasedAt).toISOString().slice(0, 10)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
