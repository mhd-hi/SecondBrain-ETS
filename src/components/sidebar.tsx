import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import Link from "next/link";

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
              <div className="space-y-2">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center justify-between">
                      <span>{course.code} - {course.name}</span>
                      {course.inProgressCount > 0 && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {course.inProgressCount}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-[300px] flex-col border-r">
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <Separator className="my-4" />
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center justify-between">
                    <span>{course.code} - {course.name}</span>
                    {course.inProgressCount > 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {course.inProgressCount}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
} 