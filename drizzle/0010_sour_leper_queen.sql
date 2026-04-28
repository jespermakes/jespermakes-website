CREATE TABLE "studio_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text DEFAULT 'Untitled' NOT NULL,
	"description" text DEFAULT '',
	"data" jsonb NOT NULL,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio_designs" ADD CONSTRAINT "studio_designs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;