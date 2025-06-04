import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

// For migrations
const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

// For query purposes
const queryClient = postgres(env.DATABASE_URL);

export const db = drizzle(queryClient);

// For migrations
export const migrationDb = drizzle(migrationClient);
