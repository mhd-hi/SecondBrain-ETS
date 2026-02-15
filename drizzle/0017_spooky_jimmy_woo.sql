CREATE UNIQUE INDEX "uq_courses_user_code_term" ON "courses" USING btree ("user_id","code","term");--> statement-breakpoint
ALTER TABLE "custom_links" DROP COLUMN "image_url";
