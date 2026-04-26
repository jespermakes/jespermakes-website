/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { desc, gte } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts, toolItems } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerListRecentChanges(
  server: McpServer,
  _ctx: ToolContext,
) {
  server.registerTool(
    "list_recent_changes",
    {
      title: "List recent changes",
      description:
        "Return recently-updated content across blog posts and tools. Useful for 'what did I change yesterday' or 'what's been touched this week' kinds of questions. Returns a unified list sorted by updatedAt descending, with the source domain noted on each item.",
      inputSchema: {
        scope: z
          .enum(["blog", "tools", "all"])
          .optional()
          .describe("Which domain(s) to include. Default 'all'."),
        sinceDays: z
          .number()
          .int()
          .min(1)
          .max(365)
          .optional()
          .describe("Only items updated in the last N days. Default 7."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Max items. Default 30."),
      },
    },
    async ({ scope, sinceDays, limit }) => {
      const s = scope ?? "all";
      const n = limit ?? 30;
      const days = sinceDays ?? 7;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const items: Array<{
        domain: string;
        id: string;
        slug: string | null;
        title: string;
        status: string;
        updatedAt: Date;
      }> = [];

      if (s === "blog" || s === "all") {
        const blogRows = await db
          .select({
            id: blogPosts.id,
            slug: blogPosts.slug,
            title: blogPosts.title,
            status: blogPosts.status,
            updatedAt: blogPosts.updatedAt,
          })
          .from(blogPosts)
          .where(gte(blogPosts.updatedAt, since))
          .orderBy(desc(blogPosts.updatedAt))
          .limit(n);
        for (const r of blogRows) {
          items.push({
            domain: "blog",
            id: r.id,
            slug: r.slug,
            title: r.title,
            status: r.status,
            updatedAt: r.updatedAt,
          });
        }
      }

      if (s === "tools" || s === "all") {
        const toolRows = await db
          .select({
            id: toolItems.id,
            slug: toolItems.slug,
            name: toolItems.name,
            hidden: toolItems.hidden,
            updatedAt: toolItems.updatedAt,
          })
          .from(toolItems)
          .where(gte(toolItems.updatedAt, since))
          .orderBy(desc(toolItems.updatedAt))
          .limit(n);
        for (const r of toolRows) {
          items.push({
            domain: "tools",
            id: r.id,
            slug: r.slug,
            title: r.name,
            status: r.hidden ? "hidden" : "visible",
            updatedAt: r.updatedAt,
          });
        }
      }

      items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      const trimmed = items.slice(0, n);

      if (trimmed.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No changes in the last ${days} days for scope=${s}.`,
            },
          ],
        };
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(trimmed, null, 2) },
        ],
      };
    },
  );
}
