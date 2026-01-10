'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useCalendarViewStore } from '@/lib/stores/calendar-view-store';

export function ChangeBadgeVariantInput() {
  const badgeVariant = useCalendarViewStore(state => state.badgeVariant);
  const setBadgeVariant = useCalendarViewStore(state => state.setBadgeVariant);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Change badge variant</p>

      <Select value={badgeVariant} onValueChange={setBadgeVariant}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="dot">Dot</SelectItem>
          <SelectItem value="colored">Colored</SelectItem>
          <SelectItem value="mixed">Mixed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
