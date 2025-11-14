import { NextRequest, NextResponse } from 'next/server';
import { pesapal } from '@/lib/pesapal';

export async function POST(request: NextRequest) {
  try {
    const { amount, email, phone, name, description, merchantReference } = await request.json();

    // Validate required fields
    if (!amount || !email || !name) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: amount, email, and name are required' 
        },
        { status: 400 }
      );
    }

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || 'User';

    console.log('🛒 Creating Pesapal order for:', {
      email,
      amount,
      merchantReference
    });

    const order = {
      currency: 'KES',
      amount: parseFloat(amount),
      description: description || 'Church Donation',
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/donation/success`,
      notification_id: process.env.PESAPAL_IPN_URL!,
      billing_address: {
        email_address: email,
        phone_number: phone || '',
        country_code: 'KE',
        first_name: firstName,
        last_name: lastName,
      },
    };

    const paymentResponse = await pesapal.submitOrder(order);

    console.log('✅ Pesapal order created:', {
      order_tracking_id: paymentResponse.order_tracking_id,
      redirect_url: paymentResponse.redirect_url ? 'Yes' : 'No'
    });

    return NextResponse.json({
      success: true,
      data: paymentResponse,
    });

  } catch (error: any) {
    console.error('❌ Payment order error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create payment order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
