'use client';

import React from 'react';
import Navbar from '@/components/shared/Navigation/Navbar/Navbar';
import { AppSidebar } from '@/components/shared/Navigation/Sidebar/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { PomodoroProvider } from '@/contexts/pomodoro-provider';
import { useCoursesContext } from '@/contexts/use-courses';

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { coursesListItems, isLoading, refreshCourses } = useCoursesContext();

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar courses={coursesListItems} isLoading={isLoading} onCourseAdded={refreshCourses} />
        <SidebarInset className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 container max-w-full py-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PomodoroProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </PomodoroProvider>
  );
}
