import { defineConfig } from 'drizzle-kit';
import { env } from './lib/env/server';

console.log('env.DATABASE_URL', env.DATABASE_URL);

export default defineConfig({
  schema: './lib/db/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
