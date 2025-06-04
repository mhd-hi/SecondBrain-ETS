import { Sidebar } from "@/components/sidebar";

interface Course {
  id: string;
  code: string;
  name: string;
  inProgressCount: number;
}

async function getCourses(): Promise<Course[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }
  
  return res.json() as Promise<Course[]>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <main className="container py-6">{children}</main>
    </div>
  );
} 