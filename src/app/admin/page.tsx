import Link from "next/link";
import { db } from "@/lib/db";
import { purchases, users, blogPosts, toolItems } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { StatCard } from "@/components/admin/stat-card";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(${purchases.amount}), 0)::int` })
    .from(purchases);

  const [subscriberCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.newsletterSubscribed, true));

  const [postCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(blogPosts)
    .where(eq(blogPosts.hidden, false));

  const [toolCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolItems)
    .where(eq(toolItems.hidden, false));

  const recentOrders = await db
    .select({
      id: purchases.id,
      sku: purchases.sku,
      amount: purchases.amount,
      purchasedAt: purchases.purchasedAt,
      email: users.email,
    })
    .from(purchases)
    .leftJoin(users, eq(purchases.userId, users.id))
    .orderBy(desc(purchases.purchasedAt))
    .limit(5);

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-normal text-wood mb-1">Dashboard</h1>
        <p className="text-sm text-wood-light/60 m-0">What&apos;s happening on the site.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue"
          value={`$${((revenueResult?.total ?? 0) / 100).toFixed(0)}`}
          sub="All-time · from Stripe"
          href="/admin/orders"
        />
        <StatCard
          label="Subscribers"
          value={(subscriberCount?.count ?? 0).toLocaleString()}
          sub="Newsletter list"
          href="/admin/subscribers"
        />
        <StatCard
          label="Blog posts"
          value={postCount?.count ?? 0}
          sub="Visible on site"
          href="/admin/blog"
        />
        <StatCard
          label="Tools"
          value={toolCount?.count ?? 0}
          sub="Visible on site"
          href="/admin/tools"
        />
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-xl font-normal text-wood m-0">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs text-amber hover:underline">
            See all ↗
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-sm text-wood-light/50">No orders yet.</div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((row) => (
              <div key={row.id} className="flex items-center gap-4 text-sm py-1">
                <div className="font-mono text-xs text-wood-light/60 truncate flex-1">{row.sku ?? "—"}</div>
                <div className="text-wood-light/70 truncate flex-1">
                  {row.email ?? <span className="text-wood-light/40">guest</span>}
                </div>
                <div className="text-wood font-semibold tabular-nums">
                  ${(Number(row.amount ?? 0) / 100).toFixed(2)}
                </div>
                <div className="text-wood-light/50 text-xs tabular-nums w-20 text-right">
                  {new Date(row.purchasedAt).toISOString().slice(0, 10)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/images"
          className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 hover:border-wood/[0.15]"
        >
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1">
            Image library
          </div>
          <div className="text-wood font-semibold">Browse, tag, upload images →</div>
        </Link>
        <Link
          href="/admin/title-lab"
          className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 hover:border-wood/[0.15]"
        >
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1">
            Title Lab usage
          </div>
          <div className="text-wood font-semibold">Events, session analysis →</div>
        </Link>
      </div>
    </div>
  );
}
