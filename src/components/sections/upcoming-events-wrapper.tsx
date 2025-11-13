import { getUpcomingEvents } from "@/lib/supabase/events";
import UpcomingEventsList from "@/components/sections/upcoming-events-wrapper";

export default async function UpcomingEventsWrapper() {
  const upcomingEvents = await getUpcomingEvents(50); // Fetch more events for the expandable list

  // If no upcoming events found, don't render the section
  if (!upcomingEvents.length) {
    return null;
  }

  return <UpcomingEventsList initialEvents={upcomingEvents} />;
}
