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
      // disable when there are no overdue tasks
      // pass a title to provide accessible explanation on hover/focus
      // Radix DropdownMenuItem supports the `disabled` prop which maps to data-[disabled]
      // We include it in the shape even though DropdownAction type doesn't list it explicitly
      // so spread/spare props will be forwarded via MoreActionsDropdown
      // We'll rely on TypeScript structural typing to allow this at runtime.
      disabled: overdueCount === 0,
      title: overdueCount === 0 ? 'No overdue tasks to complete' : undefined,
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
