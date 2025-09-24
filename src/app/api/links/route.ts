import type { NextRequest } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { withAuth } from '@/lib/auth/api';
import { successResponse } from '@/lib/utils/api/api-server-util';
import { db } from '@/server/db';
import { links } from '@/server/db/schema';
import { LINK_TYPES } from '@/types/custom-link';

function validateAndNormalizeUrl(raw: unknown) {
    if (typeof raw !== 'string') {
        throw new TypeError('Invalid url');
    }

    const s = raw.trim();
    if (!s) {
        throw new TypeError('Empty url');
    }

    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*(?:\/.*)?$/i.test(s)) {
        throw new TypeError('Invalid url');
    }

    return s;
}

export const GET = withAuth(async (req: NextRequest, { user }) => {
    try {
        const url = new URL(req.url);
        const courseId = url.searchParams.get('courseId');

        let rows;
        if (courseId) {
            rows = await db.select().from(links).where(and(eq(links.courseId, courseId), eq(links.userId, user.id)));
        } else {
            // dashboard/global links belong to the user and have null courseId
            rows = await db.select().from(links).where(and(eq(links.userId, user.id), sql`${links.courseId} IS NULL`));
        }

        const response = successResponse({ success: true, links: rows });

        return response;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
});

// POST: create a new link for the authenticated user
export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const body = await req.json();
        const { title, url, type = LINK_TYPES.CUSTOM, imageUrl, courseId } = body ?? {};

        if (!title || !url) {
            return NextResponse.json({ success: false, error: 'Missing title or url' }, { status: 400 });
        }

        let normalizedUrl: string;
        try {
            normalizedUrl = validateAndNormalizeUrl(url);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Invalid url';
            return NextResponse.json({ success: false, error: msg }, { status: 400 });
        }

        const inserted = await db.insert(links).values({
            title,
            url: normalizedUrl,
            type,
            imageUrl: imageUrl ?? null,
            userId: user.id,
            courseId: courseId ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return successResponse({ success: true, link: inserted[0] });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
});
