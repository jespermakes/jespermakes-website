/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { purchases, users } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerListRecentOrders(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "list_recent_orders",
    {
      title: "List recent orders",
      description:
        "Return the most recent orders with email, SKU, product name, amount, and timestamp. Useful for spot-checking sales activity. For aggregate stats, use get_order_stats instead.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Max orders to return. Default 20."),
      },
    },
    async ({ limit }) => {
      const n = limit ?? 20;

      const rows = await db
        .select({
          id: purchases.id,
          email: users.email,
          sku: purchases.sku,
          productName: purchases.productName,
          amount: purchases.amount,
          currency: purchases.currency,
          purchasedAt: purchases.purchasedAt,
        })
        .from(purchases)
        .leftJoin(users, eq(purchases.userId, users.id))
        .orderBy(desc(purchases.purchasedAt))
        .limit(n);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }],
      };
    },
  );
}
