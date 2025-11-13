import { getLatestSermons, getPreachers, getSermonTags } from '@/lib/supabase/sermons';
import SermonsGrid from '@/components/sections/sermons-grid';

export default async function SermonsContent() {
  // Fetch all sermons for the sermons page (you can adjust the limit as needed)
  const [sermons, preachers, tags] = await Promise.all([
    getLatestSermons(50), // Fetch more sermons for the dedicated page
    getPreachers(),
    getSermonTags()
  ]);

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">
            All Sermons
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse through our complete collection of sermons. Filter by pastor, topic, or date to find messages that speak to you.
          </p>
        </div>

        <SermonsGrid 
          initialSermons={sermons}
          preachers={preachers}
          tags={tags}
        />
      </div>
    </section>
  );
}
