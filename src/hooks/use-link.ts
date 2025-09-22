'use client';

import type { Link, LinkItem } from '@/types/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/utils/api/api-client-util';
import { buildPlanETSUrl } from '@/lib/utils/link-util';

const DEFAULT_IMAGES: Record<Link, string> = {
    PlanETS: '/assets/logo_planets.png',
    Moodle: '/assets/moodle.webp',
    NotebookLM: '/assets/notebooklm.png',
    Spotify: '/assets/spotify.png',
    Youtube: '/assets/youtube.svg',
    custom: '/assets/pochita.webp',
};

export function useLinks(courseId?: string) {
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = courseId ? `/api/links?courseId=${encodeURIComponent(courseId)}` : '/api/links';
            const res = await api.get<{ success: boolean; links: LinkItem[] }>(url, 'Failed to load links');
            const items = (res.links ?? []).map(l => ({
                ...l,
                imageUrl: l.imageUrl ?? DEFAULT_IMAGES[(l.type as Link) ?? 'custom'],
            }));
            setLinks(items);
        } catch (err) {
            setError((err as Error).message ?? 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const createLink = useCallback(async (data: { title: string; url: string; type?: Link; imageUrl?: string | null; courseId?: string | null }) => {
        setLoading(true);
        try {
            const payload = {
                title: data.title,
                url: data.url,
                type: data.type ?? 'custom',
                imageUrl: data.imageUrl ?? null,
                courseId: data.courseId ?? courseId ?? null,
            };
            const created = await api.post<{ success: boolean; link: LinkItem }>('/api/links', payload, 'Failed to create link');
            const item = {
                ...created.link,
                imageUrl: created.link.imageUrl ?? DEFAULT_IMAGES[(created.link.type as Link) ?? 'custom'],
            };
            setLinks(prev => [item, ...prev]);
            return item;
        } catch (err) {
            setError((err as Error).message ?? 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    const deleteLink = useCallback(async (id: string) => {
        setLoading(true);
        try {
            await api.delete(`/api/links/${encodeURIComponent(id)}`, 'Failed to delete link');
            setLinks(prev => prev.filter(l => l.id !== id));
            return true;
        } catch (err) {
            setError((err as Error).message ?? 'Unknown error');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        links,
        loading,
        error,
        fetchLinks,
        createLink,
        deleteLink,
    };
}

export async function createPlanETSLink(courseId: string, courseCode: string, term: string): Promise<void> {
    const planetsUrl = buildPlanETSUrl(courseCode, term);

    const payload = {
        title: 'PlanETS',
        url: planetsUrl,
        type: 'PlanETS',
        courseId,
    };

    await api.post('/api/links', payload, 'Failed to create PlanETS link');
}
