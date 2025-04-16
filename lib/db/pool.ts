import { Pool } from 'pg';
import 'dotenv/config';

// Declare global types for the connection pool
declare global {
  var pg: Pool | undefined;
}

let pool: Pool;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

if (process.env.NODE_ENV === 'production') {
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
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  pool = global.pg;
}

export { pool };
