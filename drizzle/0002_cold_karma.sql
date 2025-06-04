ALTER TABLE "tasks" RENAME COLUMN "is_draft" TO "type";--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'draft';