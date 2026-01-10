CREATE INDEX "idx_tasks_course_id" ON "tasks" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_user_course" ON "tasks" USING btree ("user_id","course_id");