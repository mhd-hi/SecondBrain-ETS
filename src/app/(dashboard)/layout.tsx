import React from 'react';
import Navbar from '@/components/Navbar/Navbar';
import { SidebarWrapper } from '@/components/Sidebar/sidebar-wrapper';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { CoursesProvider } from '@/contexts/courses-context';
import { PomodoroProvider } from '@/contexts/pomodoro-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CoursesProvider>
      <PomodoroProvider>
        <SidebarProvider>
          <div className="flex w-full">
            <SidebarWrapper />
            <SidebarInset className="flex flex-col flex-1">
              <Navbar />
              <main className="flex-1 container max-w-full py-6">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </PomodoroProvider>
    </CoursesProvider>
  );
}
