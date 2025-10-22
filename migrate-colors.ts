import { sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { courses } from '@/server/db/schema';

async function migrateColors() {
    console.log('Starting color migration...');

    try {
        // Update hex colors to random valid enum colors
        const result = await db.execute(sql`
      UPDATE ${courses}
      SET color = CASE floor(random() * 7)
        WHEN 0 THEN 'blue'
        WHEN 1 THEN 'green'
        WHEN 2 THEN 'red'
        WHEN 3 THEN 'yellow'
        WHEN 4 THEN 'purple'
        WHEN 5 THEN 'orange'
        ELSE 'gray'
      END
      WHERE color LIKE '#%'
    `);

        console.log('Color migration completed successfully!');
        console.log('Result:', result);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

migrateColors().catch(console.error);
