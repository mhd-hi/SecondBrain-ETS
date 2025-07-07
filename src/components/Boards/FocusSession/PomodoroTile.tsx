'use client';

import type { Course } from '@/types/course';
import type { Task } from '@/types/task';
import { ChevronDown, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DurationSelector } from '@/components/Pomodoro/DurationSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCourses } from '@/contexts/use-courses';
import { usePomodoro } from '@/contexts/use-pomodoro';
import { getCourseColor } from '@/lib/utils';

export function PomodoroTile() {
  const router = useRouter();
  const { courses } = useCourses();
  const { streak } = usePomodoro();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [duration, setDuration] = useState(25);

  // Fetch tasks when course changes
  useEffect(() => {
    if (selectedCourse) {
      const fetchTasks = async () => {
        try {
          const response = await fetch(`/api/tasks?courseId=${selectedCourse.id}&status=TODO,IN_PROGRESS`);
          if (response.ok) {
            const courseTasks = await response.json();
            setTasks(courseTasks);
          }
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
          setTasks([]);
        }
      };
      void fetchTasks();
    } else {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setTasks([]);
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setSelectedTask(null);
    }
  }, [selectedCourse]);

  const handleStartPomodoro = useCallback(() => {
    const params = new URLSearchParams();

    // Add duration
    params.set('duration', duration.toString());

    // Add course if selected
    if (selectedCourse) {
      params.set('courseId', selectedCourse.id);
    }

    // Add specific task if selected
    if (selectedTask) {
      params.set('taskId', selectedTask.id);
    }

    router.push(`/pomodoro?${params.toString()}`);
  }, [duration, selectedCourse, selectedTask, router]);

  const getCourseBadgeProps = (course: Course) => {
    const courseColor = getCourseColor(course);
    return {
      style: {
        borderColor: courseColor,
        color: courseColor,
        backgroundColor: courseColor ? `${courseColor}15` : undefined,
      },
    };
  };

  return (
    <div className="border rounded-lg bg-muted/30 p-4 min-h-[320px] flex flex-col">
      <h2 className="text-xl font-semibold mb-3">Deep Work</h2>
      <div className="space-y-3 flex-1">
        <div className="text-center space-y-2">
          <DurationSelector
            duration={duration}
            onDurationChange={setDuration}
            className="text-3xl"
          />
        </div>

        {/* Course Dropdown */}
        <div className="space-y-1">
          <label htmlFor="course" className="text-sm text-muted-foreground">Course</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                {selectedCourse
                  ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        {...getCourseBadgeProps(selectedCourse)}
                      >
                        {selectedCourse.code}
                      </Badge>
                      <span className="truncate">{selectedCourse.name}</span>
                    </div>
                  )
                  : (
                    'No course selected'
                  )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCourse(null);
                  setSelectedTask(null);
                }}
              >
                <span className="text-muted-foreground">No course</span>
              </DropdownMenuItem>
              {courses.map(course => (
                <DropdownMenuItem
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="flex items-center gap-2"
                >
                  <Badge
                    variant="outline"
                    className="text-xs"
                    {...getCourseBadgeProps(course)}
                  >
                    {course.code}
                  </Badge>
                  <span className="truncate">{course.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Task Dropdown */}
        <div className="space-y-1">
          <label htmlFor="task" className="text-sm text-muted-foreground">Task</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                disabled={!selectedCourse}
              >
                {selectedTask
                  ? (
                    <span className="truncate">
                      {selectedTask.title}
                      {' '}
                      (
                      {selectedTask.estimatedEffort}
                      h)
                    </span>
                  )
                  : selectedCourse
                    ? (
                      'No task selected'
                    )
                    : (
                      'Select a course first'
                    )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {selectedCourse && (
                <DropdownMenuItem
                  onClick={() => setSelectedTask(null)}
                >
                  <span className="text-muted-foreground">No task</span>
                </DropdownMenuItem>
              )}
              {tasks.length === 0 && selectedCourse
                ? (
                  <DropdownMenuItem disabled>
                    No tasks available
                  </DropdownMenuItem>
                )
                : (
                  tasks.map(task => (
                    <DropdownMenuItem
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                    >
                      <span className="truncate">
                        {task.title}
                        {' '}
                        (
                        {task.estimatedEffort}
                        h)
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Start Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleStartPomodoro}
            className="mb-2 bg-violet-500 hover:bg-violet-600 text-violet-100"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            {selectedTask ? 'Start Pomodoro' : 'Start Focus Session'}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm mt-5">
          {streak > 0
            ? (
              <div className="flex items-center gap-1">
                <span>
                  🔥 Streak:
                  {' '}
                  {streak}
                  {' '}
                  day
                  {streak !== 1 ? 's' : ''}
                </span>
              </div>
            )
            : (
              <div></div>
            )}
        </div>
      </div>
    </div>
  );
}
