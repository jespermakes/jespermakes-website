import { z } from "zod";
import { and, eq, or, sql, desc } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerSearchBlogPosts(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "search_blog_posts",
    {
      title: "Search blog posts",
      description:
        "Search blog posts by query string across title, description, and content. Returns matching posts with id, slug, title, description, status, and a content snippet around the first match. Searches are case-insensitive. Use this before drafting a new post to check whether a topic has already been covered.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .max(200)
          .describe(
            "The search query. Plain text; no special operators needed.",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Max number of results. Default 10."),
        includeHidden: z
          .boolean()
          .optional()
          .describe("Include hidden (soft-deleted) posts. Default false."),
        status: z
          .enum(["draft", "published", "archived", "any"])
          .optional()
          .describe("Filter by status. Default 'any'."),
      },
    },
    async ({ query, limit, includeHidden, status }) => {
      const n = limit ?? 10;
      const includeH = includeHidden ?? false;
      const statusFilter = status ?? "any";

      const pattern = `%${query.replace(/[%_]/g, (c) => `\\${c}`)}%`;

      const conditions = [
        or(
          sql`${blogPosts.title} ILIKE ${pattern}`,
          sql`${blogPosts.description} ILIKE ${pattern}`,
          sql`${blogPosts.content} ILIKE ${pattern}`,
        ),
      ];

      if (!includeH) {
        conditions.push(eq(blogPosts.hidden, false));
      }

      if (statusFilter !== "any") {
        conditions.push(eq(blogPosts.status, statusFilter));
      }

      const rows = await db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          description: blogPosts.description,
          status: blogPosts.status,
          content: blogPosts.content,
          updatedAt: blogPosts.updatedAt,
        })
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.updatedAt))
        .limit(n);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No posts found matching "${query}".`,
            },
          ],
        };
      }

      const lowerQuery = query.toLowerCase();
      const results = rows.map((row) => {
        const haystack = `${row.title} ${row.description ?? ""} ${row.content ?? ""}`;
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
          title: row.title,
          description: row.description,
          status: row.status,
          updatedAt: row.updatedAt,
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
