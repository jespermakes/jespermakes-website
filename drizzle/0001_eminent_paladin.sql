CREATE TABLE "box_joint_jig_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"unit" text,
	"thickness" real,
	"fingers" integer,
	"has_custom_title" boolean,
	"has_custom_label" boolean,
	"country" text,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "box_joint_jig_events" ADD CONSTRAINT "box_joint_jig_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;