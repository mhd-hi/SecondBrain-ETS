"use client";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatRelativeDate, formatTooltipDate, getDueDateColor } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

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
      <span className={cn(colorClass, "text-sm inline-flex items-center gap-1", className)}>
        <Calendar className="w-3 h-3" />
        {relativeDate}
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(colorClass, "text-sm inline-flex items-center gap-1", className)}>
            <Calendar className="w-3 h-3" />
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