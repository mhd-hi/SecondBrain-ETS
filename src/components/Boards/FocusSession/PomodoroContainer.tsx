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
import { toast } from "sonner";
import { TaskStatus } from "@/types/task";

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
    const [courses, setCourses] = useState<Course[]>([]);
    const [tasks, setTasks] = useState<TaskForPomodoro[]>([]);

    // Predefined duration options - includes classic and alternative Pomodoro variants
    const durationOptions = [
        { label: "0.15 min", value: 0.15 }, // For testing
        { label: "15 min", value: 15 },   // Short focused session
        { label: "20 min", value: 20 },   // Alternative short session
        { label: "25 min", value: 25 },   // Classic Pomodoro
        { label: "30 min", value: 30 },   // Extended focus
        { label: "45 min", value: 45 },   // Deep work session
        { label: "52 min", value: 52 },   // 52/17 variant (popular alternative)
        { label: "60 min", value: 60 },   // Full hour session
        { label: "90 min", value: 90 },   // Ultradian rhythm session
    ];

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
    }, [selectedCourse]);

    const handleStartPomodoro = () => {
        if (!selectedTask) {
            toast.error("Please select a task to focus on");
            return;
        }        // Convert TaskForPomodoro to Task type expected by context
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
    };

    const formatTime = (minutes: number) => {
        const mins = Math.floor(minutes);
        const secs = Math.round((minutes - mins) * 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getCourseBadgeProps = (course: Course) => {
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
            <h2 className="text-xl font-semibold mb-3">Focus Session</h2>
            <div className="space-y-3 flex-1">
                {/* Duration Selector */}
                <div className="text-center space-y-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="text-3xl font-mono font-bold h-16 px-6 min-w-[120px] bg-transparent hover:bg-muted/20"
                            >
                                {formatTime(duration)}
                                <ChevronDown className="h-5 w-5 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {durationOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => setDuration(option.value)}
                                    className={duration === option.value ? "bg-accent" : ""}
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Course Dropdown */}
                <div className="space-y-1">
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
                                    "Select a course"
                                )}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
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

                {/* Task Dropdown */}
                <div className="space-y-1">
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
                                ) : (
                                    selectedCourse ? "Select a task" : "Select a course first"
                                )}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            {tasks.length === 0 ? (
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
                </div>

                {/* Start Button */}
                <Button
                    onClick={handleStartPomodoro}
                    className="w-full mb-2 bg-violet-500 hover:bg-violet-600 text-violet-100"
                    size="lg"
                    disabled={!selectedTask}
                >
                    <Play className="h-5 w-5 mr-2" />
                    Start Pomodoro
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
        </div>    );
};
