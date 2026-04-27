/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerReorderHomepageSections(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "reorder_homepage_sections",
    {
      title: "Reorder homepage sections",
      description:
        "Reorder homepage sections by passing an array of section UUIDs in the desired display order. The first id becomes position=0, the second position=1, and so on. Pass ALL section ids to avoid position conflicts. Call list_homepage_sections first to get current ids.",
      inputSchema: {
        orderedIds: z
          .array(z.string().uuid())
          .min(1)
          .describe("Array of section UUIDs in the desired order. Should include all sections."),
      },
    },
    async ({ orderedIds }) => {
      const existing = await db
        .select({ id: pageSections.id })
        .from(pageSections)
        .where(inArray(pageSections.id, orderedIds));

      if (existing.length !== orderedIds.length) {
        const found = new Set(existing.map((r) => r.id));
        const missing = orderedIds.filter((id) => !found.has(id));
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Some section ids don't exist: ${missing.join(", ")}` }],
        };
      }

      await db.transaction(async (tx) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await tx
            .update(pageSections)
            .set({ position: i, updatedAt: new Date() })
            .where(eq(pageSections.id, orderedIds[i]));
        }
      });

      revalidatePath("/");
      revalidatePath("/admin/homepage");

      return {
        content: [
          {
            type: "text" as const,
            text: `Reordered ${orderedIds.length} sections.`,
          },
        ],
      };
    },
  );
}
