import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env';
import * as schema from '@/server/db/schema';

// For migrations
const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

// For query purposes - optimized with connection pooling
const queryClient = postgres(env.DATABASE_URL, {
    max: 10, // connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Disable prepared statements for serverless compatibility
});

export const db: PostgresJsDatabase<typeof schema> = drizzle(queryClient, { schema });

// For migrations
export const migrationDb = drizzle(migrationClient, { schema });
