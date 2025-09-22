import { useState } from 'react';
import { MoreActionsDropdown } from '@/components/shared/atoms/more-actions-dropdown';
import { OverdueTasksDialog } from '@/components/shared/dialogs/OverdueTasksDialog';

type DropdownAction = {
  label: string;
  onClick: () => void;
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
  title?: string;
};

export function BulkActionsDropdown({
  overdueCount,
  onCompleteAll,
  onDeleteCourse,
  onAddLink,
}: {
  overdueCount: number;
  onCompleteAll: () => void;
  onDeleteCourse?: () => void;
  onAddLink?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const actions: DropdownAction[] = [

    {
      label: 'Complete overdue tasks',
      onClick: () => setDialogOpen(true),
      disabled: overdueCount === 0,
      title: overdueCount === 0 ? 'No overdue tasks to complete' : undefined,
    },
    {
      label: 'Add custom link',
      onClick: () => onAddLink && onAddLink(),
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
      <MoreActionsDropdown
        actions={fullActions}
        triggerText="Actions"
        contentAlign="end"
      />
      <OverdueTasksDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        overdueCount={overdueCount}
        onCompleteAll={onCompleteAll}
      />
    </>
  );
}
