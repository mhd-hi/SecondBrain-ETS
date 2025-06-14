import React from 'react';
import Navbar from '@/components/Navbar/Navbar';
import { SidebarWrapper } from '@/components/Sidebar/sidebar-wrapper';
import { CoursesProvider } from '@/contexts/courses-context';
import { PomodoroProvider } from '@/contexts/pomodoro-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CoursesProvider>
      <PomodoroProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex flex-1">
            <SidebarWrapper />
            <main className="flex-1 container py-6 md:ml-[300px]">
              {children}
            </main>
          </div>
        </div>
      </PomodoroProvider>
    </CoursesProvider>
  );
}
