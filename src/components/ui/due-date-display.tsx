"use client";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatRelativeDate, formatTooltipDate, getDueDateColor } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface DueDateDisplayProps {
  date: Date;
  className?: string;
  showTooltip?: boolean;
}

export function DueDateDisplay({ date, className, showTooltip = true }: DueDateDisplayProps) {
  const relativeDate = formatRelativeDate(date);
  const tooltipDate = formatTooltipDate(date);
  const colorClass = getDueDateColor(date);

  if (!showTooltip) {
    return (
      <span className={cn(colorClass, "text-sm", className)}>
        {relativeDate}
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(colorClass, "text-sm", className)}>
            {relativeDate}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipDate}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}