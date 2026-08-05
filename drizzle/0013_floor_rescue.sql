CREATE TABLE "competition_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign" text DEFAULT 'rubio-floor-rescue-2026' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"country" text NOT NULL,
	"floor_story" text DEFAULT '' NOT NULL,
	"photo_url" text NOT NULL,
	"consent_share" boolean DEFAULT false NOT NULL,
	"newsletter_opt_in" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
