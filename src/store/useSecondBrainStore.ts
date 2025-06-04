import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  code: string;
  term: string;
}

export interface Draft {
  id: string;
  courseId: string;
  week: number;
  type: 'theorie' | 'pratique' | 'exam' | 'homework';
  title: string;
  estimatedEffort: number;
  suggestedDueDate: string;
  notes: string;
  tags: string[];
  subtasks?: Array<{
    title: string;
    estimatedEffort: number;
    notes: string;
    tags: string[];
  }>;
}

interface SecondBrainState {
  courses: Course[];
  draftsByCourse: Record<string, Draft[]>;
  acceptedTasks: Draft[];
  addCourse: (course: Course, drafts: Draft[]) => void;
  updateDraft: (courseId: string, draftId: string, updates: Partial<Draft>) => void;
  removeDraft: (courseId: string, draftId: string) => void;
  acceptDraft: (courseId: string, draftId: string) => void;
  addDrafts: (courseId: string, drafts: Draft[]) => void;
}

export const useSecondBrainStore = create<SecondBrainState>()(
  persist(
    (set) => ({
      courses: [],
      draftsByCourse: {},
      acceptedTasks: [],

      addCourse: (course, drafts) =>
        set((state) => ({
          courses: [...state.courses, course],
          draftsByCourse: {
            ...state.draftsByCourse,
            [course.id]: drafts,
          },
        })),

      updateDraft: (courseId, draftId, updates) =>
        set((state) => {
          const currentDrafts = state.draftsByCourse[courseId] ?? [];
          return {
            draftsByCourse: {
              ...state.draftsByCourse,
              [courseId]: currentDrafts.map((draft) =>
                draft.id === draftId ? { ...draft, ...updates } : draft,
              ),
            },
          };
        }),

      removeDraft: (courseId, draftId) =>
        set((state) => {
          const currentDrafts = state.draftsByCourse[courseId] ?? [];
          return {
            draftsByCourse: {
              ...state.draftsByCourse,
              [courseId]: currentDrafts.filter((draft) => draft.id !== draftId),
            },
          };
        }),

      acceptDraft: (courseId, draftId) =>
        set((state) => {
          const currentDrafts = state.draftsByCourse[courseId] ?? [];
          const draft = currentDrafts.find((d) => d.id === draftId);
          if (!draft) return state;

          return {
            draftsByCourse: {
              ...state.draftsByCourse,
              [courseId]: currentDrafts.filter((d) => d.id !== draftId),
            },
            acceptedTasks: [...state.acceptedTasks, draft],
          };
        }),

      addDrafts: (courseId, drafts) =>
        set((state) => {
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