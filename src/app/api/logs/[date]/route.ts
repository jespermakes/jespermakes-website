import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dailyLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function authorize(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice(7) === process.env.LOG_API_SECRET;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.date, params.date))
    .limit(1);

  if (log.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(log[0]);
}
