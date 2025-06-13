'use client';

import type { Task } from '@/types/task';
import { AlertCircleIcon, AlertTriangleIcon, CheckIcon } from 'lucide-react';
import { DueDateDisplay } from '@/components/shared/atoms/due-date-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TaskBannerVariant = 'draft' | 'overdue';

type TaskBannerAction = {
  label: string;
  onClick: () => Promise<void>;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  className?: string;
};

type TaskBannerProps = {
  tasks: Task[];
  variant: TaskBannerVariant;
  isLoading?: boolean;
  actions: TaskBannerAction[];
  showTasks?: boolean; // Whether to show individual tasks or just the banner
  onCompleteTask?: (taskId: string) => Promise<void>; // For individual task completion
  className?: string;
};

const VARIANT_CONFIG = {
  draft: {
    icon: AlertCircleIcon,
    alertVariant: 'destructive' as const,
    alertClassName: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    iconClassName: 'h-5 w-5 text-red-600 dark:text-red-400',
    textClassName: 'text-red-800 dark:text-red-200',
    getMessage: (count: number) =>
      `You have ${count} draft task${count !== 1 ? 's' : ''} awaiting your review.`,
  },
  overdue: {
    icon: AlertTriangleIcon,
    alertVariant: 'default' as const,
    alertClassName: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
    iconClassName: 'h-4 w-4 text-yellow-600 dark:text-yellow-400',
    textClassName: 'text-yellow-800 dark:text-yellow-200',
    getMessage: (count: number) =>
      `${count} overdue task${count !== 1 ? 's' : ''} need${count === 1 ? 's' : ''} attention.`,
  },
} as const;

export function TaskBanner({
  tasks,
  variant,
  isLoading = false,
  actions,
  showTasks = false,
  onCompleteTask,
  className,
}: TaskBannerProps) {
  if (tasks.length === 0) {
    return null;
  }

  const taskCount = tasks.length;
  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Banner */}
      <Alert
        variant={config.alertVariant}
        className={cn('mb-6', config.alertClassName)}
      >
        <IconComponent className={config.iconClassName} />
        <AlertDescription className="flex items-center justify-between">
          {/* Left side: icon + message */}
          <div className="flex items-center gap-2">
            <span className={config.textClassName}>
              <strong>{taskCount}</strong>
              {' '}
              {config.getMessage(taskCount).split(`${taskCount} `)[1]}
            </span>
          </div>

          {/* Right side: actions */}
          <div className="flex gap-2 ml-4">
            {actions.map(action => (
              <Button
                key={`action-${action.label}-${variant}`}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                disabled={isLoading}
                className={action.className}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </AlertDescription>
      </Alert>
      {showTasks && (
        <div className="space-y-2">
          <h4 className={cn('text-sm font-medium', config.textClassName)}>
            {variant === 'draft' ? 'Draft Tasks:' : 'Overdue Tasks:'}
          </h4>
          <div className="grid gap-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  variant === 'draft'
                    ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50'
                    : 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    variant === 'draft'
                      ? 'text-red-900 dark:text-red-100'
                      : 'text-yellow-900 dark:text-yellow-100',
                  )}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.dueDate && (
                      <DueDateDisplay
                        date={task.dueDate}
                        className={variant === 'draft'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-yellow-700 dark:text-yellow-300'}
                      />
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        variant === 'draft'
                          ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-300'
                          : 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300',
                      )}
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
                {onCompleteTask && variant === 'overdue' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCompleteTask(task.id)}
                    disabled={isLoading}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
