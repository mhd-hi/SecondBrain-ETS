import React from 'react';
import { Badge } from '@/components/ui/badge';

type StreakBadgeProps = {
  streak: number;
  className?: string;
};

export function StreakBadge({ streak, className = '' }: StreakBadgeProps) {
  if (streak <= 0) {
    return null;
  }

  return (
    <div className={`flex justify-start ${className}`}>
      <Badge variant="secondary" className="text-sm">
        🔥
        {' '}
        {streak}
        {' '}
        day streak
      </Badge>
    </div>
  );
}
