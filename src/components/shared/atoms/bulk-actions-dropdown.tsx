import { useState } from 'react';
import { MoreActionsDropdown } from '@/components/shared/atoms/more-actions-dropdown';
import { OverdueTasksDialog } from '@/components/shared/dialogs/OverdueTasksDialog';

export function BulkActionsDropdown({ overdueCount, onCompleteAll }: { overdueCount: number; onCompleteAll: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <MoreActionsDropdown
        actions={[{
          label: 'Complete overdue tasks',
          onClick: () => setDialogOpen(true),
        }]}
        triggerText="Bulk Actions"
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
