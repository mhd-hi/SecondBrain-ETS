import type { CustomLinkItem } from '@/types/custom-link';
import { useShallow } from 'zustand/react/shallow';
import { useCustomLinkStore } from '@/lib/stores/custom-link-store';

/**
 * Hook to get custom links for a specific course with automatic reactivity
 * Uses Zustand's shallow comparison to prevent infinite loops from array reference changes
 */
export function useCourseCustomLinksStore(courseId: string): CustomLinkItem[] {
  return useCustomLinkStore(
    useShallow(state => state.getCustomLinksByCourse(courseId)),
  );
}
