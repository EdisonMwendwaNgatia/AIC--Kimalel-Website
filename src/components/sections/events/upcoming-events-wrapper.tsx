import { getUpcomingEvents } from "@/lib/supabase/events";
import UpcomingEventsList from "./upcoming-events-list";

export default async function UpcomingEventsWrapper() {
  const upcomingEvents = await getUpcomingEvents(50); // Fetch all upcoming events

  return <UpcomingEventsList initialEvents={upcomingEvents} />;
}
