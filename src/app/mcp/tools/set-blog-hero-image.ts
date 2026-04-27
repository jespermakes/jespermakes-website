/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { eq, or, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { blogPosts, images } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerSetBlogHeroImage(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "set_blog_hero_image",
    {
      title: "Set blog hero image",
      description:
        "Assign an image as a blog post's hero, in one call. Identify the post by id or slug. Identify the image by id, filename, pathname, or a search query (matches against description, filename, customTags). If a search query matches multiple images, returns the candidates without setting anything; you must then call again with a specific image identifier.",
      inputSchema: {
        postIdOrSlug: z.string().min(1).describe("The blog post's UUID or slug."),
        imageRef: z.string().min(1).describe("Image identifier: UUID, filename, pathname, or search query."),
      },
    },
    async ({ postIdOrSlug, imageRef }) => {
      const looksLikeUuid = (s: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

      // 1. Resolve the post
      const postCondition = looksLikeUuid(postIdOrSlug)
        ? or(eq(blogPosts.id, postIdOrSlug), eq(blogPosts.slug, postIdOrSlug))
        : eq(blogPosts.slug, postIdOrSlug);

      const postRows = await db.select().from(blogPosts).where(postCondition).limit(1);

      if (postRows.length === 0) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `No blog post found matching "${postIdOrSlug}".` }],
        };
      }

      const post = postRows[0];

      // 2. Resolve the image — direct match first (UUID, filename, pathname), then search
      const imageCondition = looksLikeUuid(imageRef)
        ? or(eq(images.id, imageRef), eq(images.filename, imageRef), eq(images.pathname, imageRef))
        : or(eq(images.filename, imageRef), eq(images.pathname, imageRef));

      const directMatch = await db.select().from(images).where(imageCondition).limit(1);

      let chosenImage = directMatch[0];

      if (!chosenImage) {
        const pattern = `%${imageRef.replace(/[%_]/g, (c) => `\\${c}`)}%`;
        const searchResults = await db
          .select({
            id: images.id,
            url: images.url,
            filename: images.filename,
            pathname: images.pathname,
            description: images.description,
            customTags: images.customTags,
          })
          .from(images)
          .where(
            or(
              sql`${images.description} ILIKE ${pattern}`,
              sql`${images.filename} ILIKE ${pattern}`,
              sql`${images.customTags}::text ILIKE ${pattern}`,
            ),
          )
          .orderBy(desc(images.uploadedAt))
          .limit(10);

        if (searchResults.length === 0) {
          return {
            isError: true,
            content: [{ type: "text" as const, text: `No images matching "${imageRef}".` }],
          };
        }

        if (searchResults.length === 1) {
          chosenImage = searchResults[0] as typeof chosenImage;
        } else {
          return {
            content: [
              {
                type: "text" as const,
                text: `Multiple images match "${imageRef}". Specify which one by id or filename:\n\n${JSON.stringify(searchResults, null, 2)}`,
              },
            ],
          };
        }
      }

      // 3. Set the hero — heroImageId (uuid FK) and heroImage (text URL)
      await db
        .update(blogPosts)
        .set({
          heroImageId: chosenImage.id,
          heroImage: chosenImage.url,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, post.id));

      revalidatePath("/admin/blog");
      revalidatePath(`/admin/blog/${post.id}`);
      if (post.status === "published" && post.slug) {
        revalidatePath(`/blog/${post.slug}`);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Set hero image for "${post.title}" to "${chosenImage.filename}" (${chosenImage.url}).`,
          },
        ],
      };
    },
  );
}
