"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePomodoro } from "@/contexts/pomodoro-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Play } from "lucide-react";
import { getCourseColor } from "@/lib/utils";
import { TaskStatus } from "@/types/task";
import { DurationSelector } from "@/components/shared/atoms/DurationSelector";

interface Course {
    id: string;
    code: string;
    name: string;
    color: string;
}

interface TaskForPomodoro {
    id: string;
    title: string;
    estimatedEffort: number;
    courseId: string;
    status: string;
    dueDate: string;
}

interface PomodoroContainerProps {
    _onStartPomodoroWithTask?: (taskId: string, taskTitle: string) => void;
}

export const PomodoroContainer = ({ _onStartPomodoroWithTask }: PomodoroContainerProps) => {
    const { startPomodoro, duration, setDuration, streak } = usePomodoro();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskForPomodoro | null>(null);
    const [courses, setCourses] = useState<Course[]>([]); const [tasks, setTasks] = useState<TaskForPomodoro[]>([]);

    // Fetch courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses');
                if (response.ok) {
                    const coursesData = await response.json() as Course[];
                    setCourses(coursesData);
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            }
        };
        void fetchCourses();
    }, []);

    // Fetch tasks when course is selected
    useEffect(() => {
        if (selectedCourse) {
            const fetchTasks = async () => {
                try {
                    const response = await fetch(`/api/tasks?courseId=${selectedCourse.id}&status=IN_PROGRESS,TODO`);
                    if (response.ok) {
                        const tasksData = await response.json() as TaskForPomodoro[];
                        setTasks(tasksData);

                        // Auto-select the most urgent task (most overdue IN_PROGRESS task)
                        if (tasksData.length > 0) {
                            // Sort tasks by urgency: overdue IN_PROGRESS first, then by due date
                            const sortedTasks = tasksData.sort((a, b) => {
                                const now = new Date();
                                const aIsOverdue = new Date(a.dueDate) < now;
                                const bIsOverdue = new Date(b.dueDate) < now;
                                const aIsInProgress = a.status === 'IN_PROGRESS';
                                const bIsInProgress = b.status === 'IN_PROGRESS';

                                // Prioritize overdue IN_PROGRESS tasks
                                if (aIsOverdue && aIsInProgress && !(bIsOverdue && bIsInProgress)) return -1;
                                if (bIsOverdue && bIsInProgress && !(aIsOverdue && aIsInProgress)) return 1;

                                // Then prioritize IN_PROGRESS tasks
                                if (aIsInProgress && !bIsInProgress) return -1;
                                if (bIsInProgress && !aIsInProgress) return 1;

                                // Finally sort by due date (earliest first)
                                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                            });

                            setSelectedTask(sortedTasks[0]!);
                        } else {
                            setSelectedTask(null);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch tasks:', error);
                    setTasks([]);
                    setSelectedTask(null);
                }
            };

            void fetchTasks();
        } else {
            setTasks([]);
            setSelectedTask(null);
        }
    }, [selectedCourse]); const handleStartPomodoro = () => {
        if (selectedTask) {
            // Convert TaskForPomodoro to Task type expected by context
            const task = {
                ...selectedTask,
                courseId: selectedTask.courseId,
                week: 0, // default value
                type: 'theorie' as const,
                status: TaskStatus[selectedTask.status as keyof typeof TaskStatus],
                actualEffort: 0,
                subtasks: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                dueDate: new Date(selectedTask.dueDate),
            };
            startPomodoro(task, duration);
        } else {
            // Start pomodoro without a task (free focus session)
            startPomodoro(null, duration);
        }
    }; const getCourseBadgeProps = (course: Course) => {
        const courseColor = getCourseColor(course);
        return {
            style: {
                borderColor: courseColor,
                color: courseColor,
                backgroundColor: courseColor ? `${courseColor}15` : undefined
            }
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
                        variant="large"
                    />
                </div>{/* Course Dropdown */}
                <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Course</label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                            >
                                {selectedCourse ? (
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
                                ) : (
                                    "No course selected"
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
                            {courses.map((course) => (
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
                <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Task</label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                                disabled={!selectedCourse}
                            >
                                {selectedTask ? (
                                    <span className="truncate">
                                        {selectedTask.title} ({selectedTask.estimatedEffort}h)
                                    </span>
                                ) : selectedCourse ? (
                                    "No task selected"
                                ) : (
                                    "Select a course first"
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
                            {tasks.length === 0 && selectedCourse ? (
                                <DropdownMenuItem disabled>
                                    No tasks available
                                </DropdownMenuItem>
                            ) : (
                                tasks.map((task) => (
                                    <DropdownMenuItem
                                        key={task.id}
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <span className="truncate">
                                            {task.title} ({task.estimatedEffort}h)
                                        </span>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>                {/* Start Button */}
                <Button
                    onClick={handleStartPomodoro}
                    className="w-full mb-2 bg-violet-500 hover:bg-violet-600 text-violet-100"
                    size="lg"
                >
                    <Play className="h-5 w-5 mr-2" />
                    {selectedTask ? "Start Pomodoro" : "Start Focus Session"}
                </Button>

                {/* Stats */}
                <div className="flex justify-between items-center text-sm mt-5">
                    {streak > 0 ? (
                        <div className="flex items-center gap-1">
                            <span>🔥</span>
                            <span>Streak: {streak} day{streak !== 1 ? 's' : ''}</span>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        </div>);
};
