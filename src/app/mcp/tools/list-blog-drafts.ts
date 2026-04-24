import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerListBlogDrafts(server: McpServer, _context: ToolContext) {
  server.registerTool(
    "list_blog_drafts",
    {
      title: "List blog drafts",
      description: "List all blog post drafts (status='draft', not hidden). Returns id, slug, title, description, tags, updatedAt. Does NOT include full content; use get_blog_post for that (not yet implemented).",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe("Max number of drafts to return. Default 25."),
      },
    },
    async ({ limit }) => {
      const n = limit ?? 25;
      const rows = await db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          description: blogPosts.description,
          tags: blogPosts.tags,
          updatedAt: blogPosts.updatedAt,
        })
        .from(blogPosts)
        .where(and(eq(blogPosts.status, "draft"), eq(blogPosts.hidden, false)))
        .orderBy(desc(blogPosts.updatedAt))
        .limit(n);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    },
  );
}
