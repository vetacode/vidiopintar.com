import { NextResponse } from 'next/server';
import { paymentSettingsRepository } from '@/lib/db/repository/payment-settings';

export async function GET() {
  try {
    const settings = await paymentSettingsRepository.getActive();
    
    if (!settings) {
      return NextResponse.json(null);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { bankName, bankAccountNumber, bankAccountName, whatsappPhoneNumber, whatsappMessageTemplate } = body;
    
    if (!bankName || !bankAccountNumber || !bankAccountName || !whatsappPhoneNumber || !whatsappMessageTemplate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const settings = await paymentSettingsRepository.create({
      bankName,
      bankAccountNumber,
      bankAccountName,
      whatsappPhoneNumber,
      whatsappMessageTemplate
    });

    return NextResponse.json(settings, { status: 201 });
  } catch (error) {
    console.error('Error creating payment settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Settings ID is required' }, { status: 400 });
    }

    const settings = await paymentSettingsRepository.update(id, updateData);
    
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}