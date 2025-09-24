'use client';

import type { CustomLink, CustomLinkItem } from '@/types/custom-link';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/utils/api/api-client-util';
import { buildPlanETSUrl, DEFAULT_IMAGES } from '@/lib/utils/url-util';
import { LINK_TYPES } from '@/types/custom-link';

export function useCustomLink(courseId?: string) {
    const [links, setCustomLinks] = useState<CustomLinkItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomLinks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = courseId ? `/api/links?courseId=${encodeURIComponent(courseId)}` : '/api/links';
            const res = await api.get<{ success: boolean; links: CustomLinkItem[] }>(url, 'Failed to load links');
            const items = (res.links ?? []).map(l => ({
                ...l,
                imageUrl: l.imageUrl ?? DEFAULT_IMAGES[(l.type as CustomLink) ?? LINK_TYPES.CUSTOM],
            }));
            setCustomLinks(items);
        } catch (err) {
            setError((err as Error).message ?? 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCustomLinks();
    }, [fetchCustomLinks]);

    const createCustomLink = useCallback(async (data: { title: string; url: string; type?: CustomLink; imageUrl?: string | null; courseId?: string | null }) => {
        setLoading(true);
        try {
            const payload = {
                title: data.title,
                url: data.url,
                type: data.type ?? LINK_TYPES.CUSTOM,
                imageUrl: data.imageUrl ?? null,
                courseId: data.courseId ?? courseId ?? null,
            };
            const created = await api.post<{ success: boolean; link: CustomLinkItem }>('/api/links', payload, 'Failed to create link');
            const item = {
                ...created.link,
                imageUrl: created.link.imageUrl ?? DEFAULT_IMAGES[(created.link.type as CustomLink) ?? LINK_TYPES.CUSTOM],
            };
            setCustomLinks(prev => [item, ...prev]);
            return item;
        } catch (err) {
            setError((err as Error).message ?? 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    const deleteCustomLink = useCallback(async (id: string) => {
        setLoading(true);
        try {
            await api.delete(`/api/links/${encodeURIComponent(id)}`, 'Failed to delete link');
            setCustomLinks(prev => prev.filter(l => l.id !== id));
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
        fetchCustomLinks,
        createCustomLink,
        deleteCustomLink,
    };
}

export async function createPlanETSLink(courseId: string, courseCode: string, term: string): Promise<void> {
    const planetsUrl = buildPlanETSUrl(courseCode, term);

    const payload = {
        title: LINK_TYPES.PLANETS,
        url: planetsUrl,
        type: LINK_TYPES.PLANETS,
        courseId,
    };

    await api.post('/api/links', payload, 'Failed to create PlanETS link');
}
