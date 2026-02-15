import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDueDate } from '@/lib/utils/date-util';

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
        className="flex flex-col items-center gap-4 p-6"
      >
        <DialogHeader className="w-full text-center">
          <DialogTitle className="mb-2 text-lg font-semibold">Complete All Overdue Tasks</DialogTitle>
          <DialogDescription className="mb-4 text-base">
            <span className="block mb-2 text-sm text-muted-foreground">
              Complete All will mark TODO
              tasks as DONE, while preserving any IN-PROGRESS work.
            </span>
          </DialogDescription>
        </DialogHeader>
        {overdueTasks && overdueTasks.length > 0 && (
          <div className="w-full max-h-96 overflow-y-auto border rounded bg-muted p-2 mb-2">
            <div className="text-sm font-medium mb-2 text-left">
              {`${overdueCount} affected tasks`}
            </div>
            <ul className="list-disc pl-5 text-left">
              {overdueTasks
                ?.sort((a, b) => {
                  const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                  const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                  return aDate - bDate;
                })
                .map(task => (
                <li key={task.id} className="mb-1">
                  <span className="font-light">{task.title}</span>
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDueDate(task.dueDate)}
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
