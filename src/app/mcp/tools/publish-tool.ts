import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerPublishTool(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "publish_tool",
    {
      title: "Publish tool",
      description:
        "Make a tool visible publicly by setting hidden=false. Refuses if the tool is already visible or is missing a name.",
      inputSchema: {
        id: z.string().uuid(),
      },
    },
    async ({ id }) => {
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

      if (!tool.hidden) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Tool "${tool.name}" is already visible.`,
            },
          ],
        };
      }

      if (!tool.name || tool.name.trim().length === 0) {
        return {
          isError: true,
          content: [
            { type: "text" as const, text: `Cannot publish: tool has no name.` },
          ],
        };
      }

      await db
        .update(toolItems)
        .set({ hidden: false, updatedAt: new Date() })
        .where(eq(toolItems.id, id));

      revalidatePath("/admin/tools");
      revalidatePath("/tools");
      if (tool.slug) revalidatePath(`/tools/${tool.slug}`);

      return {
        content: [
          {
            type: "text" as const,
            text: `Published "${tool.name}". Live at /tools/${tool.slug}.`,
          },
        ],
      };
    },
  );
}
