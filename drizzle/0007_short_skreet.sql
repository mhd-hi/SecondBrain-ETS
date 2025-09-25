ALTER TABLE "links" RENAME TO "custom_links";--> statement-breakpoint
ALTER TABLE "custom_links" DROP CONSTRAINT "links_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "custom_links" DROP CONSTRAINT "links_course_id_courses_id_fk";
--> statement-breakpoint
DROP INDEX "idx_links_user_course";--> statement-breakpoint
DROP INDEX "idx_links_user_id";--> statement-breakpoint
DROP INDEX "idx_links_course_id";--> statement-breakpoint
ALTER TABLE "custom_links" ADD CONSTRAINT "custom_links_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_links" ADD CONSTRAINT "custom_links_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_custom_links_user_course" ON "custom_links" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_custom_links_user_id" ON "custom_links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_custom_links_course_id" ON "custom_links" USING btree ("course_id");