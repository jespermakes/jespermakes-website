import { Metadata } from "next";
import Stripe from "stripe";
import RevenueChart from "./revenue-chart";

export const metadata: Metadata = {
  title: "Dashboard — Jesper Makes",
};

export const dynamic = "force-dynamic";

const YOUTUBE_CHANNEL_ID = "UCqEcM-ZrWoC7AgGDoxi2X-w";

// ── Stripe helpers ──────────────────────────────────────────────────────────

function stripeClient(key: string) {
  return new Stripe(key, { apiVersion: "2025-04-30.basil" as Stripe.LatestApiVersion });
}

async function fetchCharges(stripe: Stripe, since: number): Promise<Stripe.Charge[]> {
  const charges: Stripe.Charge[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;
  while (hasMore) {
    const params: Stripe.ChargeListParams = {
      limit: 100,
      created: { gte: since },
    };
    if (startingAfter) params.starting_after = startingAfter;
    const list = await stripe.charges.list(params);
    charges.push(...list.data);
    hasMore = list.has_more;
    if (list.data.length) startingAfter = list.data[list.data.length - 1].id;
  }
  return charges;
}

async function fetchAllCharges(stripe: Stripe): Promise<Stripe.Charge[]> {
  const charges: Stripe.Charge[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;
  while (hasMore) {
    const params: Stripe.ChargeListParams = { limit: 100 };
    if (startingAfter) params.starting_after = startingAfter;
    const list = await stripe.charges.list(params);
    charges.push(...list.data);
    hasMore = list.has_more;
    if (list.data.length) startingAfter = list.data[list.data.length - 1].id;
  }
  return charges;
}

function sumSuccessful(charges: Stripe.Charge[]): number {
  return charges
    .filter((c) => c.status === "succeeded" && !c.refunded)
    .reduce((sum, c) => sum + c.amount, 0);
}

function chargesToDaily(
  charges: Stripe.Charge[],
  days: number
): Map<string, number> {
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const c of charges) {
    if (c.status !== "succeeded" || c.refunded) continue;
    const date = new Date(c.created * 1000).toISOString().slice(0, 10);
    if (map.has(date)) {
      map.set(date, (map.get(date) || 0) + c.amount / 100);
    }
  }
  return map;
}

// ── YouTube helper ──────────────────────────────────────────────────────────

type YouTubeStats = {
  subscribers: string;
  totalViews: string;
  videoCount: string;
};

async function fetchYouTubeStats(): Promise<YouTubeStats> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { subscribers: "—", totalViews: "—", videoCount: "—" };
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const json = await res.json();
    const stats = json.items?.[0]?.statistics;
    if (!stats) return { subscribers: "—", totalViews: "—", videoCount: "—" };
    return {
      subscribers: Number(stats.subscriberCount).toLocaleString("en-US"),
      totalViews: Number(stats.viewCount).toLocaleString("en-US"),
      videoCount: Number(stats.videoCount).toLocaleString("en-US"),
    };
  } catch {
    return { subscribers: "—", totalViews: "—", videoCount: "—" };
  }
}

// ── Formatting ──────────────────────────────────────────────────────────────

function eur(cents: number) {
  return `€${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const beacons = stripeClient(process.env.STRIPE_BEACONS_SECRET_KEY!);
  const store = stripeClient(process.env.STRIPE_DGX_SECRET_KEY!);

  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 86400;
  const thirtyDaysAgo = now - 30 * 86400;

  // Fetch everything in parallel
  const [
    beacons7d,
    store7d,
    beacons30d,
    store30d,
    beaconsAll,
    storeAll,
    beaconsBalance,
    storeBalance,
    youtube,
  ] = await Promise.all([
    fetchCharges(beacons, sevenDaysAgo),
    fetchCharges(store, sevenDaysAgo),
    fetchCharges(beacons, thirtyDaysAgo),
    fetchCharges(store, thirtyDaysAgo),
    fetchAllCharges(beacons),
    fetchAllCharges(store),
    beacons.balance.retrieve(),
    store.balance.retrieve(),
    fetchYouTubeStats(),
  ]);

  const rev7d = sumSuccessful(beacons7d) + sumSuccessful(store7d);
  const rev30d = sumSuccessful(beacons30d) + sumSuccessful(store30d);
  const revAll = sumSuccessful(beaconsAll) + sumSuccessful(storeAll);

  const pendingPayout =
    (beaconsBalance.available?.reduce((s, b) => s + b.amount, 0) ?? 0) +
    (storeBalance.available?.reduce((s, b) => s + b.amount, 0) ?? 0);

  // Daily chart data (30 days)
  const beaconsDaily = chargesToDaily(beacons30d, 30);
  const storeDaily = chargesToDaily(store30d, 30);
  const chartData = Array.from(beaconsDaily.entries()).map(([date, bAmt]) => ({
    date: date.slice(5), // "MM-DD"
    beacons: bAmt,
    store: storeDaily.get(date) || 0,
  }));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans -mt-px">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          Jesper Makes — Dashboard
        </h1>

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card label="Revenue 7D" value={eur(rev7d)} />
          <Card label="Revenue 30D" value={eur(rev30d)} />
          <Card label="Lifetime Revenue" value={eur(revAll)} />
          <Card label="Pending Payout" value={eur(pendingPayout)} />
        </div>

        {/* Revenue by Stream */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StreamCard
            title="Beacons"
            rev7d={eur(sumSuccessful(beacons7d))}
            revAll={eur(sumSuccessful(beaconsAll))}
            txCount7d={beacons7d.filter((c) => c.status === "succeeded").length}
            txCountAll={beaconsAll.filter((c) => c.status === "succeeded").length}
          />
          <StreamCard
            title="Jesper Makes Store"
            rev7d={eur(sumSuccessful(store7d))}
            revAll={eur(sumSuccessful(storeAll))}
            txCount7d={store7d.filter((c) => c.status === "succeeded").length}
            txCountAll={storeAll.filter((c) => c.status === "succeeded").length}
          />
        </div>

        {/* Daily Revenue Chart */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Daily Revenue — Last 30 Days</h2>
          <RevenueChart data={chartData} />
        </div>

        {/* YouTube Stats */}
        <h2 className="text-lg font-medium mb-4">YouTube</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card label="Subscribers" value={youtube.subscribers} />
          <Card label="Total Views" value={youtube.totalViews} />
          <Card label="Videos Published" value={youtube.videoCount} />
        </div>
      </div>
    </div>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StreamCard({
  title,
  rev7d,
  revAll,
  txCount7d,
  txCountAll,
}: {
  title: string;
  rev7d: string;
  revAll: string;
  txCount7d: number;
  txCountAll: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <h3 className="text-base font-medium mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
            7D Revenue
          </p>
          <p className="text-xl font-semibold">{rev7d}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {txCount7d} transaction{txCount7d !== 1 && "s"}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
            All-Time
          </p>
          <p className="text-xl font-semibold">{revAll}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {txCountAll} transaction{txCountAll !== 1 && "s"}
          </p>
        </div>
      </div>
    </div>
  );
}
