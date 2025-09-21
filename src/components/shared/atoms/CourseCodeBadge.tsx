'use client';

import type { Course } from '@/types/course';
import { Badge } from '@/components/ui/badge';

type CourseCodeBadgeProps = {
  course: Course;
  onClick?: () => void;
  className?: string;
};

export function CourseCodeBadge({ course, onClick, className }: CourseCodeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`text-xs cursor-pointer hover:bg-muted/80 transition-colors ${className || ''}`}
      style={{
        borderColor: course.color,
        color: course.color,
        backgroundColor: course.color ? `${course.color}15` : undefined,
      }}
      onClick={onClick}
    >
      {course.code}
    </Badge>
  );
}
