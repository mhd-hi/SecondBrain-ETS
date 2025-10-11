'use client';

import { Calendar, GraduationCap } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrimesterProgress } from '@/hooks/use-trimester-progress';
import { formatBadgeDate } from '@/lib/utils/date-util';

function TrimesterTimelineBar({ weekOfTrimester, totalWeeks }: { weekOfTrimester: number; totalWeeks: number }) {
  const currentPosition = (weekOfTrimester / totalWeeks) * 100;

  return (
    <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
      {/* Timeline progress */}
      <div
        className="absolute left-0 top-0 h-full bg-primary/30 transition-all"
        style={{ width: `${currentPosition}%` }}
      />
      {/* Current date indicator - dot */}
      <div
        className="absolute top-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background transform -translate-y-1/2 -translate-x-1/2 z-10 shadow-sm"
        style={{ left: `${Math.min(Math.max(currentPosition, 3), 97)}%` }}
        title={`Week ${weekOfTrimester} of ${totalWeeks}`}
      />
    </div>
  );
}

export function DashboardProgressTile() {
  const progressStats = useTrimesterProgress();

  if (!progressStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Trimester Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { currentSession } = progressStats;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Trimester Progress
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {formatBadgeDate(currentSession.date)}
          {' • '}
          {currentSession.sessionIndicator}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trimester Timeline */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Week
              {' '}
              {currentSession.weekOfTrimester}
              {' '}
              of
              {' '}
              {currentSession.totalWeeks}
            </span>
          </div>
          <TrimesterTimelineBar
            weekOfTrimester={currentSession.weekOfTrimester}
            totalWeeks={currentSession.totalWeeks}
          />
        </div>
      </CardContent>
    </Card>
  );
}
