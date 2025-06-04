import { AddCourseForm } from './components/AddCourseForm';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center gap-8 p-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        SecondBrain Dashboard
      </h1>
      <AddCourseForm />
      <div className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Course cards will be added here in future sprints */}
      </div>
    </main>
  );
}
