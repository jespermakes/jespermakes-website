ALTER TABLE "blog_posts" ALTER COLUMN "tags" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "tags" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "published_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tool_items" ALTER COLUMN "category" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "tool_items" ALTER COLUMN "category_slug" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "tool_items" ALTER COLUMN "buy_links" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "tool_items" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "tool_items" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tool_items" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "tool_items" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "category_icon" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "long_description" text;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "youtube_videos" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "color_grid" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "product_list" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "gallery" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "use_cases" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "specs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "jesper_note" text;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "learn_more_url" text;--> statement-breakpoint
ALTER TABLE "tool_items" ADD COLUMN "extra" jsonb DEFAULT '{}'::jsonb NOT NULL;