'use client';

import { useState } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Calendar, User, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Event } from "@/lib/supabase/events";

interface PastEventsProps {
  initialEvents: Event[];
}

export default function PastEvents({ initialEvents }: PastEventsProps) {
  const [showAllGallery, setShowAllGallery] = useState(false);
  
  // Show first 6 events in gallery by default, or all if showAllGallery is true
  const displayedGalleryEvents = showAllGallery ? initialEvents : initialEvents.slice(0, 6);
  
  // Show first 3 events in the featured grid
  const featuredEvents = initialEvents.slice(0, 3);

  // If no past events found
  if (!initialEvents.length) {
    return (
      <section className="py-20">
        <div className="section-divider mb-20"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-black mb-4">
              Past Events
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No past events to display yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const toggleShowAllGallery = () => {
    setShowAllGallery(!showAllGallery);
  };

  return (
    <section className="py-20 bg-secondary">
      <div className="section-divider mb-20"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">
            Past Events Highlights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Relive the memorable moments from our previous gatherings and celebrations.
          </p>
        </div>
        
        {/* Featured Past Events Grid */}
        {featuredEvents.length > 0 && (
          <>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-headline text-accent mb-4">Recent Events</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {featuredEvents.map((event) => {
                const eventImage = PlaceHolderImages.find(p => p.id === event.image_id);
                const eventDate = new Date(event.date);
                
                return (
                  <div 
                    key={event.id} 
                    className="bg-card rounded-lg overflow-hidden border border-accent/20 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-video">
                      {eventImage && (
                        <Image
                          src={eventImage.imageUrl}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline text-lg text-accent mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {eventDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      {event.ministry && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <User className="w-4 h-4" />
                          <span>{event.ministry}</span>
                        </div>
                      )}
                      
                      <p className="text-foreground text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Event Gallery */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-headline text-primary mb-4">Event Gallery</h3>
          <p className="text-muted-foreground">
            Browse through photos from our past events and celebrations.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {displayedGalleryEvents.map((event) => {
            const image = PlaceHolderImages.find(p => p.id === event.image_id);
            if (!image) return null;
            
            return (
              <div 
                key={event.id} 
                className="relative aspect-square group overflow-hidden rounded-lg cursor-pointer"
              >
                <Image
                  src={image.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  data-ai-hint={image.imageHint}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <div className="text-white text-center">
                    <p className="font-semibold text-sm mb-1">{event.title}</p>
                    <p className="text-xs opacity-90">{image.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less Gallery Button */}
        {initialEvents.length > 6 && (
          <div className="text-center">
            <Button 
              onClick={toggleShowAllGallery}
              variant="outline" 
              className="rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 group"
            >
              {showAllGallery ? (
                <>
                  Show Less Gallery
                  <ChevronUp className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
                </>
              ) : (
                <>
                  View Full Gallery ({initialEvents.length} photos)
                  <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
