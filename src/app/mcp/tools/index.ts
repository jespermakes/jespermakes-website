import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPing } from "./ping";
import { registerListBlogDrafts } from "./list-blog-drafts";
import { registerGetBlogPost } from "./get-blog-post";
import { registerCreateBlogDraft } from "./create-blog-draft";
import { registerSearchBlogPosts } from "./search-blog-posts";
import { registerFindImages } from "./find-images";
import { registerUpdateBlogPost } from "./update-blog-post";
import { registerPublishBlogPost } from "./publish-blog-post";
import { registerUnpublishBlogPost } from "./unpublish-blog-post";
import { registerGetTool } from "./get-tool";
import { registerListTools } from "./list-tools";
import { registerCreateTool } from "./create-tool";
import { registerUpdateTool } from "./update-tool";
import { registerPublishTool } from "./publish-tool";
import { registerUnpublishTool } from "./unpublish-tool";
import { registerSearchTools } from "./search-tools";
import { registerListRecentChanges } from "./list-recent-changes";
import { registerUpdateImageMetadata } from "./update-image-metadata";

export interface ToolContext {
  userId: string;
  tokenId: string;
  clientId: string;
}

export function registerTools(server: McpServer, context: ToolContext) {
  // Health
  registerPing(server, context);

  // Blog: read
  registerListBlogDrafts(server, context);
  registerGetBlogPost(server, context);
  registerSearchBlogPosts(server, context);

  // Blog: write
  registerCreateBlogDraft(server, context);
  registerUpdateBlogPost(server, context);
  registerPublishBlogPost(server, context);
  registerUnpublishBlogPost(server, context);

  // Tools: read
  registerGetTool(server, context);
  registerListTools(server, context);
  registerSearchTools(server, context);

  // Tools: write
  registerCreateTool(server, context);
  registerUpdateTool(server, context);
  registerPublishTool(server, context);
  registerUnpublishTool(server, context);

  // Cross-cutting
  registerFindImages(server, context);
  registerUpdateImageMetadata(server, context);
  registerListRecentChanges(server, context);
}
