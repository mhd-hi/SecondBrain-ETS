/* eslint-disable react/no-array-index-key */
'use client';

import { Skeleton } from '@/components/ui/skeleton';

type LoadingSkeletonProps = {
  type?: 'card' | 'list';
  count?: number;
  className?: string;
};

export function LoadingSkeleton({
  type = 'card',
  count = 3,
  className = '',
}: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        { }
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={`card-skeleton-${i}`} className={`h-32 ${className}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-muted-foreground mb-4">
        Loading...
      </div>
      <div className="grid gap-4">
        { }
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={`list-skeleton-${i}`} className={`h-24 ${className}`} />
        ))}
      </div>
    </div>
  );
}
