'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DonationFormPesapal from '@/components/donation/donation-form-pesapal';

interface DonationDialogPesapalProps {
  children: React.ReactNode;
}

export function DonationDialogPesapal({ children }: DonationDialogPesapalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-accent text-center">
            Make a Donation
          </DialogTitle>
          <DialogDescription className="text-center">
            Your generous contribution helps support our church's mission and ministries.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <DonationFormPesapal />
        </div>
      </DialogContent>
    </Dialog>
  );
}
