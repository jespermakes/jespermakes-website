import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerUnpublishTool(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "unpublish_tool",
    {
      title: "Unpublish tool",
      description:
        "Hide a currently-visible tool by setting hidden=true. The tool record is preserved; it just disappears from public listings.",
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

      if (tool.hidden) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Tool "${tool.name}" is already hidden.`,
            },
          ],
        };
      }

      await db
        .update(toolItems)
        .set({ hidden: true, updatedAt: new Date() })
        .where(eq(toolItems.id, id));

      revalidatePath("/admin/tools");
      revalidatePath("/tools");
      if (tool.slug) revalidatePath(`/tools/${tool.slug}`);

      return {
        content: [
          {
            type: "text" as const,
            text: `Hid "${tool.name}". No longer visible publicly.`,
          },
        ],
      };
    },
  );
}
