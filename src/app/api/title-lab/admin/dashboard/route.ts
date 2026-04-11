import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { titleLabEvents } from "@/lib/db/schema";
import { sql, desc, count } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (
    !session?.user?.email ||
    session.user.email !== process.env.ADMIN_EMAIL
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalEvents = await db
      .select({ count: count() })
      .from(titleLabEvents);

    const eventsByType = await db
      .select({ eventType: titleLabEvents.eventType, count: count() })
      .from(titleLabEvents)
      .groupBy(titleLabEvents.eventType);

    const dailyEvents = await db.execute(sql`
      SELECT DATE(created_at) as date, event_type, COUNT(*)::int as count
      FROM title_lab_events
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at), event_type
      ORDER BY date DESC
    `);

    const topCountries = await db.execute(sql`
      SELECT country, COUNT(*)::int as count
      FROM title_lab_events
      WHERE country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `);

    const recentEvents = await db
      .select({
        id: titleLabEvents.id,
        eventType: titleLabEvents.eventType,
        inputTitle: titleLabEvents.inputTitle,
        inputUrl: titleLabEvents.inputUrl,
        inputDescription: titleLabEvents.inputDescription,
        country: titleLabEvents.country,
        createdAt: titleLabEvents.createdAt,
      })
      .from(titleLabEvents)
      .orderBy(desc(titleLabEvents.createdAt))
      .limit(50);

    const topUrls = await db.execute(sql`
      SELECT input_url, COUNT(*)::int as count
      FROM title_lab_events
      WHERE input_url IS NOT NULL
      GROUP BY input_url
      ORDER BY count DESC
      LIMIT 10
    `);

    const todayCount = await db.execute(sql`
      SELECT COUNT(*)::int as count
      FROM title_lab_events
      WHERE created_at > DATE_TRUNC('day', NOW())
    `);

    const weekCount = await db.execute(sql`
      SELECT COUNT(*)::int as count
      FROM title_lab_events
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);

    return NextResponse.json({
      total: totalEvents[0]?.count ?? 0,
      today: todayCount.rows?.[0]?.count ?? 0,
      thisWeek: weekCount.rows?.[0]?.count ?? 0,
      byType: eventsByType,
      daily: dailyEvents.rows ?? [],
      topCountries: topCountries.rows ?? [],
      topUrls: topUrls.rows ?? [],
      recent: recentEvents,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    );
  }
}
