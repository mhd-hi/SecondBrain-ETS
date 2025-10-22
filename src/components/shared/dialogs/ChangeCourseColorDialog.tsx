'use client';

import type { TCourseColor } from '@/types/colors';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCourse } from '@/hooks/use-course';

type Props = {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentColor: TCourseColor;
  onUpdated?: (newColor: TCourseColor) => void;
};

export const ChangeCourseColorDialog = ({ courseId, open, onOpenChange, currentColor, onUpdated }: Props) => {
  const [pendingColor, setPendingColor] = useState<TCourseColor>(currentColor ?? 'blue');
  const [isSaving, setIsSaving] = useState(false);

  const { updateCourseColor } = useCourse(courseId);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await updateCourseColor(pendingColor);
      toast.success('Course color updated');
      onOpenChange(false);
      onUpdated?.(pendingColor);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update course color');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="color-course-description">
        <DialogHeader>
          <DialogTitle>Change Course Color</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <span className="text-xs">
            {'Color: '}
            {pendingColor}
          </span>
          <input
            type="color"
            value={pendingColor}
            onChange={e => setPendingColor(e.target.value as TCourseColor)}
            className="w-8 h-8 border-none cursor-pointer"
            aria-label="Pick course color"
            style={{ background: 'none' }}
          />

          <div className="flex gap-2 justify-end mt-4">
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleConfirm} disabled={isSaving}>Confirm</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeCourseColorDialog;
