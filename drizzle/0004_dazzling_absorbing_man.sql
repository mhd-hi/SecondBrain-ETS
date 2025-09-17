CREATE TABLE "links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'custom' NOT NULL,
	"image_url" text,
	"user_id" text,
	"course_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "openai_cache" RENAME TO "courses_cache";--> statement-breakpoint
ALTER TABLE "courses_cache" RENAME COLUMN "parsed_openai_content" TO "parsed_content";--> statement-breakpoint
ALTER TABLE "courses_cache" DROP CONSTRAINT "openai_cache_course_code_unique";--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses_cache" ADD CONSTRAINT "courses_cache_course_code_unique" UNIQUE("course_code");