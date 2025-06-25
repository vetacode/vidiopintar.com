import { Pool } from 'pg';
import { env } from '../env/server';

// Declare global types for the connection pool
declare global {
  var pg: Pool | undefined;
}

let pool: Pool;
const databaseUrl = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

if (env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  if (!global.pg) {
    global.pg = new Pool({
      connectionString: databaseUrl,
      ssl: false, // Disable SSL for local development
    });
  }
  pool = global.pg;
}

export { pool };
