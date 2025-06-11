'use client';

import { Skeleton } from '@/components/ui/skeleton';

type CourseListSkeletonProps = {
  count?: number;
};

export function CourseListSkeleton({ count = 4 }: CourseListSkeletonProps) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key -- Using index for static skeleton items is acceptable
        <div key={`course-skeleton-${index}`} className="block px-3 py-2 rounded-md border-b border-border">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
