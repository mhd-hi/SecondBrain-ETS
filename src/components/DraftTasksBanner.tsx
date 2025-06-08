"use client";

import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/task";

interface DraftTasksBannerProps {
    draftTasks: Task[];
    onAcceptAll: () => Promise<void>;
    onDeleteAll: () => Promise<void>;
    isLoading?: boolean;
}

export function DraftTasksBanner({
    draftTasks,
    onAcceptAll,
    onDeleteAll,
    isLoading = false
}: DraftTasksBannerProps) {
    if (draftTasks.length === 0) {
        return null;
    }

    const taskCount = draftTasks.length;

    return (
        <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
                {/* left side: icon + message */}
                <div className="flex items-center gap-2">
                    <AlertCircleIcon className="h-5 w-5" />
                    <span>
                        You have <strong>{taskCount}</strong> draft task
                        {taskCount !== 1 ? "s" : ""} awaiting your review.
                    </span>
                </div>

                {/* right side: buttons */}
                <div className="flex gap-2 ml-4">                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAcceptAll}
                        disabled={isLoading}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950 dark:border-green-800"
                    >
                        Accept All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDeleteAll}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 dark:border-red-800"
                    >
                        Delete All
                    </Button>
                </div>
            </AlertDescription>
        </Alert>

    );
}
