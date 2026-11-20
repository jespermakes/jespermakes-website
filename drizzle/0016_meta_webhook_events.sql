CREATE TABLE "meta_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"dedupe_key" text NOT NULL,
	"object" text NOT NULL,
	"entry_id" text,
	"field" text NOT NULL,
	"kind" text NOT NULL,
	"sender_id" text,
	"recipient_id" text,
	"mid" text,
	"event_time" timestamp with time zone,
	"payload" jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meta_webhook_events_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE INDEX "meta_webhook_events_received_idx" ON "meta_webhook_events" USING btree ("received_at");