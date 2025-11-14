import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const donationData = await request.json();

    console.log('💾 Saving donation to database:', {
      email: donationData.email,
      amount: donationData.amount,
      status: donationData.paymentStatus || 'pending'
    });

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
        payment_status: donationData.paymentStatus || 'pending', // Default to pending
        currency: donationData.currency || 'KES',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }

    console.log('✅ Donation saved successfully. ID:', data.id);
    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        transaction_id: data.transaction_id,
        payment_status: data.payment_status
      }
    });

  } catch (error: any) {
    console.error('💥 Donation API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { donationId, status, error: paymentError, pesapalData } = await request.json();

    console.log('🔄 Updating donation status:', {
      donationId,
      status,
      paymentError: paymentError ? 'Yes' : 'No'
    });

    const updateData: any = {
      payment_status: status,
      updated_at: new Date().toISOString()
    };

    // Add Pesapal data if provided
    if (pesapalData) {
      updateData.pesapal_data = pesapalData;
    }

    // Add error message if payment failed
    if (paymentError) {
      updateData.error_message = paymentError;
    }

    // Add transaction details if payment completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('donations')
      .update(updateData)
      .eq('id', donationId) // Use the database ID
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }

    console.log('✅ Donation status updated to:', status);
    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        payment_status: data.payment_status,
        updated_at: data.updated_at
      }
    });

  } catch (error: any) {
    console.error('💥 Update API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to retrieve donation by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get('id');
    
    if (!donationId) {
      return NextResponse.json({ 
        success: false,
        error: 'Donation ID is required' 
      }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();

    if (error) {
      console.error('❌ Get donation error:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error: any) {
    console.error('💥 Get API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
