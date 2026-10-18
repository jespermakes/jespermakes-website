/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { mcpVoiceGate } from "@/lib/voice/gate-log";
import { leafInputs, readOverride } from "@/lib/voice/gate";
import type { ToolContext } from "./index";

export function registerUpdateHomepageSection(server: McpServer, ctx: ToolContext) {
  server.registerTool(
    "update_homepage_section",
    {
      title: "Update homepage section",
      description:
        "Update a homepage section's content. The 'data' field is a JSON object containing whatever the section renders (title, subtitle, CTA text, image path, etc., depending on section kind). Pass the full data object you want the section to have, OR pass a 'patch' object to merge into the existing data. To change visibility, use toggle_homepage_section instead. To reorder, use reorder_homepage_sections.",
      inputSchema: {
        id: z.string().uuid().describe("The section's UUID."),
        data: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Full replacement of the section's data object. Mutually exclusive with patch."),
        patch: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Partial fields to merge into the existing data object. Mutually exclusive with data."),
        voiceOverride: z
          .object({ reason: z.string().min(8) })
          .optional()
          .describe(
            "Only when the voice gate refused this text AND Jesper explicitly approved this exact text: his words as the reason. Logged. Never on your own.",
          ),
      },
    },
    async ({ id, data, patch, voiceOverride }) => {
      if (data === undefined && patch === undefined) {
        return {
          content: [{ type: "text" as const, text: "Pass either 'data' (full replacement) or 'patch' (partial merge)." }],
        };
      }

      if (data !== undefined && patch !== undefined) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: "Pass either 'data' or 'patch', not both." }],
        };
      }

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
      const newData = data !== undefined ? data : { ...(section.data as Record<string, unknown>), ...patch };

      // every copy string in the section, judged on what this edit adds
      const gate = await mcpVoiceGate(
        "update_homepage_section",
        ctx,
        leafInputs(newData, section.data, "data"),
        readOverride(voiceOverride),
      );
      if (gate.refuse) return gate.refuse;

      await db
        .update(pageSections)
        .set({ data: newData, updatedAt: new Date() })
        .where(eq(pageSections.id, id));

      revalidatePath("/");
      revalidatePath("/admin/homepage");

      return {
        content: [
          {
            type: "text" as const,
            text: `Updated section "${section.kind}" (id=${id}). New data: ${JSON.stringify(newData, null, 2)}${gate.note ? `\n\n${gate.note}` : ""}`,
          },
        ],
      };
    },
  );
}
