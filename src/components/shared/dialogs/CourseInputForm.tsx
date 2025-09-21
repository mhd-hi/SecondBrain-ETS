import type { CourseInputFormProps } from './AddCourseDialog.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CourseInputForm({
  courseCode,
  setCourseCode,
  term,
  setTerm,
  availableTerms,
  isProcessing,
  currentStep,
  onSubmit,
}: CourseInputFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === 'idle' && courseCode.trim()) {
          void onSubmit();
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="courseCode">Course code: </Label>
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
            placeholder="(e.g. MAT145, LOG210)"
            disabled={isProcessing}
            maxLength={10}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentStep === 'idle' && courseCode.trim()) {
                e.preventDefault();
                void onSubmit();
              }
            }}
          />
          <select
            aria-label="Term"
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="px-2 py-1 rounded border bg-white"
            disabled={isProcessing}
          >
            {availableTerms.length > 0 && (
              availableTerms.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))
            )}
          </select>
        </div>
      </div>
    </form>
  );
}
