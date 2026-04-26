import { z } from "zod";
import { eq, or } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerGetTool(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "get_tool",
    {
      title: "Get tool",
      description:
        "Fetch a single tool catalog entry by id (UUID) or slug. Returns the full tool record including name, description, longDescription, category, hidden status, and timestamps.",
      inputSchema: {
        idOrSlug: z
          .string()
          .min(1)
          .describe("Either the UUID or the slug of the tool."),
      },
    },
    async ({ idOrSlug }) => {
      const looksLikeUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          idOrSlug,
        );

      const condition = looksLikeUuid
        ? or(eq(toolItems.id, idOrSlug), eq(toolItems.slug, idOrSlug))
        : eq(toolItems.slug, idOrSlug);

      const rows = await db
        .select()
        .from(toolItems)
        .where(condition)
        .limit(1);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No tool found matching "${idOrSlug}".`,
            },
          ],
        };
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(rows[0], null, 2) },
        ],
      };
    },
  );
}
