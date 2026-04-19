import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { checkAdminApi } from "@/lib/admin/auth";

function csvEscape(s: string | null | undefined): string {
  if (s === null || s === undefined) return "";
  const str = String(s);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const rows = await db
    .select({
      email: newsletterSubscribers.email,
      firstName: newsletterSubscribers.firstName,
      source: newsletterSubscribers.source,
      subscribedAt: newsletterSubscribers.subscribedAt,
    })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.subscribed, true))
    .orderBy(desc(newsletterSubscribers.subscribedAt));

  const header = "email,first_name,source,subscribed_at\n";
  const body = rows
    .map(
      (r) =>
        `${csvEscape(r.email)},${csvEscape(r.firstName)},${csvEscape(r.source)},${r.subscribedAt.toISOString()}`
    )
    .join("\n");
  const csv = header + body + (body.length > 0 ? "\n" : "");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jespermakes-subscribers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
