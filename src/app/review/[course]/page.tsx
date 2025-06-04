"use client";

import { useSecondBrainStore } from "@/store/useSecondBrainStore";
import { useRouter } from "next/navigation";
import CourseSidebar from "@/components/CourseSidebar";
import WeekAccordion from "@/components/WeekAccordion";
import type { Draft } from "@/types/course";

interface ReviewQueueProps {
  params: { course: string };
}

export default function ReviewQueue({ params }: ReviewQueueProps) {
  const courseId = params.course;
  const router = useRouter();

  // Get state from Zustand store
  const courses = useSecondBrainStore((state) => state.courses);
  const draftsByCourse = useSecondBrainStore((state) => state.draftsByCourse);
  const acceptDraft = useSecondBrainStore((state) => state.acceptDraft);
  const removeDraft = useSecondBrainStore((state) => state.removeDraft);

  // Find the course
  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return (
      <div className="p-6">
        <p className="mb-4 text-red-600">
          Course not found: &quot;{courseId}&quot;.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded bg-blue-600 px-3 py-1 text-white transition-colors hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Get drafts for this course
  const drafts = draftsByCourse[courseId] ?? [];

  // Group drafts by week
  const draftsByWeek: Record<number, Draft[]> = {};
  drafts.forEach((d) => {
    draftsByWeek[d.week] ??= [];
    draftsByWeek[d.week]?.push(d);
  });

  // Handlers for global accept/discard
  const handleAcceptAllCourse = () => {
    drafts.forEach((d) => acceptDraft(courseId, d));
  };

  const handleDiscardAllCourse = () => {
    drafts.forEach((d) => removeDraft(courseId, d.id));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <CourseSidebar selectedCourseId={courseId} />

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-2xl font-bold">
            {course.code} - Review Queue
          </h1>

          {/* Global Buttons */}
          <div className="mb-8 flex gap-3">
            <button
              onClick={handleAcceptAllCourse}
              className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              Accept All Drafts
            </button>
            <button
              onClick={handleDiscardAllCourse}
              className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              Discard All Drafts
            </button>
          </div>

          {/* Week Accordions */}
          {Object.entries(draftsByWeek)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([weekStr, weekDrafts]) => {
              const week = Number(weekStr);
              return (
                <WeekAccordion
                  key={week}
                  courseId={courseId}
                  week={week}
                  drafts={weekDrafts}
                  onAcceptAll={() =>
                    weekDrafts.forEach((d) => acceptDraft(courseId, d))
                  }
                  onDiscardAll={() =>
                    weekDrafts.forEach((d) => removeDraft(courseId, d.id))
                  }
                />
              );
            })}
        </div>
      </main>
    </div>
  );
}
