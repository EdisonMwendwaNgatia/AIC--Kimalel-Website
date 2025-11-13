'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import MinistrySignupModal from './ministry-signup-modal';

export default function MinistriesCta() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ctaImage = PlaceHolderImages.find(p => p.id === 'ministry-highlight');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <section className="py-20">
        <div className="section-divider mb-20"></div>
        <div className="container mx-auto px-4">
          <div className="relative rounded-lg overflow-hidden text-white text-center p-12 flex flex-col items-center justify-center min-h-[300px]">
            {ctaImage && (
              <Image
                src={ctaImage.imageUrl}
                alt={ctaImage.description}
                fill
                className="object-cover"
                data-ai-hint={ctaImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-primary/70"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold font-headline mb-4">
                Every gift matters. Every person belongs. Join a ministry today.
              </h2>
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:glow-gold"
                onClick={handleOpenModal}
              >
                Join a Ministry
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MinistrySignupModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
