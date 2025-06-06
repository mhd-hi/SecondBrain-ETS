"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatus } from "@/types/task";
import { STATUS_CONFIG, STATUS_ORDER, getNextStatus, isValidStatus } from "@/lib/task/util";

interface TaskStatusChangerProps {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
}

const TaskStatusChanger = ({ currentStatus, onStatusChange }: TaskStatusChangerProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleArrowClick = () => {
    onStatusChange(getNextStatus(currentStatus));
  };

  const handleDropdownSelect = (status: TaskStatus) => {
    onStatusChange(status);
    setIsDropdownOpen(false);
  };

  // Ensure currentStatus is a valid TaskStatus
  const validStatus = isValidStatus(currentStatus) ? currentStatus : TaskStatus.DRAFT;
  const config = STATUS_CONFIG[validStatus];

  return (
    <div
      className={cn(
        "inline-flex items-center h-8 rounded-md overflow-hidden",
        config.bgColor,
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
      role="group"
      aria-label="Task status changer"
    >
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "px-3 h-full flex items-center",
              config.textColor,
              "font-medium text-xs uppercase",
              "hover:bg-black/5 focus:outline-none"
            )}
            aria-label="Change task status"
          >
            {config.label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[var(--radix-dropdown-menu-trigger-width)] p-0"
        >
          {STATUS_ORDER.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleDropdownSelect(status)}
              className={cn(
                "h-8 px-4",
                STATUS_CONFIG[status].bgColor,
                STATUS_CONFIG[status].textColor,
                "font-medium text-xs uppercase",
                "hover:bg-black/5 focus:outline-none",
                "cursor-pointer"
              )}
            >
              {STATUS_CONFIG[status].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={handleArrowClick}
        className={cn(
          "h-full flex items-center justify-center px-2",
          "hover:bg-black/5 focus:outline-none",
          "transition-colors"
        )}
        aria-label="Cycle to next status"
      >
        <ChevronRight className="w-2.5 h-2.5 text-gray-900" />
      </button>
    </div>
  );
};

export { TaskStatusChanger }; 