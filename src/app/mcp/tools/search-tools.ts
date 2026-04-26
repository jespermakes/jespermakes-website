import { z } from "zod";
import { and, eq, or, sql, desc } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerSearchTools(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "search_tools",
    {
      title: "Search tools",
      description:
        "Full-text search across tool catalog fields (name, description, longDescription). Case-insensitive. Returns matching tools with id, slug, name, description, hidden status, and a snippet around the first match.",
      inputSchema: {
        query: z.string().min(1).max(200),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Default 10."),
        includeHidden: z
          .boolean()
          .optional()
          .describe("Include hidden tools in results. Default false."),
      },
    },
    async ({ query, limit, includeHidden }) => {
      const n = limit ?? 10;
      const pattern = `%${query.replace(/[%_]/g, (c) => `\\${c}`)}%`;

      const conditions = [
        or(
          sql`${toolItems.name} ILIKE ${pattern}`,
          sql`${toolItems.description} ILIKE ${pattern}`,
          sql`${toolItems.longDescription} ILIKE ${pattern}`,
        ),
      ];

      if (!includeHidden) {
        conditions.push(eq(toolItems.hidden, false));
      }

      const rows = await db
        .select({
          id: toolItems.id,
          slug: toolItems.slug,
          name: toolItems.name,
          description: toolItems.description,
          longDescription: toolItems.longDescription,
          hidden: toolItems.hidden,
          updatedAt: toolItems.updatedAt,
        })
        .from(toolItems)
        .where(and(...conditions))
        .orderBy(desc(toolItems.updatedAt))
        .limit(n);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No tools found matching "${query}".`,
            },
          ],
        };
      }

      const lowerQuery = query.toLowerCase();
      const results = rows.map((row) => {
        const haystack = `${row.name} ${row.description ?? ""} ${row.longDescription ?? ""}`;
        const idx = haystack.toLowerCase().indexOf(lowerQuery);
        let snippet = "";
        if (idx >= 0) {
          const start = Math.max(0, idx - 80);
          const end = Math.min(
            haystack.length,
            idx + lowerQuery.length + 80,
          );
          snippet =
            (start > 0 ? "..." : "") +
            haystack.slice(start, end) +
            (end < haystack.length ? "..." : "");
        }
        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          hidden: row.hidden,
          snippet,
        };
      });

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(results, null, 2) },
        ],
      };
    },
  );
}
