"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Draft } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { ModifyPanel } from './ModifyPanel';

interface DraftCardProps {
  draft: Draft;
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
  const handleDelete = () => onDelete(draft.id);

  const handleSave = async (updatedDraft: Partial<Draft>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDraft),
      });

      if (!response.ok) {
        throw new Error('Failed to update draft');
      }

      toast.success('Brouillon mis à jour', {
        description: `"${draft.title}" a été mis à jour`,
      });
      onModify(draft.id);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating draft:', error);
      toast.error('Échec de la mise à jour', {
        description: 'Une erreur est survenue lors de la mise à jour du brouillon',
      });
    } finally {
      setIsLoading(false);
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
              {draft.tags && draft.tags.length > 0 && (
                <>
                  <span>•</span>
                  <Tag className="h-4 w-4" />
                  <span>{draft.tags.join(', ')}</span>
                </>
              )}
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
              onClick={handleDelete}
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
              draft={draft}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
