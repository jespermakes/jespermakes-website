"use client";

import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  total: number;
  today: number;
  thisWeek: number;
  byType: { eventType: string; count: number }[];
  daily: { date: string; event_type: string; count: number }[];
  topCountries: { country: string; count: number }[];
  topUrls: { input_url: string; count: number }[];
  recent: {
    id: number;
    eventType: string;
    inputTitle: string | null;
    inputUrl: string | null;
    inputDescription: string | null;
    country: string | null;
    createdAt: string;
  }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/50 border border-wood/6 rounded-2xl p-4 text-center">
      <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/25 mb-1">{label}</p>
      <p className="font-serif text-3xl text-wood">{value}</p>
      {sub && <p className="text-[11px] text-wood-light/25 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Daily Chart ─────────────────────────────────────────────────────────────

function DailyChart({ data }: { data: DashboardData["daily"] }) {
  const byDate: Record<string, { url: number; brainstorm: number }> = {};
  for (const row of data) {
    if (!byDate[row.date]) byDate[row.date] = { url: 0, brainstorm: 0 };
    if (row.event_type === "url_analyze") byDate[row.date].url = row.count;
    if (row.event_type === "guided_brainstorm") byDate[row.date].brainstorm = row.count;
  }

  const dates = Object.keys(byDate).sort().slice(-7);
  const maxVal = Math.max(...dates.map((d) => byDate[d].url + byDate[d].brainstorm), 1);

  if (dates.length === 0) {
    return (
      <div className="bg-white/50 border border-wood/6 rounded-2xl p-6 text-center">
        <p className="text-sm text-wood-light/25">No usage data yet. Chart will appear after the first interactions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/50 border border-wood/6 rounded-2xl p-5">
      <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/25 mb-4">
        DAILY USAGE — LAST 7 DAYS
      </p>
      <div className="flex items-end gap-1.5" style={{ height: 120 }}>
        {dates.map((date) => {
          const d = byDate[date];
          const urlH = (d.url / maxVal) * 100;
          const brainstormH = (d.brainstorm / maxVal) * 100;
          const dayLabel = new Date(date + "T12:00:00Z").toLocaleDateString("en", {
            weekday: "short",
          });
          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: 100 }}>
                <div
                  className="w-full rounded-t bg-amber transition-all duration-500"
                  style={{ height: `${urlH}%`, minHeight: d.url > 0 ? 3 : 0 }}
                />
                <div
                  className="w-full rounded-b bg-blue-400/50 transition-all duration-500"
                  style={{ height: `${brainstormH}%`, minHeight: d.brainstorm > 0 ? 3 : 0 }}
                />
              </div>
              <span className="text-[10px] text-wood-light/25">{dayLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-amber" />
          <span className="text-[10px] text-wood-light/30">URL Analyze</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-blue-400/50" />
          <span className="text-[10px] text-wood-light/30">Brainstorm</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TitleLabDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/title-lab/admin/dashboard")
      .then((res) => {
        if (res.status === 401) throw new Error("Unauthorized");
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-wood-light/30">Loading dashboard...</p>
      </main>
    );
  }

  if (error === "Unauthorized") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-xl text-wood mb-2">Not authorized</p>
          <p className="text-sm text-wood-light/40">
            You need to be logged in as admin to view this page.
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-red-500">Failed to load dashboard data.</p>
      </main>
    );
  }

  const urlCount = data.byType.find((t) => t.eventType === "url_analyze")?.count ?? 0;
  const brainstormCount = data.byType.find((t) => t.eventType === "guided_brainstorm")?.count ?? 0;
  const playbookCount = data.byType.find((t) => t.eventType === "playbook_view")?.count ?? 0;
  const topCountryMax = data.topCountries[0]?.count ?? 1;

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-bold tracking-[0.25em] text-amber mb-2 uppercase">
            Title Lab
          </p>
          <h1 className="font-serif text-3xl text-wood mb-1">Dashboard</h1>
          <p className="text-sm text-wood-light/25">Private — only visible to you.</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="TOTAL USES" value={fmt(data.total)} />
          <StatCard label="TODAY" value={data.today} />
          <StatCard label="THIS WEEK" value={data.thisWeek} />
          <StatCard label="COUNTRIES" value={data.topCountries.length} />
        </div>

        {/* Feature breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            label="URL ANALYZE"
            value={urlCount}
            sub={data.total > 0 ? `${Math.round((urlCount / data.total) * 100)}% of total` : undefined}
          />
          <StatCard
            label="BRAINSTORM"
            value={brainstormCount}
            sub={data.total > 0 ? `${Math.round((brainstormCount / data.total) * 100)}% of total` : undefined}
          />
          <StatCard
            label="PLAYBOOK"
            value={playbookCount}
            sub={data.total > 0 ? `${Math.round((playbookCount / data.total) * 100)}% of total` : undefined}
          />
        </div>

        {/* Daily chart */}
        <div className="mb-6">
          <DailyChart data={data.daily} />
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Countries */}
          <div className="bg-white/50 border border-wood/6 rounded-2xl p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/25 mb-3">
              TOP COUNTRIES
            </p>
            {data.topCountries.length === 0 ? (
              <p className="text-sm text-wood-light/20">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {data.topCountries.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-wood w-7">{c.country}</span>
                    <div className="flex-1 h-1.5 bg-wood/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber rounded-full transition-all duration-500"
                        style={{ width: `${(c.count / topCountryMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-wood-light/30 w-8 text-right">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top URLs */}
          <div className="bg-white/50 border border-wood/6 rounded-2xl p-5">
            <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/25 mb-3">
              MOST ANALYZED URLS
            </p>
            {data.topUrls.length === 0 ? (
              <p className="text-sm text-wood-light/20">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {data.topUrls.map((u, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-wood-light/15 w-4">
                      {i + 1}
                    </span>
                    <span className="text-xs text-wood-light/40 flex-1 truncate">
                      {u.input_url.replace("https://youtube.com/watch?v=", "").replace("https://www.youtube.com/watch?v=", "")}
                    </span>
                    <span className="text-[11px] text-wood-light/25">{u.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white/50 border border-wood/6 rounded-2xl p-5">
          <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/25 mb-3">
            RECENT ACTIVITY
          </p>
          {data.recent.length === 0 ? (
            <p className="text-sm text-wood-light/20">No activity yet.</p>
          ) : (
            <div className="divide-y divide-wood/4">
              {data.recent.map((e) => {
                const time = new Date(e.createdAt).toLocaleTimeString("en", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const date = new Date(e.createdAt).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                });
                const isUrl = e.eventType === "url_analyze";
                const isBrainstorm = e.eventType === "guided_brainstorm";
                const typeLabel = isUrl ? "URL" : isBrainstorm ? "BRAINSTORM" : "PLAYBOOK";
                const typeColor = isUrl
                  ? "text-amber bg-amber/8"
                  : isBrainstorm
                  ? "text-blue-500 bg-blue-500/8"
                  : "text-wood-light/30 bg-wood/5";
                const detail = e.inputUrl
                  ? e.inputUrl
                      .replace("https://youtube.com/watch?v=", "")
                      .replace("https://www.youtube.com/watch?v=", "")
                  : e.inputDescription
                  ? e.inputDescription.slice(0, 60) + (e.inputDescription.length > 60 ? "..." : "")
                  : "—";

                return (
                  <div key={e.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-[11px] text-wood-light/20 w-20 flex-shrink-0">
                      {date} {time}
                    </span>
                    <span
                      className={`text-[9px] font-bold tracking-[0.1em] px-2 py-0.5 rounded ${typeColor} w-20 text-center flex-shrink-0`}
                    >
                      {typeLabel}
                    </span>
                    <span className="text-xs text-wood-light/40 flex-1 truncate">
                      {detail}
                    </span>
                    <span className="text-[11px] text-wood-light/15 flex-shrink-0">
                      {e.country || "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[11px] text-wood-light/12">
            Title Lab Admin — jespermakes.com
          </p>
        </div>
      </div>
    </main>
  );
}
