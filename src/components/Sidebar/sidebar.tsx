'use client';

import type { CourseListItem } from '@/types/course';
import { Calendar, Home, NotebookText, Plus, Timer } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppLogo } from '@/components/shared/AppLogo';
import { AddCourseDialog } from '@/components/shared/dialogs/AddCourseDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';

type SidebarProps = {
  courses: CourseListItem[];
  isLoading?: boolean;
  onCourseAdded?: () => void;
};

// Navigation items for mobile sidebar
const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Weekly Roadmap',
    url: '/weekly-roadmap',
    icon: Calendar,
  },
  {
    title: 'Pomodoro',
    url: '/pomodoro',
    icon: Timer,
  },
];

export function AppSidebar({ courses, isLoading = false, onCourseAdded }: SidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="h-screen">
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation Group - Mobile only */}
        <SidebarGroup className="md:hidden">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="md:hidden" />

        {/* My Courses Group */}
        <SidebarGroup>
          <SidebarGroupLabel>My Courses</SidebarGroupLabel>
          <AddCourseDialog
            onCourseAdded={onCourseAdded}
            trigger={(
              <SidebarGroupAction>
                <Plus className="size-4" />
              </SidebarGroupAction>
            )}
          />
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading
                ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton showIcon index={i} />
                    </SidebarMenuItem>
                  ))
                )
                : courses.length === 0
                  ? (
                    <div className="px-2 py-4 text-center text-muted-foreground">
                      <p className="text-sm">No courses yet</p>
                      <p className="text-xs mt-1">Add your first course to get started!</p>
                    </div>
                  )
                  : (
                    courses.map((course) => {
                      const isActive = pathname === `/courses/${course.id}`;
                      return (
                        <SidebarMenuItem key={course.id}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link href={`/courses/${course.id}`}>
                              <NotebookText className="size-4" />
                              <span>{course.code}</span>
                              <div className="ml-auto flex items-center gap-1">
                                {course.draftCount > 0 && (
                                  <StatusBadge
                                    content={course.draftCount}
                                    variant="red"
                                    tooltipText={`${course.draftCount} tasks to review`}
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
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })
                  )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
