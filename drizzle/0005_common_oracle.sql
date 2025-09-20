CREATE TABLE "terms" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_term_terms_id_fk" FOREIGN KEY ("term") REFERENCES "public"."terms"("id") ON DELETE restrict ON UPDATE no action;