'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type OverdueBadgeProps = {
  count: number;
  variant: 'yellow' | 'red';
  tooltipText: string;
};

export function OverdueBadge({ count, variant, tooltipText }: OverdueBadgeProps) {
  const badgeColor = variant === 'yellow' ? 'bg-yellow-500/70' : 'bg-red-500/70';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-xs text-destructive-foreground inline-flex items-center justify-center mt-[-1px] ${badgeColor}`}
          >
            {count}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
