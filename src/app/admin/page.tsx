import Link from "next/link";
import { db } from "@/lib/db";
import { purchases, users, blogPosts, toolItems, newsletterSubscribers, videos } from "@/lib/db/schema";
import { desc, eq, sql, and, inArray } from "drizzle-orm";
import { LONGFORM_ACTIVE_STAGES, STAGE_LABELS } from "@/lib/video-stages";
import { StatCard } from "@/components/admin/stat-card";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(${purchases.amount}), 0)::int` })
    .from(purchases);

  const [subscriberCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.subscribed, true));

  const [postCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(blogPosts)
    .where(eq(blogPosts.hidden, false));

  const [toolCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolItems)
    .where(eq(toolItems.hidden, false));

  const activeLongform = await db
    .select({ id: videos.id, title: videos.title, stage: videos.stage, sponsor: videos.sponsor })
    .from(videos)
    .where(
      and(
        eq(videos.kind, "longform"),
        eq(videos.hidden, false),
        inArray(videos.stage, LONGFORM_ACTIVE_STAGES as unknown as string[])
      )
    )
    .orderBy(desc(videos.updatedAt))
    .limit(4);

  const [readyShortsRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(videos)
    .where(
      and(
        eq(videos.kind, "shorts"),
        eq(videos.stage, "recorded"),
        eq(videos.hidden, false)
      )
    );
  const readyShortsCount = readyShortsRow?.count ?? 0;

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
          <Link href="/admin/orders" className="text-xs text-forest hover:underline">
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
        <a
          href="/admin/videos/longform"
          className="block bg-white/50 border border-wood/[0.06] rounded-2xl p-5 hover:border-wood/[0.15] no-underline"
        >
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-3">
            In production
          </div>
          {activeLongform.length === 0 ? (
            <div className="text-sm text-wood-light/50">No videos in production right now.</div>
          ) : (
            <div className="space-y-2 mb-3">
              {activeLongform.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-baseline justify-between gap-3">
                  <div className="font-semibold text-wood text-sm truncate">{v.title}</div>
                  <div className="text-[11px] text-wood-light/50 flex-shrink-0">
                    {STAGE_LABELS[v.stage] ?? v.stage}
                  </div>
                </div>
              ))}
            </div>
          )}
          {readyShortsCount > 0 && (
            <div className="text-xs text-forest mt-2 pt-2 border-t border-wood/[0.06]">
              {readyShortsCount} short{readyShortsCount === 1 ? "" : "s"} ready to publish &rarr;
            </div>
          )}
        </a>
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
        <a
          href="https://vercel.com/floki-dgx-spark/jespermakes-website/analytics?period=30d"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white/50 border border-wood/[0.06] rounded-2xl p-5 hover:border-wood/[0.15] transition-colors no-underline"
        >
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2">
            Traffic
          </div>
          <div className="font-serif text-lg text-wood">
            View visitors, sources, pages →
          </div>
          <div className="text-xs text-wood-light/50 mt-1">
            Opens in Vercel Analytics
          </div>
        </a>
      </div>
    </div>
  );
}
