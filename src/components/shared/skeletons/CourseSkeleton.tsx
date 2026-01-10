import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseSkeleton() {
  return (
    <>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24" />
          </div>
          <div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

      <div className="space-y-8">
        {/* Course custom links skeleton */}
        <section>
          <div className="rounded-lg flex flex-col">
            <div className="flex-1">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course progress skeleton */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Search and add task skeleton */}
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Weekly tasks skeleton */}
        <div className="space-y-8">
          {[1, 3, 5, 6].map(week => (
            <div key={week} className="space-y-4">
              {/* Week title skeleton */}
              <Skeleton className="h-7 w-20" />
              <div className="space-y-3">
                {/* Task skeleton for each week */}
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
          ))}
        </div>
      </div>
    </>
  );
}
