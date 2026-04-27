import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Health
import { registerPing } from "./ping";

// Blog
import { registerListBlogDrafts } from "./list-blog-drafts";
import { registerGetBlogPost } from "./get-blog-post";
import { registerSearchBlogPosts } from "./search-blog-posts";
import { registerCreateBlogDraft } from "./create-blog-draft";
import { registerUpdateBlogPost } from "./update-blog-post";
import { registerPublishBlogPost } from "./publish-blog-post";
import { registerUnpublishBlogPost } from "./unpublish-blog-post";
import { registerSetBlogHeroImage } from "./set-blog-hero-image";

// Tools
import { registerGetTool } from "./get-tool";
import { registerListTools } from "./list-tools";
import { registerSearchTools } from "./search-tools";
import { registerCreateTool } from "./create-tool";
import { registerUpdateTool } from "./update-tool";
import { registerPublishTool } from "./publish-tool";
import { registerUnpublishTool } from "./unpublish-tool";

// Images
import { registerFindImages } from "./find-images";
import { registerUpdateImageMetadata } from "./update-image-metadata";

// Homepage
import { registerListHomepageSections } from "./list-homepage-sections";
import { registerUpdateHomepageSection } from "./update-homepage-section";
import { registerReorderHomepageSections } from "./reorder-homepage-sections";
import { registerToggleHomepageSection } from "./toggle-homepage-section";

// Commerce
import { registerGetOrderStats } from "./get-order-stats";
import { registerListRecentOrders } from "./list-recent-orders";

// Subscribers
import { registerGetSubscriberStats } from "./get-subscriber-stats";

// Cross-cutting
import { registerListRecentChanges } from "./list-recent-changes";

export interface ToolContext {
  userId: string;
  tokenId: string;
  clientId: string;
}

export function registerTools(server: McpServer, context: ToolContext) {
  // Health
  registerPing(server, context);

  // Blog
  registerListBlogDrafts(server, context);
  registerGetBlogPost(server, context);
  registerSearchBlogPosts(server, context);
  registerCreateBlogDraft(server, context);
  registerUpdateBlogPost(server, context);
  registerPublishBlogPost(server, context);
  registerUnpublishBlogPost(server, context);
  registerSetBlogHeroImage(server, context);

  // Tools
  registerGetTool(server, context);
  registerListTools(server, context);
  registerSearchTools(server, context);
  registerCreateTool(server, context);
  registerUpdateTool(server, context);
  registerPublishTool(server, context);
  registerUnpublishTool(server, context);

  // Images
  registerFindImages(server, context);
  registerUpdateImageMetadata(server, context);

  // Homepage
  registerListHomepageSections(server, context);
  registerUpdateHomepageSection(server, context);
  registerReorderHomepageSections(server, context);
  registerToggleHomepageSection(server, context);

  // Commerce
  registerGetOrderStats(server, context);
  registerListRecentOrders(server, context);

  // Subscribers
  registerGetSubscriberStats(server, context);

  // Cross-cutting
  registerListRecentChanges(server, context);
}
