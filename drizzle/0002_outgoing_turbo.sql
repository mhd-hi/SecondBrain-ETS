CREATE TABLE "pomodoro_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"day" date NOT NULL,
	"total_minutes" integer DEFAULT 0 NOT NULL,
	"task_ids" uuid[] DEFAULT ARRAY[]::uuid[] NOT NULL
);
ALTER TABLE "pomodoro_daily" ADD CONSTRAINT "pomodoro_daily_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "pomodoro_daily_user_day_uq" ON "pomodoro_daily" USING btree ("user_id","day");


-- Ensure no tasks remain in DRAFT state after this migration
UPDATE tasks SET status = 'TODO' WHERE status = 'DRAFT';



-- Migrate subtasks from JSON column to new table
-- Ensure UUID generator exists (pgcrypto). Requires superuser or extension privilege.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Copy JSON subtasks into rows. Uses jsonb casts and is idempotent (skips existing ids).
INSERT INTO subtasks (id, task_id, type, title, notes, status, estimated_effort, created_at, updated_at, due_date)
SELECT
  (CASE WHEN (sub->>'id') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
        THEN (sub->>'id')::uuid
        ELSE gen_random_uuid()
   END) AS id,
  t.id AS task_id,
  COALESCE(sub->>'type', 'theorie') AS type,
  COALESCE(sub->>'title', '') AS title,
  sub->>'notes' AS notes,
  COALESCE(sub->>'status', 'TODO') AS status,
  COALESCE((sub->>'estimatedEffort')::real, 0) AS estimated_effort,
  NOW() AS created_at,
  NOW() AS updated_at,
  NULL::timestamp AS due_date
FROM tasks t,
     LATERAL jsonb_array_elements(t.subtasks::jsonb) sub
WHERE t.subtasks IS NOT NULL AND t.subtasks::jsonb <> '[]'::jsonb
ON CONFLICT (id) DO NOTHING;