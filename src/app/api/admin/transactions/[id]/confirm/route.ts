import { NextResponse } from 'next/server';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { requireAdmin } from '@/lib/auth-admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const transaction = await transactionsRepository.getById(id);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction is not pending' }, { status: 400 });
    }

    const updatedTransaction = await transactionsRepository.updateStatus(
      id, 
      'confirmed', 
      new Date()
    );

    return NextResponse.json(updatedTransaction);
  } catch (error: any) {
    if (error.message === 'REDIRECT') {
      return NextResponse.redirect('/home');
    }
    console.error('Error confirming transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}