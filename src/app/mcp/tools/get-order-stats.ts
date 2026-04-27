/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { gte, sql } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { purchases } from "@/lib/db/schema";
import type { ToolContext } from "./index";

function periodToSince(period: string): Date {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  switch (period) {
    case "today": {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "yesterday": {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 1);
      return start;
    }
    case "7d":
      return new Date(now - 7 * day);
    case "30d":
      return new Date(now - 30 * day);
    case "90d":
      return new Date(now - 90 * day);
    case "ytd": {
      const d = new Date();
      return new Date(d.getFullYear(), 0, 1);
    }
    case "all":
      return new Date(0);
    default:
      return new Date(now - 7 * day);
  }
}

export function registerGetOrderStats(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "get_order_stats",
    {
      title: "Get order stats",
      description:
        "Revenue and order count for a time period, with a top-products breakdown. Useful for 'how did we do today' or 'how have cheat sheets been selling this month' questions.",
      inputSchema: {
        period: z
          .enum(["today", "yesterday", "7d", "30d", "90d", "ytd", "all"])
          .optional()
          .describe("Time period. Default '7d'."),
      },
    },
    async ({ period }) => {
      const p = period ?? "7d";
      const since = periodToSince(p);

      const [totals] = await db
        .select({
          orderCount: sql<number>`count(*)::int`,
          totalRevenue: sql<number>`coalesce(sum(${purchases.amount}), 0)::int`,
        })
        .from(purchases)
        .where(gte(purchases.purchasedAt, since));

      const topProducts = await db
        .select({
          sku: purchases.sku,
          productName: purchases.productName,
          orderCount: sql<number>`count(*)::int`,
          revenue: sql<number>`coalesce(sum(${purchases.amount}), 0)::int`,
        })
        .from(purchases)
        .where(gte(purchases.purchasedAt, since))
        .groupBy(purchases.sku, purchases.productName)
        .orderBy(sql`sum(${purchases.amount}) desc`)
        .limit(10);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                period: p,
                since: since.toISOString(),
                orderCount: totals.orderCount,
                totalRevenueCents: totals.totalRevenue,
                topProducts,
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
