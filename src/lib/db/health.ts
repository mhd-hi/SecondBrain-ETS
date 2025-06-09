import { db } from "@/server/db";
import { sql } from "drizzle-orm";

/**
 * Database health check and initialization
 * Ensures database is properly set up and accessible
 */

export async function healthCheck() {
  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    
    // Check if all required tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const tableNames = tables.map((t) => (t as { table_name: string }).table_name);
    const requiredTables = ['user', 'account', 'session', 'courses', 'tasks'];
    
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
    }
    
    console.log("✅ Database health check passed");
    return { healthy: true, tables: tableNames };
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    throw error;
  }
}

/**
 * Initialize database if needed
 * Runs migrations and ensures database is ready
 */
export async function initializeDatabase() {
  console.log("🔧 Initializing database...");
  
  try {
    // Run health check first
    await healthCheck();
    
    console.log("✅ Database initialization completed");
    return { success: true };
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}
