import { getPastEvents } from "@/lib/supabase/events";
import PastEvents from "./past-events";

export default async function PastEventsWrapper() {
  const pastEvents = await getPastEvents(12); // Fetch past events for gallery

  return <PastEvents initialEvents={pastEvents} />;
}
