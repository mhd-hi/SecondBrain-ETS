import { useCalendar } from '@/calendar/contexts/calendar-context';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function UserSelect() {
  const { users, selectedUserId, setSelectedUserId } = useCalendar();
  const userList = users ?? [];

  return (
    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
              {userList.map(user => (
                <span key={`${user.id}-initial`}>{user.name[0]}</span>
              ))}
            All
          </div>
        </SelectItem>

        {userList.map(user => (
          <SelectItem key={user.id} value={user.id} className="flex-1">
            <div className="flex items-center gap-2">
                <span>{user.name[0]}</span>
              <p className="truncate">{user.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
