'use client';

import type { Course } from '@/types/course';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CourseSelectorProps = {
  courses: Course[];
  selectedCourse?: Course;
  onCourseSelect?: (courseId: string) => void;
  className?: string;
  buttonClassName?: string;
  dropdownWidth?: string;
};

export function CourseSelector({
  courses,
  selectedCourse,
  onCourseSelect,
  className = '',
  buttonClassName = '',
  dropdownWidth = '300px',
}: CourseSelectorProps) {
  const router = useRouter();

  const handleCourseSelect = (courseId: string) => {
    if (onCourseSelect) {
      onCourseSelect(courseId);
    } else {
      router.push(`/courses/${courseId}`);
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`h-12 text-lg font-bold justify-between ${buttonClassName}`}
          >
            {selectedCourse?.code ?? 'Select Course'}
            <ChevronDown className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={`w-[${dropdownWidth}]`}>
          {courses.map((course) => {
            return (
              <DropdownMenuItem
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className="flex items-center justify-between py-3"
              >
                <span className="text-lg font-medium">{course.code}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
