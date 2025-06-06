"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  title?: string;
  message: string;
  showBackButton?: boolean;
}

export function ErrorState({ 
  title = "Error", 
  message, 
  showBackButton = true 
}: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive">{title}</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
        {showBackButton && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
} 