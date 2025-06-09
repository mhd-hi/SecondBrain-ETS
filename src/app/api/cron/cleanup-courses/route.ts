import { cleanupOldCourses } from "@/server/db/queries";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // Basic API key authentication for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized",
          code: "CRON_UNAUTHORIZED" 
        },
        { status: 401 }
      );
    }

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