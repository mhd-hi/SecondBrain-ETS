import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Clock } from "lucide-react";
import { POMODORO_DURATION_OPTIONS, formatTime } from "@/lib/pomodoro/constants";

interface DurationSelectorProps {
    duration: number;
    onDurationChange: (duration: number) => void;
    variant?: "large" | "small";
    className?: string;
}

export const DurationSelector = ({
    duration,
    onDurationChange,
    variant = "large",
    className = ""
}: DurationSelectorProps) => {
    if (variant === "large") {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={`text-3xl font-mono font-bold h-16 px-6 min-w-[120px] bg-transparent hover:bg-muted/20 ${className}`}
                    >
                        {formatTime(duration)}
                        <ChevronDown className="h-5 w-5 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {POMODORO_DURATION_OPTIONS.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onDurationChange(option.value)}
                            className={duration === option.value ? "bg-accent" : ""}
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Small variant for dialog
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`text-sm text-muted-foreground hover:text-foreground ${className}`}
                >
                    Duration: {Math.floor(duration)} min
                    <Clock className="h-4 w-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {POMODORO_DURATION_OPTIONS.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => onDurationChange(option.value)}
                        className={duration === option.value ? "bg-accent" : ""}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
