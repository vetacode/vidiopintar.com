import { NextResponse } from 'next/server';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { requireAdmin } from '@/lib/auth-admin';

export async function GET() {
  try {
    await requireAdmin();

    const transactions = await transactionsRepository.getAll(100);
    
    return NextResponse.json(transactions);
  } catch (error: any) {
    if (error.message === 'REDIRECT') {
      return NextResponse.redirect('/home');
    }
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}