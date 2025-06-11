'use client';

import type { Task } from '@/types/task';
import { AlertTriangleIcon, CheckIcon } from 'lucide-react';
import { DueDateDisplay } from '@/components/shared/atoms/due-date-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type OverdueTasksWidgetProps = {
  overdueTasks: Task[];
  onCompleteAll: () => Promise<void>;
  onCompleteTask: (taskId: string) => Promise<void>;
  isLoading?: boolean;
  showTasks?: boolean; // Whether to show individual tasks or just the banner
};

export function OverdueTasksWidget({
  overdueTasks,
  onCompleteAll,
  onCompleteTask,
  isLoading = false,
  showTasks = false,
}: OverdueTasksWidgetProps) {
  if (overdueTasks.length === 0) {
    return null;
  }

  const taskCount = overdueTasks.length;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <AlertTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-yellow-800 dark:text-yellow-200">
            <strong>{taskCount}</strong>
            {' '}
            overdue task
            {taskCount !== 1 ? 's' : ''}
            {' '}
            need
            {taskCount === 1 ? 's' : ''}
            {' '}
            attention
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onCompleteAll}
            disabled={isLoading}
            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 border-yellow-300 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900 dark:border-yellow-700"
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            Complete All
          </Button>
        </AlertDescription>
      </Alert>

      {/* Individual Tasks (if showTasks is true) */}
      {showTasks && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Overdue Tasks:
          </h4>
          <div className="grid gap-2">
            {overdueTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <DueDateDisplay date={task.dueDate} className="text-yellow-700 dark:text-yellow-300" />
                    <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300">
                      {task.status}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCompleteTask(task.id)}
                  disabled={isLoading}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900"
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
