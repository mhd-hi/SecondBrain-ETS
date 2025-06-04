'use client';

import Link from 'next/link';
import { useSecondBrainStore } from '@/store/useSecondBrainStore';

interface CourseSidebarProps {
  selectedCourseId: string;
}

export default function CourseSidebar({ selectedCourseId }: CourseSidebarProps) {
  const courses = useSecondBrainStore((state) => state.courses);
  const draftsByCourse = useSecondBrainStore((state) => state.draftsByCourse);

  return (
    <nav className="w-64 bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">My Courses</h2>
      <ul className="space-y-2">
        {courses.map((course) => {
          const pending = draftsByCourse[course.id]?.length ?? 0;
          const isSelected = course.id === selectedCourseId;

          return (
            <li key={course.id}>
              <Link
                href={`/review/${course.id}`}
                className={`flex justify-between items-center px-3 py-2 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="font-medium">{course.code}</span>
                {pending > 0 && (
                  <span className="text-sm font-medium text-red-600">
                    ({pending})
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 