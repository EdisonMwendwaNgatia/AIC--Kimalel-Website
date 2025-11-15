import { getUpcomingEventsForBuild } from "@/lib/supabase/server-data";
import UpcomingEventsList from "./upcoming-events-list";

export default async function UpcomingEventsWrapper() {
  const upcomingEvents = await getUpcomingEventsForBuild(50); 

  return <UpcomingEventsList initialEvents={upcomingEvents} />;
}
