'use client';

import type { TEvent } from '@/calendar/types';
import { format, parseISO } from 'date-fns';

import { Calendar, Clock, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getCoursePath } from '@/lib/routes';

type IProps = {
  event: TEvent;
  children: React.ReactNode;
};

export function EventDetailsDialog({ event, children }: IProps) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent
          aria-describedby="event-details-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {event.type === 'task' && event.courseId && (
              <div className="flex items-start gap-2">
                <ExternalLink className="mt-1 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Task Link</p>
                  <Link
                    href={`${getCoursePath(event.courseId)}#task-${event.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View task details
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm text-muted-foreground">{event.courseCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">{format(startDate, 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">{format(endDate, 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
            {event.description && (
              <div className="flex items-start gap-2">
                <FileText className="mt-1 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {/* TODO: change this to open dropdown that has TaskDialog and StudyBlockDialog
              <EditEventDialog event={event}>
              <Button type="button" variant="outline">
                Edit
              </Button>
            </EditEventDialog> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
