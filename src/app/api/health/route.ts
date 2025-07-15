import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 8000);
    });
    
    const dbQuery = db.execute(sql`SELECT 1`);
    
    await Promise.race([dbQuery, timeoutPromise]);
    
    return NextResponse.json({ status: 'ok', message: 'Application and database are healthy' });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        dbConfig: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USER,
          database: process.env.DB_NAME,
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
}
