'use client';

import type { Course } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { getCourseColor } from '@/lib/utils';

type CourseCodeBadgeProps = {
  course: Course;
  onClick?: () => void;
  className?: string;
};

export function CourseCodeBadge({ course, onClick, className }: CourseCodeBadgeProps) {
  const courseColor = getCourseColor(course);

  return (
    <Badge
      variant="outline"
      className={`text-xs cursor-pointer hover:bg-muted/80 transition-colors ${className || ''}`}
      style={{
        borderColor: courseColor,
        color: courseColor,
        backgroundColor: courseColor ? `${courseColor}15` : undefined,
      }}
      onClick={onClick}
    >
      {course.code}
    </Badge>
  );
}
