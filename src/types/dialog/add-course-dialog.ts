import type { UseAddCourseReturn } from '@/hooks/use-add-course';
import type { Daypart } from '@/types/course';

export type StepName = 'planets' | 'openai' | 'create-course' | 'create-tasks';

export type ProcessingStepsProps = {
  currentStep: UseAddCourseReturn['currentStep'];
  stepStatus: UseAddCourseReturn['stepStatus'];
};

export type ActionButtonsProps = {
  currentStep: UseAddCourseReturn['currentStep'];
  existingCourse: { id: string; code: string; name: string } | null;
  isCheckingExistence: boolean;
  courseCode: string;
  isProcessing: boolean;
  parsedData: UseAddCourseReturn['parsedData'];
  createdCourseId: UseAddCourseReturn['createdCourseId'];
  onStartParsing: () => Promise<void>;
  onRetry: () => void;
  onTryDifferentCourse: () => void;
  onGoToExistingCourse: () => void;
  onDialogClose: (open: boolean) => void;
  onGoToCourse: () => void;
};

export type AddCourseInputFormProps = {
  courseCode: string;
  setCourseCode: (code: string) => void;
  term: string;
  setTerm: (term: string) => void;
  availableTerms: Array<{ id: string; label: string }>;
  firstDayOfClass: Date | undefined;
  setFirstDayOfClass: (date: Date | undefined) => void;
  daypart: Daypart | '';
  setDaypart: (daypart: Daypart | '') => void;
  university: string;
  setUniversity: (university: string) => void;
  userContext: string;
  setUserContext: (context: string) => void;
  isProcessing: boolean;
  currentStep: UseAddCourseReturn['currentStep'];
  onSubmit: () => Promise<void>;
};
