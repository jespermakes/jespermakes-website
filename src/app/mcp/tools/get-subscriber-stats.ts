/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { sql, desc, gte, eq } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerGetSubscriberStats(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "get_subscriber_stats",
    {
      title: "Get subscriber stats",
      description:
        "Total subscriber count, growth rates, and most recent signups with their source. Use this for a quick pulse check on newsletter audience.",
      inputSchema: {
        recentLimit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("How many recent signups to return. Default 10."),
      },
    },
    async ({ recentLimit }) => {
      const n = recentLimit ?? 10;
      const day = 24 * 60 * 60 * 1000;

      const since7 = new Date(Date.now() - 7 * day);
      const since30 = new Date(Date.now() - 30 * day);

      // Total active count (subscribed = true)
      const [total] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.subscribed, true));

      const [last7] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(newsletterSubscribers)
        .where(gte(newsletterSubscribers.subscribedAt, since7));

      const [last30] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(newsletterSubscribers)
        .where(gte(newsletterSubscribers.subscribedAt, since30));

      const recent = await db
        .select({
          email: newsletterSubscribers.email,
          source: newsletterSubscribers.source,
          subscribedAt: newsletterSubscribers.subscribedAt,
        })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.subscribed, true))
        .orderBy(desc(newsletterSubscribers.subscribedAt))
        .limit(n);

      const sourceBreakdown = await db
        .select({
          source: newsletterSubscribers.source,
          count: sql<number>`count(*)::int`,
        })
        .from(newsletterSubscribers)
        .where(gte(newsletterSubscribers.subscribedAt, since30))
        .groupBy(newsletterSubscribers.source)
        .orderBy(sql`count(*) desc`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                totalActiveSubscribers: total.count,
                newLast7Days: last7.count,
                newLast30Days: last30.count,
                recentSignups: recent,
                sourceBreakdown30d: sourceBreakdown,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
