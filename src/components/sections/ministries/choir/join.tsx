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
      {pending ? 'Submitting...' : 'Join Worship Team'}
    </Button>
  );
}

export default function ChoirJoin() {
  const [state, formAction] = useActionState(handleMinistrySignup, { message: '', success: false });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Signup Received!" : "Signup Failed",
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);
  
  return (
    <section className="py-20">
      <div className="section-divider mb-20"></div>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold font-headline text-white mb-4">
          Have a heart for worship? We invite you to audition.
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Use your musical gifts to glorify God and lead the congregation in worship.
        </p>
        <form action={formAction} className="max-w-2xl mx-auto mt-8 space-y-6">
          <input type="hidden" name="ministry" value="Choir & Worship Team" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="fullName"
              placeholder="Full Name"
              required
              className="bg-gray-800 border-gray-700 text-white focus:ring-accent placeholder-gray-400"
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className="bg-gray-800 border-gray-700 text-white focus:ring-accent placeholder-gray-400"
            />
          </div>
          
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="bg-gray-800 border-gray-700 text-white focus:ring-accent placeholder-gray-400"
          />
          
          <Input
            name="instrument"
            placeholder="Instrument or Vocal Range (optional)"
            className="bg-gray-800 border-gray-700 text-white focus:ring-accent placeholder-gray-400"
          />
          
          <div className="pt-4">
            <SubmitButton />
          </div>
        </form>
      </div>
    </section>
  );
}
