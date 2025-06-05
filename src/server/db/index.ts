import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "@/server/db/schema";

// For migrations
const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

// For query purposes
const queryClient = postgres(env.DATABASE_URL);

export const db: PostgresJsDatabase<typeof schema> = drizzle(queryClient, { schema });

// For migrations
export const migrationDb = drizzle(migrationClient, { schema });
