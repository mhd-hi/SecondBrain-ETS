'use client';

import type { CustomLink, CustomLinkItem } from '@/types/custom-link';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/utils/api/api-client-util';
import { buildPlanETSUrl, getDefaultImageFor } from '@/lib/utils/url-util';
import { LINK_TYPES } from '@/types/custom-link';

export function useCustomLink(courseId?: string) {
    const [customLinks, setCustomLinks] = useState<CustomLinkItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomLinks = useCallback(async () => {
        // Don't fetch if courseId is explicitly undefined (component doesn't want to fetch)
        if (courseId === undefined) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const url = courseId ? `/api/custom-links?courseId=${encodeURIComponent(courseId)}` : '/api/custom-links';
            const res = await api.get<{ success: boolean; customLinks: CustomLinkItem[] }>(url, 'Failed to load custom links');
            const items = (res.customLinks ?? []).map(l => ({
                ...l,
                imageUrl: l.imageUrl ?? getDefaultImageFor(l.type ?? LINK_TYPES.CUSTOM),
            }));
            setCustomLinks(items);
        } catch (err) {
            setError((err as Error).message ?? 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        void fetchCustomLinks();
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
            const created = await api.post<{ success: boolean; customLink: CustomLinkItem }>('/api/custom-links', payload, 'Failed to create link');
            const item = {
                ...created.customLink,
                imageUrl: created.customLink.imageUrl ?? getDefaultImageFor(created.customLink.type ?? LINK_TYPES.CUSTOM),
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
            await api.delete(`/api/custom-links/${encodeURIComponent(id)}`, 'Failed to delete link');
            setCustomLinks(prev => prev.filter(l => l.id !== id));
            return true;
        } catch (err) {
            setError((err as Error).message ?? 'Unknown error');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAllCourseLinks = useCallback(async (courseId: string) => {
        setLoading(true);
        try {
            const result = await api.delete<{ success: boolean; deletedCount: number; message: string }>(
                `/api/custom-links?courseId=${encodeURIComponent(courseId)}`,
                'Failed to delete all course links',
            );
            setCustomLinks(prev => prev.filter(l => l.courseId !== courseId));
            return result;
        } catch (err) {
            setError((err as Error).message ?? 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        customLinks,
        loading,
        error,
        fetchCustomLinks,
        createCustomLink,
        deleteCustomLink,
        deleteAllCourseLinks,
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

    await api.post('/api/custom-links', payload, 'Failed to create PlanETS link');
}

export const deleteAllCourseLinks = async (courseId: string) => {
    const result = await api.delete<{ success: boolean; deletedCount: number; message: string }>(
        `/api/custom-links?courseId=${encodeURIComponent(courseId)}`,
        'Failed to delete all course links',
    );
    return result;
};
