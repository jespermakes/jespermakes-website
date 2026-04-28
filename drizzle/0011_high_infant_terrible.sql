CREATE TABLE "workbench_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_design_id" uuid,
	"author_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"data" jsonb NOT NULL,
	"thumbnail" text,
	"category" text DEFAULT 'general' NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"remix_count" integer DEFAULT 0 NOT NULL,
	"remix_of_id" uuid,
	"status" text DEFAULT 'published' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workbench_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"design_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workbench_designs" ADD CONSTRAINT "workbench_designs_source_design_id_studio_designs_id_fk" FOREIGN KEY ("source_design_id") REFERENCES "public"."studio_designs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workbench_designs" ADD CONSTRAINT "workbench_designs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workbench_likes" ADD CONSTRAINT "workbench_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workbench_likes" ADD CONSTRAINT "workbench_likes_design_id_workbench_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."workbench_designs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workbench_likes_user_design_idx" ON "workbench_likes" USING btree ("user_id","design_id");