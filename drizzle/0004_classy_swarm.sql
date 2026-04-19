CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"filename" text NOT NULL,
	"width" integer,
	"height" integer,
	"size_bytes" integer,
	"mime_type" text,
	"description" text,
	"material" text,
	"subjects" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"shot_type" text,
	"who" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"setting" text,
	"custom_tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"description_auto_generated" boolean DEFAULT false NOT NULL,
	"tags_auto_generated" boolean DEFAULT false NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uploaded_by_user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;