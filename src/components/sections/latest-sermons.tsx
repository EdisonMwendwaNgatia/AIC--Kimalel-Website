import { getLatestSermons, getPreachers, getSermonTags } from "@/lib/supabase/sermons";
import LatestSermonsClient from "./latest-sermons-client";

export default async function LatestSermons() {
  // Fetch initial data from database - only get 3 sermons
  const [sermons, preachers, tags] = await Promise.all([
    getLatestSermons(3), // Changed from 6 to 3
    getPreachers(),
    getSermonTags()
  ]);

  // If no sermons found, don't render the section
  if (!sermons.length) {
    return null;
  }

  return (
    <LatestSermonsClient 
      initialSermons={sermons}
      initialPreachers={preachers}
      initialTags={tags}
    />
  );
}
