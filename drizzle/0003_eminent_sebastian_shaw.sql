ALTER TABLE "tasks" ALTER COLUMN "type" SET DEFAULT 'theorie';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "estimated_effort" integer DEFAULT 1 NOT NULL;