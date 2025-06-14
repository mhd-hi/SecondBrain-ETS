'use client';

import type { CourseListItem } from '@/types/course';
import { NotebookText, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AddCourseDialog } from '@/components/shared/dialogs/AddCourseDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { CourseListSkeleton } from '@/components/ui/course-list-skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type SidebarContentProps = {
  courses: CourseListItem[];
  isLoading?: boolean;
  onCourseAdded?: () => void;
};

export function SidebarContent({ courses, isLoading = false, onCourseAdded }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Courses</h2>
        <AddCourseDialog
          onCourseAdded={onCourseAdded}
          trigger={(
            <Button size="sm" variant="outline">
              <NotebookText className="h-3 w-3 mr-1" />
              <Plus className="h-4 w-4" />
            </Button>
          )}
        />
      </div>
      <Separator className="my-4" />
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-1">
          {isLoading
            ? (
              <CourseListSkeleton count={3} />
            )
            : courses.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No courses yet</p>
                  <p className="text-xs mt-1">Add your first course to get started!</p>
                </div>
              )
              : (
                courses.map((course) => {
                  const isActive = pathname === `/courses/${course.id}`;
                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className={`block px-3 py-2 text-sm rounded-md ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      } border-b border-border`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="py-0.5">{course.code}</span>
                        <div className="flex items-center">
                          {course.draftCount > 0 && (
                            <StatusBadge
                              content={course.draftCount}
                              variant="red"
                              tooltipText={`${course.draftCount} drafts`}
                              className="mr-1"
                            />
                          )}
                          {course.overdueCount > 0 && (
                            <StatusBadge
                              content={course.overdueCount}
                              variant="yellow"
                              tooltipText={`${course.overdueCount} overdue tasks`}
                            />
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
        </div>
      </ScrollArea>
    </div>
  );
}
