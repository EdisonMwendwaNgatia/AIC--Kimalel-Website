import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const donationData = await request.json();

    const { data, error } = await supabase
      .from('donations')
      .insert([{
        full_name: donationData.fullName,
        email: donationData.email,
        phone_number: donationData.phoneNumber,
        amount: donationData.amount,
        message: donationData.message,
        payment_method: donationData.paymentMethod,
        transaction_id: donationData.transactionId,
        mpesa_receipt: donationData.mpesaReceipt,
        bank_reference: donationData.bankReference,
        payment_status: donationData.paymentStatus,
        currency: donationData.currency,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Donation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
