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

interface TaskStatusChangerProps {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
}

const STATUS_CONFIG = {
  [TaskStatus.DRAFT]: {
    label: "DRAFT",
    bgColor: "bg-gray-500",
    textColor: "text-gray-50",
  },
  [TaskStatus.PENDING]: {
    label: "PENDING",
    bgColor: "bg-blue-500",
    textColor: "text-white",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "IN PROGRESS",
    bgColor: "bg-orange-500",
    textColor: "text-white",
  },
  [TaskStatus.COMPLETED]: {
    label: "COMPLETED",
    bgColor: "bg-green-500",
    textColor: "text-white",
  },
} as const;

const STATUS_ORDER = [
  TaskStatus.DRAFT,
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
] as const;

const TaskStatusChanger = ({ currentStatus, onStatusChange }: TaskStatusChangerProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleArrowClick = () => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    onStatusChange(STATUS_ORDER[nextIndex]!);
  };

  const handleDropdownSelect = (status: TaskStatus) => {
    onStatusChange(status);
    setIsDropdownOpen(false);
  };

  const config = STATUS_CONFIG[currentStatus];

  return (
    <div
      className={cn(
        "flex items-center h-10 rounded-full overflow-hidden",
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
              "flex-1 min-w-0 px-3 h-full flex items-center",
              config.textColor,
              "font-medium text-sm uppercase",
              "hover:bg-black/5 focus:outline-none"
            )}
            aria-label="Change task status"
          >
            {config.label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
        >
          {STATUS_ORDER.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleDropdownSelect(status)}
              className={cn(
                "h-10 px-4",
                STATUS_CONFIG[status].bgColor,
                STATUS_CONFIG[status].textColor,
                "font-medium text-sm uppercase",
                "hover:bg-black/5 focus:outline-none",
                "cursor-pointer"
              )}
            >
              {STATUS_CONFIG[status].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-10 h-10 flex items-center justify-center border-l border-gray-300">
        <button
          onClick={handleArrowClick}
          className={cn(
            "w-full h-full flex items-center justify-center",
            "hover:bg-black/5 focus:outline-none",
            "transition-colors"
          )}
          aria-label="Cycle to next status"
        >
          <ChevronRight className="w-3 h-3 text-gray-900" />
        </button>
      </div>
    </div>
  );
};

export { TaskStatusChanger }; 