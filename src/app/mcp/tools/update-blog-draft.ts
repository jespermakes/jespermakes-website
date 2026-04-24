import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerUpdateBlogDraft(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "update_blog_draft",
    {
      title: "Update blog draft",
      description: "Update fields on an existing blog draft. Will refuse to modify posts that are already published (status='published'). Pass only the fields you want to change.",
      inputSchema: {
        id: z.string().uuid().describe("The blog post's UUID."),
        title: z.string().min(1).max(300).optional(),
        description: z.string().max(500).optional(),
        content: z.string().optional().describe("Full markdown body of the post."),
        tags: z.array(z.string()).optional(),
      },
    },
    async ({ id, title, description, content, tags }) => {
      const existing = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (existing.length === 0) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `No blog post found with id ${id}` }],
        };
      }

      const post = existing[0];
      if (post.status !== "draft") {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Blog post ${id} is currently status='${post.status}'. This tool only modifies drafts. Use the admin UI to update published posts.` }],
        };
      }

      if (post.hidden) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Blog post ${id} is hidden (soft-deleted). Restore it via the admin before editing.` }],
        };
      }

      const patch: Partial<typeof blogPosts.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (title !== undefined) patch.title = title;
      if (description !== undefined) patch.description = description;
      if (content !== undefined) patch.content = content;
      if (tags !== undefined) patch.tags = tags;

      if (Object.keys(patch).length === 1) {
        return {
          content: [{ type: "text" as const, text: "No changes provided. Pass at least one of: title, description, content, tags." }],
        };
      }

      await db.update(blogPosts).set(patch).where(eq(blogPosts.id, id));

      revalidatePath("/admin/blog");
      revalidatePath(`/admin/blog/${id}`);

      return {
        content: [
          {
            type: "text" as const,
            text: `Draft updated. Changed fields: ${Object.keys(patch).filter((k) => k !== "updatedAt").join(", ")}.`,
          },
        ],
      };
    },
  );
}
