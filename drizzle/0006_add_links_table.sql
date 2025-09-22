-- DO NOT USE THIS ONE, generate the sql migration using Drizzle CLI instead.


-- Migration: 0006_add_links_table.sql
-- Creates link_type enum and links table if they do not already exist.

DO $$
BEGIN
  -- create enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'link_type') THEN
    CREATE TYPE link_type AS ENUM ('PlanETS', 'Moodle', 'NotebookLM', 'Spotify', 'Youtube', 'custom');
  END IF;
END$$;

-- Create links table if not exists. If the project already has a links table, this will do nothing.
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  title text NOT NULL,
  type link_type NOT NULL DEFAULT 'custom',
  image_url text,
  user_id text REFERENCES "user"(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Ensure created_at/updated_at columns exist and have defaults (idempotent)
ALTER TABLE links
  ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE links
  ALTER COLUMN updated_at SET DEFAULT NOW();
