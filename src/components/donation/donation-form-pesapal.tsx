'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, Building, Loader2, CheckCircle } from 'lucide-react';

type PaymentMethod = 'mpesa' | 'card' | 'paypal';

interface DonationFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  amount: string;
  message: string;
  paymentMethod: PaymentMethod;
}

export default function DonationFormPesapal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [donationId, setDonationId] = useState('');
  const [formData, setFormData] = useState<DonationFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    amount: '',
    message: '',
    paymentMethod: 'mpesa'
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return `254${cleaned.substring(1)}`;
    }
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    if (cleaned.startsWith('7')) {
      return `254${cleaned}`;
    }
    return cleaned;
  };

  // Save donation to database with pending status
  const saveDonationToDatabase = async (): Promise<string> => {
    try {
      const tempTransactionId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          amount: parseFloat(formData.amount),
          message: formData.message,
          paymentMethod: formData.paymentMethod,
          transactionId: tempTransactionId,
          paymentStatus: 'pending',
          currency: 'KES'
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save donation');
      }

      console.log('✅ Donation saved to database with ID:', result.data.id);
      return result.data.id; // Return the database ID

    } catch (error) {
      console.error('❌ Database save error:', error);
      throw error;
    }
  };

  const handlePesapalPayment = async () => {
    setIsSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);
      if (amount < 10) {
        toast({
          title: "Invalid Amount",
          description: "Minimum donation amount is Ksh 10",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // STEP 1: First save to database with "pending" status
      console.log('💾 Saving donation to database...');
      const donationDbId = await saveDonationToDatabase();
      setDonationId(donationDbId);

      // STEP 2: Create payment order with Pesapal
      console.log('🔄 Creating Pesapal order...');
      const response = await fetch('/api/payments/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.amount,
          email: formData.email,
          phone: formatPhoneNumber(formData.phoneNumber),
          name: formData.fullName,
          description: formData.message || 'Church Donation',
          merchantReference: donationDbId, // Pass database ID to Pesapal
        }),
      });

      const result = await response.json();

      if (!result.success) {
        // Update database status to failed
        await updateDonationStatus(donationDbId, 'failed', result.error);
        throw new Error(result.error || 'Payment failed');
      }

      console.log('✅ Pesapal order created, redirecting...');
      setTransactionId(result.data.order_tracking_id);

      // STEP 3: Redirect to Pesapal payment page
      window.location.href = result.data.redirect_url;

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Update donation status in database
  const updateDonationStatus = async (id: string, status: string, error?: string) => {
    try {
      await fetch('/api/donations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationId: id,
          status: status,
          error: error
        }),
      });
    } catch (error) {
      console.error('Failed to update donation status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handlePesapalPayment();
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold font-headline text-primary mb-4">
          Donation Successful!
        </h2>
        <Card className="bg-card border-accent/20">
          <CardContent className="p-6">
            <div className="space-y-4 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Donation ID:</span>
                <span className="font-mono text-sm">{donationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-accent">Ksh {parseFloat(formData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{formData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-500 font-semibold">Completed</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-6">
              A confirmation email has been sent to {formData.email}
            </p>
          </CardContent>
        </Card>
        <Button 
          onClick={() => {
            setIsSuccess(false);
            setFormData({
              fullName: '',
              email: '',
              phoneNumber: '',
              amount: '',
              message: '',
              paymentMethod: 'mpesa'
            });
            setTransactionId('');
            setDonationId('');
          }}
          className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
        >
          Make Another Donation
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-left">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-left">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="bg-background border-border text-foreground focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-left">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                className="bg-background border-border text-foreground focus:ring-accent"
              />
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <Label htmlFor="phoneNumber" className="text-left">Phone Number *</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              placeholder="07XX XXX XXX"
              className="bg-background border-border text-foreground focus:ring-accent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Donation Amount */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-left">Donation Amount</h3>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-left">Amount (KES) *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="10"
              step="1"
              placeholder="Enter amount in Kenyan Shillings"
              className="bg-background border-border text-foreground focus:ring-accent"
            />
          </div>
          
          <div className="space-y-2 mt-4">
            <Label htmlFor="message" className="text-left">Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Specify purpose of donation (e.g., for renovations, missions, etc.)"
              rows={3}
              className="bg-background border-border text-foreground focus:ring-accent resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-left">Payment Method</h3>
          
          <RadioGroup 
            value={formData.paymentMethod} 
            onValueChange={(value: PaymentMethod) => handlePaymentMethodChange(value)}
            className="space-y-4"
          >
            {/* M-Pesa Option */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="mpesa" id="mpesa" />
              <Label htmlFor="mpesa" className="flex items-center space-x-3 cursor-pointer flex-1">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">M-Pesa</div>
                  <div className="text-sm text-muted-foreground">Pay via M-Pesa mobile money</div>
                </div>
              </Label>
            </div>

            {/* Card Payment Option */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer flex-1">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Credit/Debit Card</div>
                  <div className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or American Express</div>
                </div>
              </Label>
            </div>

            {/* PayPal Option */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="flex items-center space-x-3 cursor-pointer flex-1">
                <div className="w-5 h-5 bg-[#00457C] rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">PayPal</div>
                  <div className="text-sm text-muted-foreground">Pay with your PayPal account</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              All payments are securely processed through Pesapal. You'll be redirected to Pesapal's secure payment page to complete your donation.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        size="lg" 
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-shadow hover:shadow-lg hover:glow-gold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Donation...
          </>
        ) : (
          `Donate Ksh ${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}`
        )}
      </Button>
    </form>
  );
}
