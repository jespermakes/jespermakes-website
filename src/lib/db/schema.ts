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
