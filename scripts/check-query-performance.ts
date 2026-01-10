#!/usr/bin/env bun
import { sql } from 'drizzle-orm';
import { db } from '../src/server/db/index';

async function checkPerformance() {
    const courseId = 'c8c978c5-e0be-4360-8301-68c2521d5adb';
    const userId = '6336d9c3-4190-4d87-a263-e61bd5e0c1e7';

    console.log('Checking query performance...\n');

    // Check indexes
    console.log('Indexes on tasks table:');
    const indexes = await db.execute(sql`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'tasks'
    ORDER BY indexname;
  `);
    console.table(indexes);

    // Explain the main query
    console.log('\nQuery plan for tasks query:');
    const plan = await db.execute(sql`
    EXPLAIN ANALYZE 
    SELECT t.* 
    FROM "tasks" t
    WHERE t.course_id = ${courseId} 
    AND t.user_id = ${userId}
    ORDER BY t.due_date;
  `);
    for (const row of plan) {
        console.log(row['QUERY PLAN']);
    }

    // Time the actual query
    console.log('\n\nTiming tasks query...');
    const start = performance.now();
    const result = await db.execute(sql`
    SELECT t.id, t.course_id, t.title, t.notes, t.type, t.status, 
           t.estimated_effort, t.actual_effort, t.due_date
    FROM "tasks" t
    WHERE t.course_id = ${courseId} 
    AND t.user_id = ${userId}
    ORDER BY t.due_date;
  `);
    const end = performance.now();
    console.log(`Query returned ${result.length} rows in ${(end - start).toFixed(2)}ms`);

    process.exit(0);
}

checkPerformance().catch(console.error);
