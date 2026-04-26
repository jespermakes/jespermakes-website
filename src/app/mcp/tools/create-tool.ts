import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
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
  const baseSlug = base || "untitled-tool";
  let slug = baseSlug;
  let n = 2;
  while (true) {
    const existing = await db
      .select({ id: toolItems.id })
      .from(toolItems)
      .where(eq(toolItems.slug, slug))
      .limit(1);
    if (existing.length === 0) return slug;
    slug = `${baseSlug}-${n}`;
    n += 1;
    if (n > 100) return `${baseSlug}-${Date.now()}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerCreateTool(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "create_tool",
    {
      title: "Create tool",
      description:
        "Create a new entry in the tool catalog. The new tool is created hidden=true by default so it doesn't appear publicly until you call publish_tool. Pass name and as many other fields as you have. Returns the new tool's id and slug.",
      inputSchema: {
        name: z
          .string()
          .min(1)
          .max(200)
          .describe("The tool's display name."),
        description: z
          .string()
          .max(500)
          .optional()
          .describe("Short description shown in catalog listings."),
        longDescription: z
          .string()
          .optional()
          .describe(
            "Full description shown on the tool's page. Markdown supported.",
          ),
        category: z.string().optional().describe("Category display name."),
        categorySlug: z.string().optional().describe("Category slug."),
        ambassadorBadge: z
          .boolean()
          .optional()
          .describe("Whether this is an ambassador/sponsored tool."),
      },
    },
    async ({
      name,
      description,
      longDescription,
      category,
      categorySlug,
      ambassadorBadge,
    }) => {
      const slug = await uniqueSlug(slugify(name));
      const now = new Date();

      const insertData: Record<string, unknown> = {
        slug,
        name,
        hidden: true,
        createdAt: now,
        updatedAt: now,
      };
      if (description !== undefined) insertData.description = description;
      if (longDescription !== undefined)
        insertData.longDescription = longDescription;
      if (category !== undefined) insertData.category = category;
      if (categorySlug !== undefined) insertData.categorySlug = categorySlug;
      if (ambassadorBadge !== undefined)
        insertData.ambassadorBadge = ambassadorBadge;

      const [created] = await db
        .insert(toolItems)
        .values(insertData as typeof toolItems.$inferInsert)
        .returning({ id: toolItems.id, slug: toolItems.slug });

      revalidatePath("/admin/tools");
      revalidatePath("/tools");

      return {
        content: [
          {
            type: "text" as const,
            text: `Created tool "${name}" (id=${created.id}, slug=${created.slug}). Hidden by default. Use update_tool to add more fields, then publish_tool when ready to make it visible. View in admin: /admin/tools/${created.id}`,
          },
        ],
      };
    },
  );
}
