-- create terms table if missing
CREATE TABLE IF NOT EXISTS "terms" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- populate terms from existing courses (idempotent)
INSERT INTO "terms" (id, label, created_at)
SELECT DISTINCT c.term AS id,
       c.term AS label,
       now() AS created_at
FROM "courses" c
WHERE c.term IS NOT NULL
  AND c.term <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.terms t WHERE t.id = c.term
  );

-- add FK constraint only if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'courses_term_terms_id_fk'
      AND conrelid = 'public.courses'::regclass
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_term_terms_id_fk
      FOREIGN KEY (term)
      REFERENCES public.terms(id)
      ON DELETE RESTRICT
      ON UPDATE NO ACTION;
  END IF;
END
$$;

ALTER TABLE "courses" ADD CONSTRAINT "courses_term_terms_id_fk" FOREIGN KEY ("term") REFERENCES "public"."terms"("id") ON DELETE restrict ON UPDATE no action;
