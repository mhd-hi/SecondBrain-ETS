import { Sidebar } from "./sidebar";
import { headers } from "next/headers";

async function getCourses() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  const res = await fetch(`${protocol}://${host}/api/courses`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }
  
  return res.json() as Promise<Array<{ id: string; code: string; name: string; inProgressCount: number }>>;
}

export async function SidebarWrapper() {
  const courses = await getCourses();
  return <Sidebar courses={courses} />;
} 