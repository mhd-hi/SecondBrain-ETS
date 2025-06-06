"use client";

import { useState } from "react";
import type { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { ModifyPanel } from './ModifyPanel';
import { handleConfirm } from "@/lib/dialog/util";
import { api, handleApiSuccess } from "@/lib/api/util";
import { withLoadingState } from "@/lib/loading/util";
import { ErrorHandlers, CommonErrorMessages } from "@/lib/error/util";

interface DraftCardProps {
  draft: Task;
  onAccept: (id: string) => void;
  onAcceptAll: (id: string) => void;
  onModify: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DraftCard = ({
  draft,
  onAccept,
  onAcceptAll,
  onModify,
  onDelete,
}: DraftCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleAccept = () => onAccept(draft.id);
  const handleAcceptAll = () => onAcceptAll(draft.id);
  const handleModify = () => setIsEditing(true);

  const handleDiscard = async () => {
    await handleConfirm(
      "Are you sure you want to delete this draft? This action cannot be undone.",
      async () => {
        try {
          await withLoadingState(
            async () => {
              await api.delete(`/api/tasks/${draft.id}`, CommonErrorMessages.DRAFT_DELETE_FAILED);
              handleApiSuccess('Draft deleted successfully');
              onDelete(draft.id);
            },
            setIsLoading
          );
        } catch (error) {
          ErrorHandlers.api(error, CommonErrorMessages.DRAFT_DELETE_FAILED, 'DraftCard');
        }
      }
    );
  };

  const handleSave = async (updatedDraft: Task) => {
    try {
      await withLoadingState(
        async () => {
          await api.patch(`/api/tasks/${draft.id}`, updatedDraft, CommonErrorMessages.DRAFT_UPDATE_FAILED);
          handleApiSuccess('Draft updated successfully');
          onModify(draft.id);
          setIsEditing(false);
        },
        setIsLoading
      );
    } catch (error) {
      ErrorHandlers.api(error, CommonErrorMessages.DRAFT_UPDATE_FAILED, 'DraftCard');
    }
  };

  return (
    <Card className="rounded-lg border bg-card p-4 shadow-sm">
      <CardHeader className="p-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{draft.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Week {draft.week}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAcceptAll}
              className="h-8 w-8"
              disabled={isLoading}
              aria-label="Accept all"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAccept}
              className="h-8 w-8"
              disabled={isLoading}
              aria-label="Accept"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleModify}
              className="h-8 w-8"
              disabled={isLoading}
              aria-label="Modify"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDiscard}
              className="h-8 w-8 text-destructive hover:text-destructive"
              disabled={isLoading}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <p className="text-sm text-muted-foreground">{draft.notes}</p>
        {isEditing && (
          <div className="mt-4 pt-4 border-t">
            <ModifyPanel
              task={draft}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
