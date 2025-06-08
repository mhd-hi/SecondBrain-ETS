"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, Plus, NotebookText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AddCourseDialog } from "@/components/shared/dialogs/AddCourseDialog";

interface Course {
  id: string;
  code: string;
  name: string;
  inProgressCount: number;
}

interface SidebarProps {
  courses: Course[];
  onCourseAdded?: () => void;
}

export function Sidebar({ courses, onCourseAdded }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Courses</h2>
              <AddCourseDialog
                onCourseAdded={onCourseAdded}
                trigger={
                  <Button size="sm" variant="outline">
                    <NotebookText className="h-3 w-3 mr-1" />
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
            <Separator className="my-4" />
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-1">
                {courses.map((course) => {
                  const isActive = pathname === `/courses/${course.id}`;
                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className={`block px-3 py-2 text-sm rounded-md ${isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                        } border-b border-border`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="py-0.5">
                          {course.code} - {course.name}
                        </span>
                        {course.inProgressCount > 0 && (
                          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground inline-flex items-center justify-center mt-[-1px]">
                            {course.inProgressCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-[300px] flex-col border-r border-border bg-background">        <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <AddCourseDialog
            onCourseAdded={onCourseAdded}
            trigger={
              <Button size="sm" variant="outline">
                <NotebookText className="h-3 w-3 mr-1" />
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
        </div>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1">
            {courses.map((course) => {
              const isActive = pathname === `/courses/${course.id}`;
              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className={`block px-3 py-2 text-sm rounded-md ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                    } border-b border-border`}
                >
                  <div className="flex items-center justify-between">
                    <span className="py-0.5">
                      {course.code} - {course.name}
                    </span>
                    {course.inProgressCount > 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground inline-flex items-center justify-center mt-[-1px]">
                        {course.inProgressCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>
      </div>
    </>
  );
} 