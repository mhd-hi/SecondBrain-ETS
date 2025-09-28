CREATE INDEX "idx_links_user_course" ON "links" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "idx_links_user_id" ON "links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_links_course_id" ON "links" USING btree ("course_id");