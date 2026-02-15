'use client';

import type { CustomLink, CustomLinkItem } from '@/types/custom-link';

import { useCustomLinkStore } from '@/lib/stores/custom-link-store';
import { api } from '@/lib/utils/api/api-client-util';
import { API_ENDPOINTS } from '@/lib/utils/api/endpoints';
import { buildPlanETSUrl } from '@/lib/utils/url-util';
import { LINK_TYPES } from '@/types/custom-link';

// Standalone function to create custom link without hook's data fetching
export async function createCustomLinkAPI(data: { title: string; url: string; type?: CustomLink; courseId?: string | null }): Promise<CustomLinkItem> {
  return useCustomLinkStore.getState().createCustomLink(data);
}

export async function createPlanETSLink(courseId: string, courseCode: string, term: string): Promise<void> {
  const planetsUrl = buildPlanETSUrl(courseCode, term);

  await createCustomLinkAPI({
    title: LINK_TYPES.PLANETS,
    url: planetsUrl,
    type: LINK_TYPES.PLANETS,
    courseId,
  });
}

export const deleteAllCourseLinks = async (courseId: string) => {
  const result = await api.delete<{ success: boolean; deletedCount: number; message: string }>(
    API_ENDPOINTS.CUSTOM_LINKS.BY_COURSE(courseId),
    'Failed to delete all course links',
  );

  // Clear from store
  if (result.success) {
    const store = useCustomLinkStore.getState();
    const linksToDelete = store.getCustomLinksByCourse(courseId);
    linksToDelete.forEach(link => store.removeLocalCustomLink(link.id));
  }

  return result;
};
