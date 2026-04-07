import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { dailyLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import LogViewer from "./log-viewer";

export const metadata = {
  title: "Daily Logs — Jesper Makes",
};

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const logs = await db
    .select()
    .from(dailyLogs)
    .orderBy(desc(dailyLogs.date));

  return <LogViewer logs={logs} />;
}
