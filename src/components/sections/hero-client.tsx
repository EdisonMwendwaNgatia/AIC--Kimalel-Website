'use client';

import dynamic from 'next/dynamic';

// Dynamically import Hero with no SSR
const Hero = dynamic(() => import('./hero'), {
  ssr: false,
});

export default function HeroClient() {
  return <Hero />;
}
