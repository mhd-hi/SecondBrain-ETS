import type { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api';
import { db } from '@/server/db';
import { customLinks } from '@/server/db/schema';

export const DELETE = withAuth<{ customLinkId: string }>(async (req: NextRequest, { params, user }) => {
    try {
        const { customLinkId } = params as { customLinkId?: string };

        if (!customLinkId) {
            return NextResponse.json({ success: false, error: 'Missing customLinkId' }, { status: 400 });
        }

        // Only delete if customLink belongs to the user
        const res = await db.delete(customLinks).where(and(eq(customLinks.id, customLinkId), eq(customLinks.userId, user.id))).returning();

        if (!res.length) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        }

        // Note: cascade and ownership enforcement should be handled at DB or caller level
        return NextResponse.json({ success: true });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
});
