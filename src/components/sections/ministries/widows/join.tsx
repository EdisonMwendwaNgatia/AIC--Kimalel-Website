'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { handleMinistrySignup } from '@/app/ministries/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-shadow hover:shadow-lg hover:glow-gold">
      {pending ? 'Submitting...' : 'Join Widows Ministry'}
    </Button>
  );
}

export default function WidowsMinistryJoin() {
  const [state, formAction] = useActionState(handleMinistrySignup, { message: '', success: false });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Signup Successful!" : "Signup Failed",
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);
  
  return (
    <section className="py-20 bg-highlight">
      <div className="section-divider mb-20"></div>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold font-headline text-white mb-4">
    Find Support and Community
        </h2>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          Join our Widows Ministry for fellowship, support, and spiritual growth in a caring community.
        </p>
        <form action={formAction} className="max-w-2xl mx-auto mt-8 space-y-6">
          <input type="hidden" name="ministry" value="Widows Ministry" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="fullName"
              placeholder="Full Name"
              required
              className="bg-card border-border text-foreground focus:ring-accent"
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className="bg-card border-border text-foreground focus:ring-accent"
            />
          </div>
          
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="bg-card border-border text-foreground focus:ring-accent"
          />
          
          <Input
            name="address"
            placeholder="Address (optional)"
            className="bg-card border-border text-foreground focus:ring-accent"
          />
          
          <div className="pt-4">
            <SubmitButton />
          </div>
        </form>
      </div>
    </section>
  );
}
