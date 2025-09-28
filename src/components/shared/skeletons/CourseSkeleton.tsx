import { Skeleton } from '@/components/ui/skeleton';

export function CourseSkeleton() {
  return (
    <>
      {/* Course header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
        </div>
        <div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Course custom links skeleton */}
      <section className="mb-6">
        <div className="rounded-lg flex flex-col">
          <div className="flex-1">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="flex flex-wrap gap-4">
                    <Skeleton key={1} className="w-8 h-8 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and add task skeleton */}
      <div className="flex items-center gap-4 mb-10">
        <Skeleton className="flex-1 h-10" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Weekly tasks skeleton */}
      <div className="space-y-5">

        {[1, 3, 5, 6].map(week => (
          <div key={week} className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              {/* Week title skeleton */}
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-2">
              {/* Task skeleton for each week */}
              <div className="space-y-3">
                {/* Main task skeleton */}
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Task title */}
                      <Skeleton className="h-5 w-3/4" />
                      {/* Task description */}
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Status badge */}
                      <Skeleton className="h-6 w-16" />
                      {/* Action button */}
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {/* Subtasks count */}
                    <Skeleton className="h-4 w-24" />
                    {/* Due date */}
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
