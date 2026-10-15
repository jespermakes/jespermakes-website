import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { mcpVoiceGate } from "@/lib/voice/gate-log";
import { readOverride } from "@/lib/voice/gate";
import type { ToolContext } from "./index";

export function registerPublishBlogPost(server: McpServer, ctx: ToolContext) {
  server.registerTool(
    "publish_blog_post",
    {
      title: "Publish blog post",
      description:
        "Publish a blog post by setting status='published' and publishedAt to now (if not already set). Refuses if the post is already published, hidden, or missing a title or content. Before calling this, read back the post details to confirm the publish is intended.",
      inputSchema: {
        id: z.string().uuid().describe("The blog post's UUID."),
        voiceOverride: z
          .object({ reason: z.string().min(8) })
          .optional()
          .describe(
            "Only when the voice gate refused this text AND Jesper explicitly approved this exact text: his words as the reason. Logged. Never on your own.",
          ),
      },
    },
    async ({ id, voiceOverride }) => {
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

      // publishing puts the whole text in front of readers: judged in full
      const gate = await mcpVoiceGate(
        "publish_blog_post",
        ctx,
        [
          { field: "title", text: post.title },
          { field: "description", text: post.description },
          { field: "content", text: post.content },
        ],
        readOverride(voiceOverride),
      );
      if (gate.refuse) return gate.refuse;

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
            text: `Published "${post.title}". Live at /blog/${post.slug}.${gate.note ? `\n\n${gate.note}` : ""}`,
          },
        ],
      };
    },
  );
}
