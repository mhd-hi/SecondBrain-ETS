'use client';

import type { CourseListItem } from '@/types/api/course';
import { ChevronsUpDown, LogOut, NotebookText, Plus, Settings } from 'lucide-react';
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
                  ? (' ')
                  : (
                    courses.map((course) => {
                      const isActive = pathname === `/courses/${course.id}`;
                      return (
                        <SidebarMenuItem key={course.id}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link href={`/courses/${course.id}`}>
                              <NotebookText className="size-4" style={{ color: course.color }} />
                              <span>{course.code}</span>
                              <div className="ml-auto flex items-center gap-1">
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

      <SidebarFooter className="py-6">
        <SidebarMenu>
          {/* User Authentication */}
          <SidebarMenuItem>
            {status === 'loading'
              ? (
                <SidebarMenuButton disabled className="h-12">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <span>Loading...</span>
                </SidebarMenuButton>
              )
              : session
                ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full group/user-menu h-12">
                        {session.user?.image && (
                          <Image
                            src={session.user.image}
                            alt="Profile"
                            width={24}
                            height={24}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="truncate">{session.user?.name}</span>
                        <ChevronsUpDown className="size-4 ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      side="right"
                      sideOffset={8}
                      className="w-56"
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/preferences">
                          <Settings className="size-4 mr-2" />
                          Preferences
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                        onClick={() => signOut()}
                      >
                        <LogOut className="size-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
                : (
                  <SidebarMenuButton onClick={() => signIn()} className="h-12">
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
