import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { withAuthSimple } from '@/lib/auth/api';
import { getCurrentSession, getNextSession, nextSession, prevSession } from '@/lib/session';
import { buildTerm } from '@/lib/term/util';
import { db } from '@/server/db';

// Returns and ensures previous, current and next sessions exist in terms table.
export const GET = withAuthSimple(async (_request, _user) => {
  const now = new Date();
  const year = now.getFullYear();

  // Determine current session (or next if between sessions)
  const currentSession = getCurrentSession() ?? getNextSession();

  // Build previous, current, next
  const prevInfo = prevSession(currentSession, year);
  const currentInfo = { session: currentSession, year };
  const nextInfo = nextSession(currentSession, year);

  const terms = [buildTerm(prevInfo), buildTerm(currentInfo), buildTerm(nextInfo)];

  // Upsert into DB
  // Validate IDs and only insert well-formed term ids (YYYY[1-3])
  const TERM_ID_RE = /\d{4}[1-3]$/;
  for (const t of terms) {
    if (!TERM_ID_RE.test(t.id)) {
      console.error(`Skipping malformed term ID: ${t.id}`);
      continue;
    }

    await db.execute(sql`
      INSERT INTO terms (id, label, created_at)
      VALUES (${t.id}, ${t.label}, NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  return NextResponse.json({ terms });
});
