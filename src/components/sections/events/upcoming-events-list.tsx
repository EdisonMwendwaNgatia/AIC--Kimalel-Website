'use client';

import { useState } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Calendar, Clock, User, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Event } from "@/lib/supabase/events";
import RSVPModal from './rsvp-modal';

interface UpcomingEventsListProps {
  initialEvents: Event[];
}

export default function UpcomingEventsList({ initialEvents }: UpcomingEventsListProps) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Show first 6 events by default, or all if showAllEvents is true
  const displayedEvents = showAllEvents ? initialEvents : initialEvents.slice(0, 6);
  
  // If no upcoming events found
  if (!initialEvents.length) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-white mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              No upcoming events scheduled. Check back soon for new events!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const toggleShowAllEvents = () => {
    setShowAllEvents(!showAllEvents);
  };

  const handleRSVPClick = (event: Event) => {
    setSelectedEvent(event);
    setRsvpModalOpen(true);
  };

  const handleCloseRSVPModal = () => {
    setRsvpModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-white mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join us for our upcoming gatherings, worship services, and community events.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedEvents.map((event) => {
              const eventImage = PlaceHolderImages.find(p => p.id === event.image_id);
              const eventDate = new Date(event.date);
              const isToday = new Date().toDateString() === eventDate.toDateString();
              
              return (
                <Card 
                  key={event.id} 
                  className="overflow-hidden group bg-gray-800/50 border-accent/20 border backdrop-blur-sm text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:shadow-accent/20"
                >
                  <div className="relative aspect-[16/9]">
                    {eventImage && (
                      <Image
                        src={eventImage.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={eventImage.imageHint}
                      />
                    )}
                    {isToday && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Today
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-bold font-headline text-xl text-accent mb-3 line-clamp-2 min-h-[3.5rem]">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 text-gray-300 text-sm mb-4">
                      {/* Date */}
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>
                          {eventDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>
                          {eventDate.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </span>
                      </div>
                      
                      {/* Ministry */}
                      {event.ministry && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="truncate">{event.ministry}</span>
                        </div>
                      )}
                      
                      {/* Location */}
                      {event.location && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 min-h-[4rem]">
                      {event.description}
                    </p>
                    
                    <Button 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full transition-shadow hover:shadow-lg hover:glow-gold"
                      onClick={() => handleRSVPClick(event)}
                    >
                      RSVP Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Show More/Less Button - Only show if there are more than 6 events */}
          {initialEvents.length > 6 && (
            <div className="text-center mt-12">
              <Button 
                onClick={toggleShowAllEvents}
                size="lg" 
                variant="outline" 
                className="rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 group"
              >
                {showAllEvents ? (
                  <>
                    Show Less
                    <ChevronUp className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                  </>
                ) : (
                  <>
                    View All Events ({initialEvents.length})
                    <ChevronDown className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-1" />
                  </>
                )}
              </Button>
              
              {/* Event count indicator */}
              <p className="text-gray-400 text-sm mt-4">
                Showing {displayedEvents.length} of {initialEvents.length} upcoming events
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RSVP Modal */}
      <RSVPModal 
        isOpen={rsvpModalOpen}
        onClose={handleCloseRSVPModal}
        event={selectedEvent}
      />
    </>
  );
}
