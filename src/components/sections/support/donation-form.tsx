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

type PaymentMethod = 'mpesa' | 'card' | 'bank';

interface DonationFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  amount: string;
  message: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  bankReference?: string;
}

export default function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
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
    // Format Kenyan phone numbers
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

  const simulatePayment = async (): Promise<{ success: boolean; transactionId: string; receipt?: string }> => {
    // Simulate payment processing - replace with actual payment gateway integration
    return new Promise((resolve) => {
      setTimeout(() => {
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        if (formData.paymentMethod === 'mpesa') {
          resolve({
            success: true,
            transactionId,
            receipt: `MP${Date.now()}`
          });
        } else if (formData.paymentMethod === 'card') {
          resolve({
            success: true,
            transactionId
          });
        } else {
          resolve({
            success: true,
            transactionId,
            receipt: `BANK${Date.now()}`
          });
        }
      }, 3000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (amount < 10) {
        toast({
          title: "Invalid Amount",
          description: "Minimum donation amount is Ksh 10",
          variant: "destructive"
        });
        return;
      }

      // Format phone number for M-Pesa
      const formattedPhone = formData.paymentMethod === 'mpesa' ? formatPhoneNumber(formData.phoneNumber) : formData.phoneNumber;

      // Simulate payment processing
      const paymentResult = await simulatePayment();

      if (!paymentResult.success) {
        throw new Error('Payment processing failed');
      }

      // Submit donation to database
      const donationData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formattedPhone,
        amount: amount,
        message: formData.message,
        paymentMethod: formData.paymentMethod,
        transactionId: paymentResult.transactionId,
        mpesaReceipt: formData.paymentMethod === 'mpesa' ? paymentResult.receipt : undefined,
        bankReference: formData.paymentMethod === 'bank' ? formData.bankReference : undefined,
        paymentStatus: 'completed' as const,
        currency: 'KES'
      };

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        throw new Error('Failed to save donation');
      }

      setTransactionId(paymentResult.transactionId);
      setIsSuccess(true);

      toast({
        title: "Donation Successful!",
        description: `Thank you for your donation of Ksh ${amount.toLocaleString()}`,
        variant: "default"
      });

    } catch (error) {
      console.error('Donation error:', error);
      toast({
        title: "Donation Failed",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="py-20 bg-secondary">
        <div className="section-divider mb-20"></div>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold font-headline text-primary mb-4">
              Donation Successful!
            </h2>
            <Card className="bg-card border-accent/20">
              <CardContent className="p-6">
                <div className="space-y-4 text-left">
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
              }}
              className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
            >
              Make Another Donation
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary">
      <div className="section-divider mb-20"></div>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold font-headline text-primary mb-4">
          Make a Donation
        </h2>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-8 space-y-6">
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

                {/* Bank Transfer Option */}
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex items-center space-x-3 cursor-pointer flex-1">
                    <Building className="w-5 h-5 text-purple-600" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Bank Transfer</div>
                      <div className="text-sm text-muted-foreground">Transfer directly to our bank account</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Bank Transfer Instructions */}
              {formData.paymentMethod === 'bank' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Bank Transfer Details</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Bank: Equity Bank Kenya</div>
                    <div>Account Name: Your Church Name</div>
                    <div>Account Number: 1234567890</div>
                    <div>Branch: Main Branch</div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="bankReference" className="text-left text-blue-900">Bank Reference *</Label>
                    <Input
                      id="bankReference"
                      name="bankReference"
                      value={formData.bankReference || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter bank transaction reference"
                      className="bg-white border-blue-300 text-foreground focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
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
                Processing Payment...
              </>
            ) : (
              `Donate Ksh ${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}`
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
