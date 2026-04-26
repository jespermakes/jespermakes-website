/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerUnpublishBlogPost(
  server: McpServer,
  _ctx: ToolContext,
) {
  server.registerTool(
    "unpublish_blog_post",
    {
      title: "Unpublish blog post",
      description:
        "Unpublish a published blog post by setting status='draft'. The publishedAt timestamp is preserved (so re-publishing later restores the original publish date). Use this to take a post offline temporarily.",
      inputSchema: {
        id: z.string().uuid().describe("The blog post's UUID."),
      },
    },
    async ({ id }) => {
      const existing = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (existing.length === 0) {
        return {
          isError: true,
          content: [
            { type: "text" as const, text: `No blog post found with id ${id}` },
          ],
        };
      }

      const post = existing[0];

      if (post.status !== "published") {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Post "${post.title}" is not currently published (status=${post.status}).`,
            },
          ],
        };
      }

      await db
        .update(blogPosts)
        .set({ status: "draft", updatedAt: new Date() })
        .where(eq(blogPosts.id, id));

      revalidatePath("/admin/blog");
      revalidatePath(`/admin/blog/${id}`);
      revalidatePath("/blog");
      if (post.slug) {
        revalidatePath(`/blog/${post.slug}`);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Unpublished "${post.title}". Now in draft status. Original publishedAt timestamp preserved.`,
          },
        ],
      };
    },
  );
}
