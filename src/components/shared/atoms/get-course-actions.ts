import type { DropdownAction } from '@/components/shared/atoms/actions-dropdown';

type CourseActionsConfig = {
  onDeleteCourse: () => void;
  onUpdateLinks?: () => void;
  onOpenColor?: () => void;
  onOpenDaypart?: () => void;
  overdueCount?: number;
};

export function getCourseActions(cfg: CourseActionsConfig): DropdownAction[] {
  const { onDeleteCourse, onUpdateLinks, onOpenColor, onOpenDaypart } = cfg;

  // Always return the full set of actions (no conditional removal).
  // Callers may pass real handlers or we fall back to no-ops.
  const actions: DropdownAction[] = [
    {
      label: 'Change color',
      onClick: onOpenColor ?? (() => { }),
    },
    {
      label: 'Change daypart',
      onClick: onOpenDaypart ?? (() => { }),
    },
    {
      label: 'Complete overdue tasks',
      onClick: () => { },
    },
    {
      label: 'Update links',
      onClick: onUpdateLinks ?? (() => { }),
    },
    {
      label: 'Delete course',
      onClick: onDeleteCourse ?? (() => { }),
      destructive: true,
    },
  ];

  return actions;
}
