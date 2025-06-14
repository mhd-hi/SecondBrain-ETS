'use client';

import type { CourseListItem } from '@/types/course';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './sidebar-content';

type SidebarProps = {
  courses: CourseListItem[];
  isLoading?: boolean;
  onCourseAdded?: () => void;
};

export function Sidebar({ courses, isLoading = false, onCourseAdded }: SidebarProps) {
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent courses={courses} isLoading={isLoading} onCourseAdded={onCourseAdded} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-[300px] flex-col border-r border-border bg-background  fixed h-full">
        <SidebarContent courses={courses} isLoading={isLoading} onCourseAdded={onCourseAdded} />
      </div>
    </>
  );
}
