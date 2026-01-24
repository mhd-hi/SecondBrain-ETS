'use client';

import type { CustomLink, CustomLinkItem } from '@/types/custom-link';

import { api } from '@/lib/utils/api/api-client-util';
import { buildPlanETSUrl, getDefaultImageFor } from '@/lib/utils/url-util';
import { LINK_TYPES } from '@/types/custom-link';

// Standalone function to create custom link without hook's data fetching
export async function createCustomLinkAPI(data: { title: string; url: string; type?: CustomLink; imageUrl?: string | null; courseId?: string | null }): Promise<CustomLinkItem> {
  const payload = {
    title: data.title,
    url: data.url,
    type: data.type ?? LINK_TYPES.CUSTOM,
    imageUrl: data.imageUrl ?? null,
    courseId: data.courseId ?? null,
  };
  const created = await api.post<{ success: boolean; customLink: CustomLinkItem }>('/api/custom-links', payload, 'Failed to create link');
  return {
    ...created.customLink,
    imageUrl: created.customLink.imageUrl ?? getDefaultImageFor(created.customLink.type ?? LINK_TYPES.CUSTOM),
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
