import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPing } from "./ping";
import { registerListBlogDrafts } from "./list-blog-drafts";
import { registerUpdateBlogDraft } from "./update-blog-draft";
import { registerGetBlogPost } from "./get-blog-post";
import { registerCreateBlogDraft } from "./create-blog-draft";
import { registerSearchBlogPosts } from "./search-blog-posts";
import { registerFindImages } from "./find-images";

export interface ToolContext {
  userId: string;
  tokenId: string;
  clientId: string;
}

export function registerTools(server: McpServer, context: ToolContext) {
  registerPing(server, context);
  registerListBlogDrafts(server, context);
  registerUpdateBlogDraft(server, context);
  registerGetBlogPost(server, context);
  registerCreateBlogDraft(server, context);
  registerSearchBlogPosts(server, context);
  registerFindImages(server, context);
}
