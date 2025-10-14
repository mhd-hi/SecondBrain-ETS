'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBadgeDate } from '@/lib/utils/date-util';
import { calculateProgressMetrics } from '@/lib/utils/progress-util';
import { getCurrentTrimesterInfo, getCurrentTrimesterPosition } from '@/lib/utils/trimester-util';

function TaskProgressBar({ completed, inProgress, total }: { completed: number; inProgress: number; total: number }) {
  if (total === 0) {
    return <div className="h-3 w-full bg-gray-200 rounded-full" />;
  }

  const completedPercentage = (completed / total) * 100;
  const inProgressPercentage = (inProgress / total) * 100;

  // Calculate current position in trimester for timeline dot
  const currentDate = new Date();
  const currentPosition = getCurrentTrimesterPosition();
  const { totalWeeks, weekOfTrimester } = getCurrentTrimesterInfo();

  return (
    <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
      {/* Completed tasks - green */}
      <div
        className="absolute left-0 top-0 h-full bg-emerald-500 dark:bg-emerald-400 transition-all"
        style={{ width: `${completedPercentage}%` }}
      />
      {/* In progress tasks - yellow */}
      <div
        className="absolute top-0 h-full bg-amber-500 dark:bg-amber-400 transition-all"
        style={{
          left: `${completedPercentage}%`,
          width: `${inProgressPercentage}%`,
        }}
      />
      <div
        className="absolute top-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background transform -translate-y-1/2 -translate-x-1/2 z-10 shadow-sm"
        style={{ left: `${Math.min(Math.max(currentPosition, 3), 97)}%` }}
        title={`${formatBadgeDate(currentDate)} - Week ${weekOfTrimester} of ${totalWeeks}`}
      />
    </div>
  );
}

type CourseProgressTileProps = {
  tasks: Array<{
    id: string;
    status: string;
    dueDate: Date;
  }>;
};

export function CourseProgressTile({ tasks }: CourseProgressTileProps) {
  // Calculate progress stats
  const progress = calculateProgressMetrics(tasks);
  const { total: totalTasks, completed: completedTasks, inProgress: inProgressTasks, todo: todoTasks } = progress;

  // Tasks due within the next week
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Task Completion
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task Progress Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                {completedTasks}
                {' '}
                DONE
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                {inProgressTasks}
                {' '}
                DOING
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                {todoTasks}
                {' '}
                TODO
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedTasks + inProgressTasks}
              /
              {totalTasks}
              {' '}
              tasks
            </span>
          </div>

          <TaskProgressBar
            completed={completedTasks}
            inProgress={inProgressTasks}
            total={totalTasks}
          />
        </div>
      </CardContent>
    </Card>
  );
}
