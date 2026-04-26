import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerUpdateTool(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "update_tool",
    {
      title: "Update tool",
      description:
        "Update fields on an existing tool catalog entry. Works on tools regardless of hidden status. Pass only the fields you want to change. To change visibility, use publish_tool or unpublish_tool instead.",
      inputSchema: {
        id: z.string().uuid().describe("The tool's UUID."),
        name: z.string().min(1).max(200).optional(),
        description: z.string().max(500).optional(),
        longDescription: z.string().optional(),
        category: z.string().optional().describe("Category display name."),
        categorySlug: z.string().optional().describe("Category slug."),
        ambassadorBadge: z.boolean().optional(),
        jesperNote: z.string().optional().describe("Jesper's personal note about the tool."),
        learnMoreUrl: z.string().optional().describe("External learn-more link."),
      },
    },
    async ({ id, ...fields }) => {
      const existing = await db
        .select()
        .from(toolItems)
        .where(eq(toolItems.id, id))
        .limit(1);

      if (existing.length === 0) {
        return {
          isError: true,
          content: [
            { type: "text" as const, text: `No tool found with id ${id}` },
          ],
        };
      }

      const tool = existing[0];

      const patch: Record<string, unknown> = { updatedAt: new Date() };
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) patch[key] = value;
      }

      if (Object.keys(patch).length === 1) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No changes provided. Pass at least one field to update.",
            },
          ],
        };
      }

      await db
        .update(toolItems)
        .set(patch as typeof toolItems.$inferInsert)
        .where(eq(toolItems.id, id));

      revalidatePath("/admin/tools");
      revalidatePath(`/admin/tools/${id}`);
      if (!tool.hidden && tool.slug) {
        revalidatePath(`/tools/${tool.slug}`);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Updated tool "${tool.name}". Changed: ${Object.keys(patch).filter((k) => k !== "updatedAt").join(", ")}.`,
          },
        ],
      };
    },
  );
}
