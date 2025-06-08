"use client";

import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/task";

interface OverdueTasksBannerProps {
    overdueTasks: Task[];
    onCompleteAll: () => Promise<void>;
    isLoading?: boolean;
}

export function OverdueTasksBanner({
    overdueTasks,
    onCompleteAll,
    isLoading = false
}: OverdueTasksBannerProps) {
    if (overdueTasks.length === 0) {
        return null;
    }

    const taskCount = overdueTasks.length;

    return (
        <Alert variant="default" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
                {/* left side: icon + message */}
                <div className="flex items-center gap-2">
                    <AlertCircleIcon className="h-5 w-5" />
                    <span className="">
                        You have <strong>{taskCount}</strong> overdue task
                        {taskCount !== 1 ? "s" : ""} that need attention.
                    </span>
                </div>

                {/* right side: button */}
                <div className="flex gap-2 ml-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCompleteAll}
                        disabled={isLoading}
                        className="text-yellow-600 hover:text-yellow-600 border border-yellow-500"
                    >
                        Complete All Overdue
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}
