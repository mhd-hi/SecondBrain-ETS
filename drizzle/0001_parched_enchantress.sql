ALTER TABLE "review_queue" DROP CONSTRAINT "review_queue_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;