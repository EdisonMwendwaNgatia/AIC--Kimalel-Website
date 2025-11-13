import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SermonAIChatTrigger } from './sermon-ai-chat';
import { getNextSermon, getLatestSermon } from '@/lib/supabase/sermons';

export default async function FeaturedSermon() {
  // Try to get next upcoming sermon, fallback to latest sermon
  let sermon = await getNextSermon();
  if (!sermon) {
    sermon = await getLatestSermon();
  }

  const sermonImage = PlaceHolderImages.find(p => p.id === 'sermon-thumbnail');

  // If no sermon found, don't render the section
  if (!sermon) {
    return null;
  }

  // Format the date for display
  const sermonDate = new Date(sermon.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <section id="sermons" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden shadow-lg border-none bg-card">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-video md:aspect-auto">
              {sermonImage && (
                <Image
                  src={sermonImage.imageUrl}
                  alt={sermon.title}
                  fill
                  className="object-cover"
                  data-ai-hint={sermonImage.imageHint}
                />
              )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  {sermon.date > new Date().toISOString() ? 'Upcoming' : 'Latest'}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold font-headline text-primary mb-2">{sermon.title}</h3>
              <p className="text-muted-foreground mb-4">
                {sermon.preacher} • {sermonDate}
              </p>
              <p className="mb-6 text-foreground">{sermon.description}</p>
              <div className="flex flex-wrap gap-4">
                {sermon.media_url ? (
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-shadow hover:shadow-lg hover:glow-gold" asChild>
                    <a href={sermon.media_url} target="_blank" rel="noopener noreferrer">
                      {sermon.date > new Date().toISOString() ? 'Set Reminder' : 'Watch Sermon'}
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-shadow hover:shadow-lg hover:glow-gold" disabled>
                    {sermon.date > new Date().toISOString() ? 'Coming Soon' : 'Recording Available Soon'}
                  </Button>
                )}
                <SermonAIChatTrigger sermonTranscript={sermon.description} />
              </div>
              {sermon.tags && sermon.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {sermon.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
