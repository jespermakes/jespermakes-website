import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerListTools(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "list_tools",
    {
      title: "List tools",
      description:
        "List tools from the catalog with optional filters. Returns id, slug, name, description, category, hidden status, and updatedAt for each. By default returns visible (hidden=false) tools sorted by most recently updated. Use search_tools for content-based search.",
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe("Filter by categorySlug."),
        includeHidden: z
          .boolean()
          .optional()
          .describe(
            "If true, include hidden tools as well. Default false (only visible).",
          ),
        hiddenOnly: z
          .boolean()
          .optional()
          .describe(
            "If true, return ONLY hidden tools. Useful for finding entries you've drafted but not published. Default false.",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("Max results. Default 50."),
      },
    },
    async ({ category, includeHidden, hiddenOnly, limit }) => {
      const n = limit ?? 50;
      const conditions = [];

      if (hiddenOnly) {
        conditions.push(eq(toolItems.hidden, true));
      } else if (!includeHidden) {
        conditions.push(eq(toolItems.hidden, false));
      }

      if (category) {
        conditions.push(eq(toolItems.categorySlug, category));
      }

      const rows = await db
        .select({
          id: toolItems.id,
          slug: toolItems.slug,
          name: toolItems.name,
          description: toolItems.description,
          category: toolItems.category,
          categorySlug: toolItems.categorySlug,
          hidden: toolItems.hidden,
          updatedAt: toolItems.updatedAt,
        })
        .from(toolItems)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(toolItems.updatedAt))
        .limit(n);

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(rows, null, 2) },
        ],
      };
    },
  );
}
