import { cleanupOldCourses } from "@/server/db/queries";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const deletedRecords = await cleanupOldCourses();
    return NextResponse.json({ 
      success: true, 
      message: "Cleanup completed",
      deletedRecords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error cleaning up old records:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cleanup records" },
      { status: 500 }
    );
  }
} 