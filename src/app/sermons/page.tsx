import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SermonsHero from '@/components/sections/sermons-hero';
import SermonsContent from '@/components/sections/sermons-content';

export default function SermonsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <SermonsHero />
        <SermonsContent />
      </main>
      <Footer />
    </div>
  );
}
