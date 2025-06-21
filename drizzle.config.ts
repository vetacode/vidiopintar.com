import { defineConfig } from 'drizzle-kit';
import { env } from './src/lib/env/server';

export default defineConfig({
  schema: './src/lib/db/schema/*.ts',
  out: './src/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
