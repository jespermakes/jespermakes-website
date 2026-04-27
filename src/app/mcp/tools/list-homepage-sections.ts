/* eslint-disable @typescript-eslint/no-unused-vars */
import { asc, eq } from "drizzle-orm";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import type { ToolContext } from "./index";

export function registerListHomepageSections(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "list_homepage_sections",
    {
      title: "List homepage sections",
      description:
        "Return every section on the homepage, in display order. Each section includes its id, kind (hero, blog, shop, etc.), position, visibility, and the data payload (title, subtitle, CTA, etc., depending on section kind). Use this to understand the current homepage shape before editing.",
      inputSchema: {},
    },
    async () => {
      const rows = await db
        .select()
        .from(pageSections)
        .where(eq(pageSections.pageSlug, "home"))
        .orderBy(asc(pageSections.position));

      return {
        content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }],
      };
    },
  );
}
