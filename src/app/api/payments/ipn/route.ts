import { NextRequest, NextResponse } from 'next/server';
import { pesapal } from '@/lib/pesapal';

export async function POST(request: NextRequest) {
  try {
    const ipnData = await request.json();
    
    console.log('📨 IPN Received:', {
      OrderTrackingId: ipnData.OrderTrackingId,
      OrderMerchantReference: ipnData.OrderMerchantReference,
      Status: ipnData.Status
    });

    // Verify the payment status with Pesapal
    const orderStatus = await pesapal.getOrderStatus(ipnData.OrderTrackingId);

    console.log('🔍 Order status from Pesapal:', orderStatus);

    // Update the donation record in database
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/donations`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donationId: ipnData.OrderMerchantReference, // This is our database ID
        status: ipnData.Status, // 'COMPLETED', 'FAILED', etc.
        pesapalData: orderStatus // Full Pesapal response
      }),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('❌ Failed to update donation status:', updateResult.error);
    } else {
      console.log('✅ Donation status updated successfully');
    }

    return NextResponse.json({ 
      success: true,
      message: 'IPN processed successfully',
      donationUpdated: updateResult.success
    });

  } catch (error: any) {
    console.error('💥 IPN error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'IPN processing failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
