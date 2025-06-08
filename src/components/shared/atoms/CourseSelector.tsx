"use client";

import { useRouter } from "next/navigation";
import type { Course } from "@/types/course";
import { TaskStatus } from "@/types/task";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface CourseSelectorProps {
  courses: Course[];
  selectedCourse?: Course;
  onCourseSelect?: (courseId: string) => void;
  className?: string;
  buttonClassName?: string;
  dropdownWidth?: string;
}

export function CourseSelector({
  courses,
  selectedCourse,
  onCourseSelect,
  className = "",
  buttonClassName = "",
  dropdownWidth = "300px",
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
            {selectedCourse?.code ?? "Select Course"}
            <ChevronDown className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={`w-[${dropdownWidth}]`}>
          {courses.map((course) => {
            const draftTasks = course.tasks?.filter(task => task.status === TaskStatus.DRAFT).length ?? 0;
            return (
              <DropdownMenuItem
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className="flex items-center justify-between py-3"
              >
                <span className="text-lg font-medium">{course.code}</span>
                {draftTasks > 0 && (
                  <span className="text-sm text-destructive">
                    {draftTasks} draft
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 