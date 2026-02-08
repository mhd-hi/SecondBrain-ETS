CREATE TABLE IF NOT EXISTS "study_block_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_block_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"order" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"daypart" text NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "study_block_items" ADD CONSTRAINT "study_block_items_study_block_id_study_blocks_id_fk" FOREIGN KEY ("study_block_id") REFERENCES "public"."study_blocks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "study_block_items" ADD CONSTRAINT "study_block_items_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "study_blocks" ADD CONSTRAINT "study_blocks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_block_order" ON "study_block_items" USING btree ("study_block_id","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_block_items_block" ON "study_block_items" USING btree ("study_block_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_block_items_course" ON "study_block_items" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_study_blocks_user_daypart" ON "study_blocks" USING btree ("user_id","daypart","end_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_study_blocks_user_day" ON "study_blocks" USING btree ("user_id","start_at","end_at");
