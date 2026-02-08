import type { Config } from 'drizzle-kit';

import { env } from './src/env.js';

export default {
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schemaFilter: ['public'],
} satisfies Config;
