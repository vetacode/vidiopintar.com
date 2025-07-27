import { NextResponse } from 'next/server';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planType, amount, currency = 'IDR', paymentSettings } = body;
    
    if (!planType || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Generate unique transaction reference
    const transactionReference = await transactionsRepository.generateUniqueReference();

    // Get user agent and IP from request headers
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined;

    const transaction = await transactionsRepository.create({
      userId: session.user.id,
      planType,
      amount,
      currency,
      transactionReference,
      paymentSettings: paymentSettings ? JSON.stringify(paymentSettings) : undefined,
      userAgent,
      ipAddress,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const transactions = await transactionsRepository.getByUserId(session.user.id, limit);
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}