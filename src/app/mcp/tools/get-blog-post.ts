import { z } from "zod";
import { eq, or } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerGetBlogPost(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "get_blog_post",
    {
      title: "Get blog post",
      description:
        "Fetch a single blog post by id (UUID) or slug. Returns the full post including content, tags, status, hero image, and timestamps. Returns posts of any status (draft, published, archived). Returns null if not found or hidden.",
      inputSchema: {
        idOrSlug: z
          .string()
          .min(1)
          .describe("Either the UUID or the slug of the post."),
      },
    },
    async ({ idOrSlug }) => {
      const looksLikeUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          idOrSlug,
        );

      const condition = looksLikeUuid
        ? or(eq(blogPosts.id, idOrSlug), eq(blogPosts.slug, idOrSlug))
        : eq(blogPosts.slug, idOrSlug);

      const rows = await db
        .select()
        .from(blogPosts)
        .where(condition)
        .limit(1);

      if (rows.length === 0 || rows[0].hidden) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No blog post found matching "${idOrSlug}".`,
            },
          ],
        };
      }

      const post = rows[0];
      const payload = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        author: post.author,
        tags: post.tags,
        status: post.status,
        heroImage: post.heroImage,
        heroImageId: post.heroImageId,
        heroImageAlt: post.heroImageAlt,
        featuredVideo: post.featuredVideo,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(payload, null, 2) },
        ],
      };
    },
  );
}
