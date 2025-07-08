'use client';

import type { CourseListItem } from '@/types/course';
import { NotebookText, Plus, Settings } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppLogo } from '@/components/shared/atoms/AppLogo';
import { StatusBadge } from '@/components/shared/atoms/StatusBadge';
import { AddCourseDialog } from '@/components/shared/dialogs/AddCourseDialog';
import { NavigationItems } from '@/components/shared/Navigation/NavigationItems';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { Skeleton } from '@/components/ui/skeleton';

type SidebarProps = {
  courses: CourseListItem[];
  isLoading?: boolean;
  onCourseAdded?: () => void;
};

export function AppSidebar({ courses, isLoading = false, onCourseAdded }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
            <NavigationItems variant="vertical" />
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

      <SidebarFooter>
        <SidebarMenu>
          {/* Preferences Button */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/preferences'}>
              <Link href="/preferences">
                <Settings className="size-4" />
                <span>Preferences</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User Authentication */}
          <SidebarMenuItem>
            {status === 'loading'
              ? (
                <SidebarMenuButton disabled>
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <span>Loading...</span>
                </SidebarMenuButton>
              )
              : session
                ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full">
                        {session.user?.image && (
                          <Image
                            src={session.user.image}
                            alt="Profile"
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="truncate">{session.user?.name}</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
                : (
                  <SidebarMenuButton onClick={() => signIn()}>
                    Sign In
                  </SidebarMenuButton>
                )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
