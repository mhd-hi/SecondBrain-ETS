import type { TCourseColor } from '@/types/colors';
import type { Course } from '@/types/course';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COURSE_COLORS } from '@/lib/utils/colors-util';
import { COURSE_DAYPARTS } from '@/lib/utils/course-dayparts';

type UpdateCourseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  onUpdate: (updates: { color: TCourseColor; daypart: Course['daypart'] }) => Promise<void>;
};

export function CourseUpdateDialog({ open, onOpenChange, course, onUpdate }: UpdateCourseDialogProps) {
  const [color, setColor] = useState<TCourseColor>(course.color);
  const [daypart, setDaypart] = useState<Course['daypart']>(course.daypart);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onUpdate({ color, daypart });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Course Settings</DialogTitle>
          <DialogDescription>
            Customize your course settings such as color and daypart.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="update-course-color">Color</label>
            <Select value={color} onValueChange={v => setColor(v as TCourseColor)}>
              <SelectTrigger id="update-course-color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_COLORS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="update-course-daypart">Daypart</label>
            <Select value={daypart} onValueChange={v => setDaypart(v as Course['daypart'])}>
              <SelectTrigger id="update-course-daypart">
                <SelectValue placeholder="Select daypart" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_DAYPARTS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
