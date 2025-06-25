import { Pool } from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { env } from '../env/server';

declare global {
  var pg: Pool | undefined;
}

// For server components and API routes
let pool: Pool;

const databaseUrl = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

if (env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // In development, we can reuse the same pool
  if (!global.pg) {
    global.pg = new Pool({
      connectionString: databaseUrl,
      ssl: false, // Disable SSL for local development
    });
  }
  pool = global.pg;
}

// Create a SQL client for server components
export const db = drizzlePg(pool);

// Create a SQL client for edge runtime (Neon only)
export const dbEdge = () => {
  if (!databaseUrl.includes('neon.tech')) {
    throw new Error('dbEdge is only supported for Neon databases');
  }
  const sql = neon(databaseUrl);
  return drizzle(sql);
};


