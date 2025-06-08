"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TaskStatusChanger } from "@/components/TaskStatusChanger";
import { TruncatedTextWithTooltip } from "@/components/shared/atoms/text-with-tooltip";
import type { Task as TaskType } from "@/types/task";
import { TaskStatus } from "@/types/task";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCourseColor } from "@/lib/utils";

type FilterType = "week" | "month" | "quarter";

interface GroupedTasks {
  overdue: TaskType[];
  today: TaskType[];
  tomorrow: TaskType[];
  thisWeek: TaskType[];
  later: TaskType[];
}

interface TaskItemProps {
  task: TaskType;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onSubtaskStatusChange: (taskId: string, subtaskId: string, newStatus: TaskStatus) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  showNavigateButton?: boolean;
}

const TaskItem = ({ 
  task, 
  onStatusChange, 
  onSubtaskStatusChange,
  isExpanded, 
  onToggleExpanded,
  showNavigateButton = true 
}: TaskItemProps) => {
  const router = useRouter();
  
  const handleNavigateToTask = () => {
    if (task.course?.id) {
      router.push(`/courses/${task.course.id}#task-${task.id}`);
    }
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const courseColor = task.course?.id ? getCourseColor(task.course.id) : undefined;

  return (
    <Card className="p-4 border border-border/40 hover:border-border bg-card/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 flex-shrink-0"
                onClick={onToggleExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}            {task.course?.code && (
              <Badge 
                variant="outline" 
                className="text-xs flex-shrink-0"
                style={{ 
                  borderColor: courseColor,
                  color: courseColor,
                  backgroundColor: courseColor ? `${courseColor}15` : undefined
                }}
              >
                {task.course.code}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {task.estimatedEffort} hr{task.estimatedEffort !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <TruncatedTextWithTooltip
            text={task.title}
            className="text-sm font-medium mb-3 leading-tight"
            maxLines={2}
          />
          
          <div className="flex items-center gap-2">
            <TaskStatusChanger
              currentStatus={task.status}
              onStatusChange={(newStatus: TaskStatus) => onStatusChange(task.id, newStatus)}
            />
          </div>
          
          {/* Subtasks */}
          {isExpanded && hasSubtasks && (
            <div className="mt-3 pl-4 border-l-2 border-border/30 space-y-2">
              {task.subtasks!.map((subtask) => (
                <div key={subtask.id} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <TruncatedTextWithTooltip
                      text={subtask.title}
                      className="text-xs text-muted-foreground leading-tight"
                      maxLines={1}
                    />
                  </div>
                  <TaskStatusChanger
                    currentStatus={subtask.status}
                    onStatusChange={(newStatus: TaskStatus) => 
                      onSubtaskStatusChange(task.id, subtask.id, newStatus)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {showNavigateButton && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={handleNavigateToTask}
            disabled={!task.course?.id}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export const TodaysFocus = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("week");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const fetchFocusTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/focus?filter=${filter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch focus tasks');
      }
      const focusTasks = await response.json() as TaskType[];
      setTasks(focusTasks);
    } catch (error) {
      console.error("Failed to load focus tasks:", error);
      toast.error("Failed to load focus tasks");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchFocusTasks();
  }, [fetchFocusTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleSubtaskStatusChange = async (taskId: string, subtaskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subtask status');
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId 
            ? {
                ...task,
                subtasks: task.subtasks?.map((subtask) =>
                  subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask
                )
              }
            : task
        )
      );
    } catch (error) {
      console.error("Failed to update subtask status:", error);
      toast.error("Failed to update subtask status");
    }
  };
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const toggleSectionExpanded = (sectionKey: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  // Sort tasks by priority: IN_PROGRESS > TODO > DRAFT > COMPLETED
  const sortTasksByPriority = (tasks: TaskType[]): TaskType[] => {
    return tasks.sort((a, b) => {
      const priorityOrder = {
        [TaskStatus.IN_PROGRESS]: 1,
        [TaskStatus.TODO]: 2,
        [TaskStatus.DRAFT]: 3,
        [TaskStatus.COMPLETED]: 4
      };
      
      return priorityOrder[a.status] - priorityOrder[b.status];
    });
  };  // Group tasks by due date
  const groupTasksByDate = (tasks: TaskType[]): GroupedTasks => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
      const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    return tasks.reduce<GroupedTasks>((groups, task) => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      if (taskDate < today) {        
        // Only include in overdue if the task is not completed
        if (task.status !== TaskStatus.COMPLETED) {
          groups.overdue.push(task);
        }
      } else if (taskDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (taskDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else if (taskDate < endOfWeek) {
        groups.thisWeek.push(task);
      } else {
        groups.later.push(task);
      }

      return groups;
    }, {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: []
    });
  };

  const groupedTasksRaw = groupTasksByDate(tasks);
  // Sort tasks within each group by priority
  const groupedTasks = {
    overdue: sortTasksByPriority(groupedTasksRaw.overdue),
    today: sortTasksByPriority(groupedTasksRaw.today),
    tomorrow: sortTasksByPriority(groupedTasksRaw.tomorrow),
    thisWeek: sortTasksByPriority(groupedTasksRaw.thisWeek),
    later: sortTasksByPriority(groupedTasksRaw.later)
  };

  const hasAnyTasks = tasks.length > 0;  // Determine which groups to show based on filter
  const getVisibleGroups = () => {
    switch (filter) {
      case "month":
      case "quarter":
        return ["overdue", "today", "tomorrow", "thisWeek", "later"] as const;
      default: // week
        return ["overdue", "today", "tomorrow", "thisWeek", "later"] as const;
    }
  };

  const visibleGroups = getVisibleGroups();  const GroupSection = ({ title, tasks, count, sectionKey }: { 
    title: string; 
    tasks: TaskType[]; 
    count?: number; 
    sectionKey: string;
  }) => {
    if (tasks.length === 0) return null;

    const isExpanded = expandedSections.has(sectionKey);
    const maxDisplayTasks = 5;
    const shouldLimit = tasks.length > maxDisplayTasks;
    const displayTasks = shouldLimit && !isExpanded ? tasks.slice(0, maxDisplayTasks) : tasks;
    const totalCount = count ?? tasks.length;
    const hiddenCount = shouldLimit && !isExpanded ? tasks.length - maxDisplayTasks : 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          <Badge variant="secondary" className="text-xs">
            {totalCount}
          </Badge>
          {hiddenCount > 0 && (
            <span className="text-xs text-muted-foreground">
              (+{hiddenCount} more)
            </span>
          )}
        </div>
        <div className="space-y-2">
          {displayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onSubtaskStatusChange={handleSubtaskStatusChange}
              isExpanded={expandedTasks.has(task.id)}
              onToggleExpanded={() => toggleTaskExpanded(task.id)}
            />
          ))}
          {shouldLimit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSectionExpanded(sectionKey)}
              className="text-xs text-muted-foreground hover:text-foreground w-full justify-center"
            >
              {isExpanded ? 'See less' : `See ${hiddenCount} more`}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg bg-muted/30">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Today&apos;s Focus</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("week")}
              className="text-xs"
            >
              This Week
            </Button>
            <Button
              variant={filter === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("month")}
              className="text-xs"
            >
              This Month
            </Button>
            <Button
              variant={filter === "quarter" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("quarter")}
              className="text-xs"
            >
              Next Quarter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !hasAnyTasks ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks require your focus right now! 🎉</p>
            <p className="text-sm mt-1">
              {filter === "week" ? "This week" : filter === "month" ? "This month" : "Next quarter"} is looking clear.
            </p>
          </div>
        ) : (
          <div className="space-y-6">            {visibleGroups.map(groupKey => {
              const groupConfig = {
                overdue: { title: "Overdue", tasks: groupedTasks.overdue },
                today: { title: "Due Today", tasks: groupedTasks.today },
                tomorrow: { title: "Due Tomorrow", tasks: groupedTasks.tomorrow },
                thisWeek: { title: "Due This Week", tasks: groupedTasks.thisWeek },
                later: { title: "Due Later", tasks: groupedTasks.later }
              };

              const config = groupConfig[groupKey];
              return (
                <GroupSection
                  key={groupKey}
                  title={config.title}
                  tasks={config.tasks}
                  sectionKey={groupKey}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
