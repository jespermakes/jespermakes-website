import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  integer,
  serial,
  real,
  date,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  provider: text("provider").default("credentials"),
  stripeCustomerId: text("stripe_customer_id"),
  newsletterSubscribed: boolean("newsletter_subscribed").default(false),
  guildTier: text("guild_tier").default("free"),
  guildJoinedAt: timestamp("guild_joined_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").unique().notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  productName: text("product_name"),
  amount: integer("amount"),
  currency: text("currency").default("eur"),
  stripeSessionId: text("stripe_session_id"),
  stripeCustomerId: text("stripe_customer_id"),
  purchasedAt: timestamp("purchased_at", { mode: "date" }).defaultNow().notNull(),
});

export const downloads = pgTable("downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  purchaseId: uuid("purchase_id").references(() => purchases.id),
  productSku: text("product_sku").notNull(),
  downloadedAt: timestamp("downloaded_at", { mode: "date" }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const titleLabEvents = pgTable("title_lab_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  inputTitle: text("input_title"),
  inputUrl: text("input_url"),
  inputDescription: text("input_description"),
  inputPromise: text("input_promise"),
  inputStory: text("input_story"),
  inputHook: text("input_hook"),
  aiResponse: jsonb("ai_response"),
  sessionId: text("session_id"),
  userAgent: text("user_agent"),
  country: text("country"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const titleLabSessions = pgTable("title_lab_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  sessionType: text("session_type").notNull(),
  inputUrl: text("input_url"),
  inputVideoTitle: text("input_video_title"),
  inputVideoThumbnail: text("input_video_thumbnail"),
  inputVideoViews: integer("input_video_views"),
  inputVideoChannel: text("input_video_channel"),
  inputDescription: text("input_description"),
  inputPromise: text("input_promise"),
  inputStory: text("input_story"),
  inputHook: text("input_hook"),
  aiResults: jsonb("ai_results").notNull(),
  userNotes: text("user_notes"),
  chosenTitle: text("chosen_title"),
  status: text("status").default("saved"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const boxJointJigEvents = pgTable("box_joint_jig_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  unit: text("unit"),
  thickness: real("thickness"),
  fingers: integer("fingers"),
  hasCustomTitle: boolean("has_custom_title"),
  hasCustomLabel: boolean("has_custom_label"),
  country: text("country"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const coneLampEvents = pgTable("cone_lamp_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  thickness: real("thickness"),
  country: text("country"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const rubioGuideEvents = pgTable("rubio_guide_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  product: text("product"),
  species: text("species"),
  colorId: text("color_id"),
  colorLabel: text("color_label"),
  surfaceArea: real("surface_area"),
  unit: text("unit"),
  country: text("country"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),

  source: text("source").notNull(),
  url: text("url").notNull(),
  pathname: text("pathname").notNull(),
  filename: text("filename").notNull(),

  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  mimeType: text("mime_type"),

  description: text("description"),
  material: text("material"),
  sponsors: text("sponsors").array().notNull().default(sql`ARRAY[]::text[]`),
  toolCategories: text("tool_categories").array().notNull().default(sql`ARRAY[]::text[]`),
  shotType: text("shot_type"),
  who: text("who").array().notNull().default(sql`ARRAY[]::text[]`),
  setting: text("setting"),
  customTags: text("custom_tags").array().notNull().default(sql`ARRAY[]::text[]`),

  descriptionAutoGenerated: boolean("description_auto_generated").notNull().default(false),
  tagsAutoGenerated: boolean("tags_auto_generated").notNull().default(false),
  reviewed: boolean("reviewed").notNull().default(false),

  hidden: boolean("hidden").notNull().default(false),

  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, { onDelete: "set null" }),
});

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  content: text("content").notNull().default(""),
  author: text("author").notNull().default("Jesper"),
  tags: jsonb("tags").notNull().default([]),
  heroImage: text("hero_image"),
  heroImageId: uuid("hero_image_id").references(() => images.id, { onDelete: "set null" }),
  heroImageAlt: text("hero_image_alt"),
  featuredVideo: text("featured_video"),
  status: text("status").notNull().default("draft"),
  hidden: boolean("hidden").notNull().default(false),
  publishedAt: timestamp("published_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const toolItems = pgTable("tool_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull().default(""),
  categorySlug: text("category_slug").notNull().default(""),
  categoryIcon: text("category_icon").notNull().default(""),
  description: text("description").notNull().default(""),
  longDescription: text("long_description"),
  image: text("image"),
  imageId: uuid("image_id").references(() => images.id, { onDelete: "set null" }),
  buyLinks: jsonb("buy_links").notNull().default(sql`'[]'::jsonb`),
  ambassadorBadge: boolean("ambassador_badge").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  youtubeVideos: jsonb("youtube_videos").notNull().default(sql`'[]'::jsonb`),
  colorGrid: jsonb("color_grid").notNull().default(sql`'[]'::jsonb`),
  productList: jsonb("product_list").notNull().default(sql`'[]'::jsonb`),
  gallery: jsonb("gallery").notNull().default(sql`'[]'::jsonb`),
  useCases: jsonb("use_cases").notNull().default(sql`'[]'::jsonb`),
  specs: jsonb("specs").notNull().default(sql`'[]'::jsonb`),
  jesperNote: text("jesper_note"),
  learnMoreUrl: text("learn_more_url"),
  extra: jsonb("extra").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  resendContactId: text("resend_contact_id"),
  subscribed: boolean("subscribed").notNull().default(true),
  source: text("source").notNull().default("public_form"),
  subscribedAt: timestamp("subscribed_at", { withTimezone: false }).notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: false }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: false }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type ToolItem = typeof toolItems.$inferSelect;
export type NewToolItem = typeof toolItems.$inferInsert;

export type BuyLink = {
  label: string;
  url: string;
  region?: "us" | "eu" | "global";
  badge?: string;
};

export type ColorSwatch = {
  name: string;
  hex: string;
  collection?: string;
};

export type Spec = {
  label: string;
  value: string;
};

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),  // 'longform' | 'shorts'
  title: text("title").notNull(),
  stage: text("stage").notNull(),
  sponsor: text("sponsor"),
  targetPublishDate: date("target_publish_date"),
  publishedAt: timestamp("published_at", { withTimezone: false }),
  youtubeId: text("youtube_id"),
  scriptNotes: text("script_notes"),
  sponsorContact: text("sponsor_contact"),
  notes: text("notes"),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
}, (table) => ({
  kindStageIdx: index("videos_kind_stage_idx").on(table.kind, table.stage),
  updatedAtIdx: index("videos_updated_at_idx").on(table.updatedAt),
}));

export const videoTasks = pgTable("video_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  assignee: text("assignee"),  // 'jesper' | 'bearatski' | NULL
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: false }),
  updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
}, (table) => ({
  videoIdIdx: index("video_tasks_video_id_idx").on(table.videoId),
}));

export const videoTools = pgTable("video_tools", {
  videoId: uuid("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  toolId: uuid("tool_id").notNull().references(() => toolItems.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.videoId, table.toolId] }),
}));

export type Video = typeof videos.$inferSelect;
export type VideoTask = typeof videoTasks.$inferSelect;

export const pageSections = pgTable("page_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageSlug: text("page_slug").notNull().default("home"),
  position: integer("position").notNull().default(0),
  kind: text("kind").notNull(),
  visible: boolean("visible").notNull().default(true),
  hidden: boolean("hidden").notNull().default(false),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// MCP (Model Context Protocol) - OAuth 2.1 server + activity logging
// ============================================================================

export const mcpOauthClients = pgTable("mcp_oauth_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: text("client_id").notNull().unique(),
  clientName: text("client_name").notNull(),
  redirectUris: jsonb("redirect_uris").notNull().$type<string[]>(),
  grantTypes: jsonb("grant_types").notNull().$type<string[]>().default(["authorization_code", "refresh_token"]),
  tokenEndpointAuthMethod: text("token_endpoint_auth_method").notNull().default("none"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  revoked: boolean("revoked").notNull().default(false),
});

export const mcpAuthorizationCodes = pgTable("mcp_authorization_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  clientId: text("client_id").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  redirectUri: text("redirect_uri").notNull(),
  codeChallenge: text("code_challenge").notNull(),
  codeChallengeMethod: text("code_challenge_method").notNull().default("S256"),
  scope: text("scope").notNull().default("mcp"),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const mcpTokens = pgTable("mcp_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  tokenType: text("token_type").notNull(),
  clientId: text("client_id").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scope: text("scope").notNull().default("mcp"),
  parentTokenId: uuid("parent_token_id"),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  verboseLogging: boolean("verbose_logging").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const mcpActivity = pgTable("mcp_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenId: uuid("token_id").references(() => mcpTokens.id, { onDelete: "set null" }),
  clientId: text("client_id"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  method: text("method"),
  toolName: text("tool_name"),
  durationMs: integer("duration_ms"),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  requestBody: jsonb("request_body"),
  responseBody: jsonb("response_body"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
