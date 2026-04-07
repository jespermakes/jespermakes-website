import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dailyLogs } from "@/lib/db/schema";
import { eq, desc, lt } from "drizzle-orm";

function authorize(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice(7) === process.env.LOG_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { date, content, summary } = body;

  if (!date || !content) {
    return NextResponse.json(
      { error: "date and content are required" },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.date, date))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(dailyLogs)
      .set({ content, summary, updatedAt: new Date() })
      .where(eq(dailyLogs.date, date));
    return NextResponse.json({ status: "updated" });
  }

  await db.insert(dailyLogs).values({ date, content, summary });
  return NextResponse.json({ status: "created" }, { status: 201 });
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const before = searchParams.get("before");

  const logs = await db
    .select({
      date: dailyLogs.date,
      summary: dailyLogs.summary,
      updatedAt: dailyLogs.updatedAt,
    })
    .from(dailyLogs)
    .where(before ? lt(dailyLogs.date, before) : undefined)
    .orderBy(desc(dailyLogs.date))
    .limit(limit);
  return NextResponse.json(logs);
}
