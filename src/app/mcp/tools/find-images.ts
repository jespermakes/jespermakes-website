import { z } from "zod";
import { and, eq, sql, desc } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerFindImages(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "find_images",
    {
      title: "Find images",
      description:
        "Search the image library. Filter by tags (matches across customTags, toolCategories, sponsors, and who arrays), by free-text query against descriptions and filenames, or both. Returns image metadata including URL, description, tags, and dimensions. Use this when picking hero images for blog posts or any other image selection task.",
      inputSchema: {
        query: z
          .string()
          .max(200)
          .optional()
          .describe("Free-text search against description and filename."),
        tags: z
          .array(z.string())
          .optional()
          .describe(
            "List of tags. An image matches if ANY of these tags appear in customTags, toolCategories, sponsors, or who.",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Max images to return. Default 10."),
        unreviewedOnly: z
          .boolean()
          .optional()
          .describe(
            "If true, only return images that have not been reviewed/tagged yet. Default false.",
          ),
      },
    },
    async ({ query, tags, limit, unreviewedOnly }) => {
      const n = limit ?? 10;
      const onlyUnreviewed = unreviewedOnly ?? false;

      const conditions = [];

      if (query && query.trim().length > 0) {
        const pattern = `%${query.trim().replace(/[%_]/g, (c) => `\\${c}`)}%`;
        conditions.push(
          sql`(${images.description} ILIKE ${pattern} OR ${images.filename} ILIKE ${pattern})`,
        );
      }

      if (tags && tags.length > 0) {
        // Search across all tag array columns using = ANY() for text[] arrays
        const tagConditions = tags.map(
          (tag) =>
            sql`(${tag} = ANY(${images.customTags}) OR ${tag} = ANY(${images.toolCategories}) OR ${tag} = ANY(${images.sponsors}) OR ${tag} = ANY(${images.who}))`,
        );
        conditions.push(sql`(${sql.join(tagConditions, sql` OR `)})`);
      }

      if (onlyUnreviewed) {
        conditions.push(eq(images.reviewed, false));
      }

      const rows = await db
        .select({
          id: images.id,
          url: images.url,
          filename: images.filename,
          description: images.description,
          customTags: images.customTags,
          width: images.width,
          height: images.height,
          uploadedAt: images.uploadedAt,
        })
        .from(images)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(images.uploadedAt))
        .limit(n);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No images found matching the criteria.",
            },
          ],
        };
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(rows, null, 2) },
        ],
      };
    },
  );
}
