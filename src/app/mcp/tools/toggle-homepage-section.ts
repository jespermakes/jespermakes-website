/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerToggleHomepageSection(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "toggle_homepage_section",
    {
      title: "Toggle homepage section visibility",
      description:
        "Show or hide a homepage section. If 'visible' is omitted, this toggles the current state. Pass visible=true to force-show or visible=false to force-hide.",
      inputSchema: {
        id: z.string().uuid().describe("The section's UUID."),
        visible: z.boolean().optional().describe("If provided, set to this value. If omitted, toggle the current value."),
      },
    },
    async ({ id, visible }) => {
      const existing = await db
        .select()
        .from(pageSections)
        .where(eq(pageSections.id, id))
        .limit(1);

      if (existing.length === 0) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `No homepage section found with id ${id}` }],
        };
      }

      const section = existing[0];
      const newVisible = visible !== undefined ? visible : !section.visible;

      await db
        .update(pageSections)
        .set({ visible: newVisible, updatedAt: new Date() })
        .where(eq(pageSections.id, id));

      revalidatePath("/");
      revalidatePath("/admin/homepage");

      return {
        content: [
          {
            type: "text" as const,
            text: `Section "${section.kind}" is now ${newVisible ? "visible" : "hidden"}.`,
          },
        ],
      };
    },
  );
}
