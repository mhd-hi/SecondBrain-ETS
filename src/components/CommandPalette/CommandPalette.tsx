 'use client';

import { NotebookText, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AddCourseDialog } from '@/components/shared/dialogs/AddCourseDialog';
import { AddTaskDialog } from '@/components/shared/dialogs/AddTaskDialog';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useCoursesContext } from '@/contexts/use-courses';
import { getShortcutDisplayText, getShortcutForDialog, getShortcutForPath, useKeyboardShortcuts } from '@/lib/keyboard-shortcuts';
import { navbarItems } from '@/lib/navigation/constants';
import { getCoursePath } from '@/lib/routes';

type PageItem = {
  id: string;
  title: string;
  href: string;
};

export default function CommandPalette() {
  const router = useRouter();
  const { courses, isLoading, refreshCourses } = useCoursesContext();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);

  useKeyboardShortcuts({
    onToggleCommandPalette: () => setOpen(o => !o),
    onOpenAddCourseDialog: () => {
      setOpen(false);
      setAddCourseDialogOpen(true);
    },
    onOpenAddTaskDialog: () => {
      setOpen(false);
      setAddTaskDialogOpen(true);
    },
    onNavigate: (path: string) => {
      setOpen(false);
      router.push(path);
    },
  });
  const pages: PageItem[] = useMemo(() => (
    [
      ...navbarItems.map(item => ({ id: item.title.toLowerCase(), title: `${item.icon} ${item.title}`, href: item.url })),
    ]
  ), []);

  const courseItems = useMemo(() => (
    (courses ?? []).map(c => ({ id: c.id, title: c.code, href: getCoursePath(c.id), color: c.color }))
  ), [courses]);

  const allItems = useMemo(() => ({ pages, courses: courseItems }), [pages, courseItems]);

  const onSelect = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  useEffect(() => {
    const onOpen = (_e: Event) => setOpen(true);
    const onClose = (_e: Event) => setOpen(false);
    window.addEventListener('command-palette:open', onOpen);
    window.addEventListener('command-palette:close', onClose);
    return () => {
      window.removeEventListener('command-palette:open', onOpen);
      window.removeEventListener('command-palette:close', onClose);
    };
  }, []);

  // Simple client-side filter
  const filteredPages = allItems.pages.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
  const filteredCourses = allItems.courses.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
    <CommandDialog open={open} onOpenChange={setOpen} title="Navigate" description="Quickly navigate to pages or courses">
      <CommandInput value={query} onValueChange={(v: string) => setQuery(v)} placeholder="Type a page or course code..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          {[
            {
              key: 'add-course',
              icon: Plus,
              label: 'Add course',
              action: () => setAddCourseDialogOpen(true),
              dialog: 'add-course' as const,
            },
            {
              key: 'add-task',
              icon: Plus,
              label: 'Add task',
              action: () => setAddTaskDialogOpen(true),
              dialog: 'add-task' as const,
            },
          ].map(({ key, icon: Icon, label, action, dialog }) => {
            const shortcut = getShortcutForDialog(dialog);
            return (
              <CommandItem
                key={key}
                onSelect={() => {
                  setOpen(false);
                  action();
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </span>
                  {shortcut && (
                    <span className="text-xs text-muted-foreground">
                      {getShortcutDisplayText(shortcut)}
                    </span>
                  )}
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pages">
          {filteredPages.map((page) => {
            const shortcut = getShortcutForPath(page.href);
            return (
              <CommandItem key={page.id} onSelect={() => onSelect(page.href)}>
                <div className="flex items-center justify-between w-full">
                  <span>{page.title}</span>
                  {shortcut && (
                      <CommandShortcut>{getShortcutDisplayText(shortcut)}</CommandShortcut>
                  )}
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={`Courses ${isLoading ? '(loading...)' : ''}`}>
          {filteredCourses.length === 0 && <CommandEmpty>No courses</CommandEmpty>}
          {filteredCourses.map(course => (
            <CommandItem key={course.id} onSelect={() => onSelect(course.href)}>
              <div className="flex items-center">
                <NotebookText
                  className="h-4 w-4 mr-2"
                  style={{ color: course.color ?? undefined }}
                />
                <span>{course.title}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
    <AddCourseDialog
      open={addCourseDialogOpen}
      onOpenChange={setAddCourseDialogOpen}
      onCourseAdded={refreshCourses}
      trigger={<div style={{ display: 'none' }} />}
    />
    <AddTaskDialog
      open={addTaskDialogOpen}
      onOpenChange={setAddTaskDialogOpen}
      onTaskAdded={() => {}}
      courses={courses}
      trigger={<div style={{ display: 'none' }} />}
    />
    </>
  );
}
