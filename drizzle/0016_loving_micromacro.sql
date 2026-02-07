CREATE INDEX "idx_courses_term" ON "courses" USING btree ("term");--> statement-breakpoint
CREATE INDEX "idx_subtasks_status" ON "subtasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");