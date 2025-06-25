import { defineConfig } from 'drizzle-kit';
import { env } from './src/lib/env/server';

export default defineConfig({
  schema: './src/lib/db/schema/*.ts',
  out: './src/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
  },
});
