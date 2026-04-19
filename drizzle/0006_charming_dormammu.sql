CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"author" text DEFAULT 'Jesper' NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"hero_image" text,
	"hero_image_id" uuid,
	"hero_image_alt" text,
	"featured_video" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tool_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"category_slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image" text,
	"image_id" uuid,
	"buy_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ambassador_badge" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tool_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_hero_image_id_images_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_items" ADD CONSTRAINT "tool_items_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;