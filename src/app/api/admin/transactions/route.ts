import { NextResponse } from 'next/server';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { requireAdmin } from '@/lib/auth-admin';
import { 
  paymentLogger, 
  getSanitizedRequestMetadata, 
  logPaymentFailure 
} from '@/lib/utils/logger';

export async function GET(request: Request) {
  const requestMetadata = await getSanitizedRequestMetadata(request);
  
  try {
    const admin = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500); // Cap at 500

    const transactions = await transactionsRepository.getAll(limit);
    
    paymentLogger.info('Admin transactions list fetched', {
      adminId: admin.id,
      transactionCount: transactions.length,
      requestedLimit: limit,
    });
    
    return NextResponse.json(transactions);
  } catch (error: any) {
    if (error.message === 'REDIRECT') {
      paymentLogger.warn('Unauthorized admin transactions fetch attempt', requestMetadata);
      return NextResponse.redirect('/home');
    }
    
    logPaymentFailure('admin_transactions_fetch', error, {
      requestMetadata,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}