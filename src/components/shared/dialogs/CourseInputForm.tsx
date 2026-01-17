import type { Daypart } from '@/types/course';
import type { AddCourseInputFormProps } from '@/types/dialog/add-course-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UNIVERSITY, UNIVERSITY_INFO } from '@/types/university';

export function CourseInputForm({
  courseCode,
  setCourseCode,
  term,
  setTerm,
  availableTerms,
  firstDayOfClass,
  setFirstDayOfClass,
  daypart,
  setDaypart,
  university,
  setUniversity,
  isProcessing,
  currentStep,
  onSubmit,
}: AddCourseInputFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === 'idle' && courseCode.trim()) {
          void onSubmit();
        }
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="courseCode">Course code :</Label>
          <div className="flex gap-2">
            <Input
              id="courseCode"
              value={courseCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                // Limit length to prevent excessively long inputs
                if (value.length <= 10) {
                  setCourseCode(value);
                }
              }}
              placeholder="e.g. MAT145, LOG210"
              disabled={isProcessing}
              maxLength={10}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter'
                  && currentStep === 'idle'
                  && courseCode.trim()
                ) {
                  e.preventDefault();
                  void onSubmit();
                }
              }}
            />
            {availableTerms.length > 0 && (
              <Select
                value={term}
                onValueChange={setTerm}
                disabled={isProcessing}
              >
                <SelectTrigger aria-label="Term">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {availableTerms.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="university">School (optional) :</Label>
          <Select
            value={university}
            onValueChange={setUniversity}
            disabled={isProcessing}
          >
            <SelectTrigger aria-label="University">
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNIVERSITY.NONE}>
                {UNIVERSITY_INFO[UNIVERSITY.NONE].label}
              </SelectItem>
              <SelectItem value={UNIVERSITY.ETS}>
                {UNIVERSITY_INFO[UNIVERSITY.ETS].label}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstDayOfClass">First day of class :</Label>
          <div className={isProcessing ? 'pointer-events-none opacity-50' : ''}>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <DatePicker
                  date={firstDayOfClass}
                  onDateChange={setFirstDayOfClass}
                  className="w-full"
                />
              </div>
              <div className="w-max">
                <Select
                  value={daypart}
                  onValueChange={(v: Daypart | '') => setDaypart(v)}
                  disabled={isProcessing}
                >
                  <SelectTrigger aria-label="Daypart">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                    <SelectItem value="EVEN">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
