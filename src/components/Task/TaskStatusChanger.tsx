'use client';

import { ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getNextStatus, isValidStatus, TASK_STATUS_CONFIG } from '@/lib/task/util';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/types/task';

type TaskStatusChangerProps = {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
};

const USER_STATUS_ORDER = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
] as const;

const TaskStatusChanger = ({ currentStatus, onStatusChange }: TaskStatusChangerProps) => {
  const handleArrowClick = () => {
    onStatusChange(getNextStatus(currentStatus));
  };

  const handleDropdownSelect = (status: TaskStatus) => {
    onStatusChange(status);
  };

  // Ensure currentStatus is a valid TaskStatus
  const validStatus = isValidStatus(currentStatus) ? currentStatus : TaskStatus.TODO;
  const config = TASK_STATUS_CONFIG[validStatus];

  // Helper function to get background class for status
  const getStatusBgClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-blue-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-yellow-500';
      case TaskStatus.COMPLETED:
        return 'bg-green-600';
      default:
        return 'bg-muted';
    }
  };

  // Helper function to get text class for status
  const getStatusTextClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'text-white';
      case TaskStatus.IN_PROGRESS:
        return 'text-white';
      case TaskStatus.COMPLETED:
        return 'text-white';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center h-8 rounded-md overflow-hidden',
        getStatusBgClass(validStatus),
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      )}
      role="group"
      aria-label="Task status changer"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'px-3 h-full flex items-center',
              getStatusTextClass(validStatus),
              'font-medium text-xs uppercase',
              'hover:bg-black/5 focus:outline-none',
            )}
            aria-label="Change task status"
          >
            {config.label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[var(--radix-dropdown-menu-trigger-width)] p-0 rounded-md overflow-hidden"
        >
          {USER_STATUS_ORDER.map((status, index) => {
            const statusConfig = TASK_STATUS_CONFIG[status];
            const isCompleted = status === TaskStatus.COMPLETED;

            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleDropdownSelect(status)}
                className={cn(
                  'h-8 px-4 rounded-none flex items-center gap-2',
                  'font-medium text-xs uppercase',
                  'hover:bg-accent hover:text-accent-foreground focus:outline-none',
                  'cursor-pointer',
                  index !== USER_STATUS_ORDER.length - 1 && 'border-b border-border',
                )}
              >
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  isCompleted
                    ? getStatusBgClass(status)
                    : `${getStatusBgClass(status)} border border-current`,
                )}
                />
                {statusConfig.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={handleArrowClick}
        className={cn(
          'h-full flex items-center justify-center px-2',
          'hover:bg-black/5 focus:outline-none',
          'transition-colors',
        )}
        aria-label="Cycle to next status"
      >
        <ChevronRight className="w-2.5 h-2.5 text-foreground" />
      </button>
    </div>
  );
};

export { TaskStatusChanger };
