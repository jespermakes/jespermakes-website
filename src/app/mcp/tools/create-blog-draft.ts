import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { ToolContext } from "./index";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const baseSlug = base || "untitled";
  let slug = baseSlug;
  let n = 2;
  while (true) {
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    if (existing.length === 0) return slug;
    slug = `${baseSlug}-${n}`;
    n += 1;
    if (n > 100) {
      return `${baseSlug}-${Date.now()}`;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerCreateBlogDraft(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "create_blog_draft",
    {
      title: "Create blog draft",
      description:
        "Create a new blog post in draft status. Returns the new post's id and slug. The slug is generated from the title; if the title's slug is taken, a numeric suffix is appended. The post is saved with status='draft' and hidden=false. Use update_blog_draft afterward to refine the content.",
      inputSchema: {
        title: z
          .string()
          .min(1)
          .max(300)
          .describe("The post title."),
        description: z
          .string()
          .max(500)
          .optional()
          .describe("Short description / subtitle for the post."),
        content: z
          .string()
          .optional()
          .describe(
            "Initial markdown content. Can be empty if you just want to claim the slot.",
          ),
        tags: z
          .array(z.string())
          .optional()
          .describe("List of tag slugs."),
      },
    },
    async ({ title, description, content, tags }) => {
      const baseSlug = slugify(title);
      const slug = await uniqueSlug(baseSlug);

      const now = new Date();
      const [created] = await db
        .insert(blogPosts)
        .values({
          slug,
          title,
          description: description ?? "",
          content: content ?? "",
          tags: tags ?? [],
          status: "draft",
          hidden: false,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: blogPosts.id, slug: blogPosts.slug });

      revalidatePath("/admin/blog");

      return {
        content: [
          {
            type: "text" as const,
            text: `Created draft. id=${created.id}, slug=${created.slug}. Use get_blog_post or update_blog_draft to continue working on it. View in admin: /admin/blog/${created.id}`,
          },
        ],
      };
    },
  );
}
