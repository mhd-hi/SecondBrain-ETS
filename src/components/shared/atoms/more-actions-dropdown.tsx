"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownAction {
  label: string;
  onClick: () => void;
  className?: string;
  destructive?: boolean;
}

interface MoreActionsDropdownProps {
  actions: DropdownAction[];
  triggerClassName?: string;
  contentAlign?: "start" | "center" | "end";
  className?: string;
}

export function MoreActionsDropdown({
  actions,
  triggerClassName,
  contentAlign = "end",
  className,
}: MoreActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger        className={cn(
          "rounded-full bg-accent p-[6px] hover:bg-muted hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-opacity",
          triggerClassName
        )}
      >
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" aria-label="More actions" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={contentAlign} className={className}>
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            className={cn(
              action.destructive && "text-destructive focus:text-destructive",
              action.className
            )}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}