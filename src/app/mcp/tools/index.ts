import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPing } from "./ping";
import { registerListBlogDrafts } from "./list-blog-drafts";
import { registerUpdateBlogDraft } from "./update-blog-draft";

export interface ToolContext {
  userId: string;
  tokenId: string;
  clientId: string;
}

export function registerTools(server: McpServer, context: ToolContext) {
  registerPing(server, context);
  registerListBlogDrafts(server, context);
  registerUpdateBlogDraft(server, context);
}
