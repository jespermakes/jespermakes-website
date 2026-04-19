ALTER TABLE "images" ADD COLUMN "sponsors" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "tool_categories" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN "subjects";