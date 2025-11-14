'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [donationData, setDonationData] = useState<any>(null);

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');

    if (orderTrackingId) {
      // Verify payment status
      verifyPaymentStatus(orderTrackingId);
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  const verifyPaymentStatus = async (orderTrackingId: string) => {
    try {
      const response = await fetch(`/api/payments/status?orderTrackingId=${orderTrackingId}`);
      const result = await response.json();

      if (result.success && result.data.status === 'COMPLETED') {
        setStatus('success');
        setDonationData(result.data);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Status verification error:', error);
      setStatus('failed');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary">Verifying Your Donation</h2>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-primary">Payment Failed</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            There was an issue processing your donation. Please try again.
          </p>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/give">Try Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-20">
      <div className="container mx-auto px-4 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">
          Thank You for Your Donation!
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your generous contribution will help support our church's mission and ministries.
        </p>

        {donationData && (
          <Card className="bg-card border-accent/20 max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-accent">Ksh {donationData.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="capitalize">{donationData.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-500 font-semibold">Completed</span>
                </div>
                {donationData.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-sm">{donationData.transaction_id}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/give">Make Another Donation</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
