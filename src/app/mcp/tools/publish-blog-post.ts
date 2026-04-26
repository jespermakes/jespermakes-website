import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerPublishBlogPost(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "publish_blog_post",
    {
      title: "Publish blog post",
      description:
        "Publish a blog post by setting status='published' and publishedAt to now (if not already set). Refuses if the post is already published, hidden, or missing a title or content. Before calling this, read back the post details to confirm the publish is intended.",
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

      if (post.hidden) {
        return {
          isError: true,
          content: [
            { type: "text" as const, text: `Cannot publish: post ${id} is hidden.` },
          ],
        };
      }

      if (post.status === "published") {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Post "${post.title}" is already published.`,
            },
          ],
        };
      }

      if (!post.title || post.title.trim().length === 0) {
        return {
          isError: true,
          content: [
            { type: "text" as const, text: `Cannot publish: post has no title.` },
          ],
        };
      }

      if (!post.content || post.content.trim().length === 0) {
        return {
          isError: true,
          content: [
            { type: "text" as const, text: `Cannot publish: post has no content.` },
          ],
        };
      }

      const now = new Date();
      const patch: Partial<typeof blogPosts.$inferInsert> = {
        status: "published",
        updatedAt: now,
      };

      if (!post.publishedAt) {
        patch.publishedAt = now;
      }

      await db.update(blogPosts).set(patch).where(eq(blogPosts.id, id));

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
            text: `Published "${post.title}". Live at /blog/${post.slug}.`,
          },
        ],
      };
    },
  );
}
