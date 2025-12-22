import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type OverdueTask = {
  id: string;
  title: string;
  dueDate?: string;
};

export function OverdueTasksDialog({ open, onOpenChange, overdueCount, onCompleteAll, overdueTasks }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overdueCount: number;
  onCompleteAll: () => void;
  overdueTasks?: OverdueTask[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="complete-all-overdue-tasks-description"
        className="flex flex-col items-center gap-4 p-6"
      >
        <DialogHeader className="w-full text-center">
          <DialogTitle className="mb-2 text-lg font-semibold">Complete All Overdue Tasks</DialogTitle>
          <DialogDescription className="mb-4 text-base">
            <span className="block mb-2">
              {overdueCount === 1
                ? '1 overdue task needs your attention.'
                : `${overdueCount} overdue tasks need your attention.`}
            </span>
            <span className="block mb-2 text-sm text-muted-foreground">
              Complete All will mark TODO
              tasks as DONE, while preserving any IN-PROGRESS work.
            </span>
          </DialogDescription>
        </DialogHeader>
        {overdueTasks && overdueTasks.length > 0 && (
          <div className="w-full max-h-48 overflow-y-auto border rounded bg-muted p-2 mb-2">
            <div className="text-sm font-medium mb-2 text-left">Affected tasks:</div>
            <ul className="list-disc pl-5 text-left">
              {overdueTasks.map(task => (
                <li key={task.id} className="mb-1">
                  <span className="font-semibold">{task.title}</span>
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (Due:
                      {new Date(task.dueDate).toLocaleDateString()}
                      )
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter className="w-full flex justify-center gap-2 mt-2">
          <Button
            onClick={() => {
              onCompleteAll();
              onOpenChange(false);
            }}
            className="px-6"
          >
            Complete All
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
