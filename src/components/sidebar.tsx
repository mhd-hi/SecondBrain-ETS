"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Course {
  id: string;
  code: string;
  name: string;
  inProgressCount: number;
}

interface SidebarProps {
  courses: Course[];
}

export function Sidebar({ courses }: SidebarProps) {
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
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <div className="px-4 py-6">
            <h2 className="text-lg font-semibold">My Courses</h2>
            <Separator className="my-4" />
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-1">
                {courses.map((course, index) => {
                  const isActive = pathname === `/courses/${course.id}`;
                  const isLast = index === courses.length - 1;
                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className={`block px-3 py-2 text-sm rounded-md ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      } border-b border-gray-700`}
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
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-[300px] flex-col border-r border-gray-700 bg-background">
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <Separator className="my-4" />
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {courses.map((course, index) => {
                const isActive = pathname === `/courses/${course.id}`;
                const isLast = index === courses.length - 1;
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className={`block px-3 py-2 text-sm rounded-md ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    } border-b border-gray-700`}
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