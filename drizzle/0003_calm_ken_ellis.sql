CREATE TABLE "rubio_guide_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"product" text,
	"species" text,
	"color_id" text,
	"color_label" text,
	"surface_area" real,
	"unit" text,
	"country" text,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rubio_guide_events" ADD CONSTRAINT "rubio_guide_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;