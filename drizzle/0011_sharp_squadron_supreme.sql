CREATE INDEX IF NOT EXISTS "idx_subtasks_task_id" ON "subtasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_user_due_date" ON "tasks" USING btree ("user_id","due_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tasks_user_id" ON "tasks" USING btree ("user_id");
