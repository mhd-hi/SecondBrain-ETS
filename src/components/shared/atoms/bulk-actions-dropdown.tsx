import { useState } from 'react';
import { MoreActionsDropdown } from '@/components/shared/atoms/more-actions-dropdown';
import { OverdueTasksDialog } from '@/components/shared/dialogs/OverdueTasksDialog';

type DropdownAction = {
  label: string;
  onClick: () => void;
  className?: string;
  destructive?: boolean;
};

export function BulkActionsDropdown({
  overdueCount,
  onCompleteAll,
  onDeleteCourse,
}: {
  overdueCount: number;
  onCompleteAll: () => void;
  onDeleteCourse?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const actions: DropdownAction[] = [
    {
      label: 'Complete overdue tasks',
      onClick: () => setDialogOpen(true),
    },
  ];

  // Add delete action if a handler was provided
  const fullActions: DropdownAction[] = onDeleteCourse
    ? [
        ...actions,
        {
          label: 'Delete course',
          onClick: onDeleteCourse,
          destructive: true,
        },
      ]
    : actions;

  return (
    <>
      <MoreActionsDropdown actions={fullActions} triggerText="Bulk Actions" contentAlign="end" />
      <OverdueTasksDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        overdueCount={overdueCount}
        onCompleteAll={onCompleteAll}
      />
    </>
  );
}
