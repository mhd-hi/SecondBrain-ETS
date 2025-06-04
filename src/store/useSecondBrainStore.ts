import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course, Draft } from '@/types/course';

export interface Subtask {
  title: string;
  estimatedEffort: number;
  notes?: string;
  tags: string[];
}

export interface SecondBrainState {
  courses: Course[];
  draftsByCourse: Record<string, Draft[]>;
  addCourse: (course: Course) => void;
  updateDraft: (courseId: string, draftId: string, updates: Partial<Draft>) => void;
  removeDraft: (courseId: string, draftId: string) => void;
  acceptDraft: (courseId: string, draft: Draft) => void;
  addDrafts: (courseId: string, drafts: Draft[]) => void;
}

type StateData = Pick<SecondBrainState, 'courses' | 'draftsByCourse'>;

const initialState: StateData = {
  courses: [],
  draftsByCourse: {},
};

export const useSecondBrainStore = create<SecondBrainState>()(
  persist(
    (set) => ({
      ...initialState,
      addCourse: (course) =>
        set((state: StateData) => ({
          courses: [...state.courses, course],
        })),
      updateDraft: (courseId, draftId, updates) =>
        set((state: StateData) => {
          const currentDrafts = state.draftsByCourse[courseId] ?? [];
          return {
            draftsByCourse: {
              ...state.draftsByCourse,
              [courseId]: currentDrafts.map((draft: Draft) =>
                draft.id === draftId ? { ...draft, ...updates } : draft
              ),
            },
          };
        }),
      removeDraft: (courseId, draftId) =>
        set((state: StateData) => {
          const currentDrafts = state.draftsByCourse[courseId] ?? [];
          return {
            draftsByCourse: {
              ...state.draftsByCourse,
              [courseId]: currentDrafts.filter((draft: Draft) => draft.id !== draftId),
            },
          };
        }),
      acceptDraft: (courseId, draft) =>
        set((state: StateData) => {
          const currentDrafts = state.draftsByCourse[courseId] ?? [];
          return {
            draftsByCourse: {
              ...state.draftsByCourse,
              [courseId]: currentDrafts.filter((d: Draft) => d.id !== draft.id),
            },
          };
        }),
      addDrafts: (courseId, drafts) =>
        set((state: StateData) => {
          const currentDrafts = state.draftsByCourse[courseId] ?? [];
          return {
            draftsByCourse: {
              ...state.draftsByCourse,
              [courseId]: [...currentDrafts, ...drafts],
            },
          };
        }),
    }),
    {
      name: 'second-brain-storage',
    },
  ),
); 