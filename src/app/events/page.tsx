import EventsHero from '@/components/sections/events/hero';
import UpcomingEventsWrapper from '@/components/sections/events/upcoming-events-wrapper';
import PastEventsWrapper from '@/components/sections/events/past-events-wrapper';
import EventRsvp from '@/components/sections/events/rsvp';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function EventsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <EventsHero />
        <UpcomingEventsWrapper />
        <PastEventsWrapper />
      </main>
      <Footer />
    </div>
  );
}
